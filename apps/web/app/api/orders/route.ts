import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { createOrderSchema } from '@bharatstore/shared/schemas';
import { calculateGstTaxSplit } from '@bharatstore/shared/utils';

async function getActiveTenant(request: Request) {
  const headerTenantId = request.headers.get('x-tenant-id');
  if (headerTenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: headerTenantId } });
    if (tenant) return tenant;
  }

  const firstTenant = await prisma.tenant.findFirst();
  if (!firstTenant) {
    throw new Error('No active tenant found in system');
  }
  return firstTenant;
}

export async function GET(request: Request) {
  try {
    const tenant = await getActiveTenant(request);
    const tenantDb = getTenantDb(tenant.id);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status');
    const channel = searchParams.get('channel');

    const where: any = {};
    if (status) where.status = status;
    if (channel) where.channel = channel;

    const [orders, total] = await Promise.all([
      tenantDb.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: true,
          payments: true,
          invoices: true,
        },
      }),
      tenantDb.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tenant = await getActiveTenant(request);
    const tenantId = tenant.id;
    const userId = request.headers.get('x-user-id') || null;

    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { customerId, channel, items, paymentMethod, paymentAmount, notes, placeOfSupply } = parsed.data;

    // Execute atomic order transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch requested variants
      const variantIds = items.map((i) => i.variantId);
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds }, tenantId },
        include: { product: true },
      });

      if (variants.length !== items.length) {
        throw new Error('One or more requested product variants were not found');
      }

      // 2. Validate stock & prepare line calculations
      const itemDetails = items.map((itemInput) => {
        const variant = variants.find((v) => v.id === itemInput.variantId)!;
        if (variant.currentStock < itemInput.quantity) {
          throw new Error(`Insufficient stock for ${variant.product.title} (${variant.variantName}). Available: ${variant.currentStock}, Requested: ${itemInput.quantity}`);
        }
        const unitPrice = variant.priceOverride ? Number(variant.priceOverride) : Number(variant.product.sellingPrice);
        const gstRate = Number(variant.product.gstRate);
        const hsnCode = variant.product.hsnCode;

        return {
          variant,
          quantity: itemInput.quantity,
          unitPrice,
          gstRate,
          hsnCode,
        };
      });

      // 3. Compute tax totals via calculation engine
      const taxCalc = calculateGstTaxSplit(itemDetails, tenant.stateCode, placeOfSupply || tenant.stateCode);

      // 4. Generate sequential IDs
      const timestamp = Date.now().toString().slice(-6);
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const orderNumber = `BS-2026-${timestamp}${randomSuffix}`;
      const invoiceNumber = `INV-2026-${timestamp}${randomSuffix}`;

      const isPaid = paymentMethod === 'CASH' || paymentMethod === 'UPI_DIRECT' || paymentMethod === 'RAZORPAY';
      const paymentStatus = isPaid ? 'PAID' : paymentMethod === 'KHATA_CREDIT' ? 'UNPAID' : 'UNPAID';

      // 5. Create Order
      const order = await tx.order.create({
        data: {
          tenantId,
          orderNumber,
          customerId: customerId || null,
          channel,
          status: 'CONFIRMED',
          paymentStatus,
          subtotal: taxCalc.subtotal,
          taxTotal: taxCalc.taxTotal,
          grandTotal: taxCalc.grandTotal,
          notes: notes || null,
        },
      });

      // 6. Create OrderItems & Decrement Stock
      for (const detail of itemDetails) {
        const lineSubtotal = detail.unitPrice * detail.quantity;
        const lineTax = (lineSubtotal * detail.gstRate) / 100;
        const cgst = taxCalc.isInterstate ? 0 : lineTax / 2;
        const sgst = taxCalc.isInterstate ? 0 : lineTax / 2;
        const igst = taxCalc.isInterstate ? lineTax : 0;

        await tx.orderItem.create({
          data: {
            tenantId,
            orderId: order.id,
            variantId: detail.variant.id,
            productTitle: detail.variant.product.title,
            sku: detail.variant.sku,
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            hsnCode: detail.hsnCode,
            gstRate: detail.gstRate,
            cgstAmount: cgst,
            sgstAmount: sgst,
            igstAmount: igst,
            lineTotal: lineSubtotal + lineTax,
          },
        });

        // Double-entry inventory SALE log & atomic stock decrement
        const newStock = detail.variant.currentStock - detail.quantity;
        await tx.productVariant.update({
          where: { id: detail.variant.id },
          data: { currentStock: newStock },
        });

        await tx.inventoryLedger.create({
          data: {
            tenantId,
            variantId: detail.variant.id,
            changeQuantity: -detail.quantity,
            balanceAfter: newStock,
            eventType: 'SALE',
            referenceId: orderNumber,
            notes: `POS Sale Order ${orderNumber}`,
            createdById: userId,
          },
        });
      }

      // 7. Create Payment record
      const paymentGateway = paymentMethod === 'UPI_DIRECT'
        ? 'UPI_DIRECT'
        : paymentMethod === 'CASH'
        ? 'CASH'
        : paymentMethod === 'RAZORPAY'
        ? 'RAZORPAY'
        : 'MANUAL';

      const payment = await tx.payment.create({
        data: {
          tenantId,
          orderId: order.id,
          amount: taxCalc.grandTotal,
          gateway: paymentGateway,
          status: isPaid ? 'SUCCESS' : 'INITIATED',
        },
      });

      // 8. Create Tax Invoice
      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          orderId: order.id,
          invoiceNumber,
          invoiceType: tenant.isCompositeScheme ? 'BILL_OF_SUPPLY' : 'TAX_INVOICE',
          supplierGstin: tenant.gstin || '09AAECR1234F1Z5',
          placeOfSupply: placeOfSupply || tenant.stateCode,
          totalCgst: taxCalc.cgstTotal,
          totalSgst: taxCalc.sgstTotal,
          totalIgst: taxCalc.igstTotal,
          grandTotal: taxCalc.grandTotal,
        },
      });

      // 9. Log Khata Debit if customer purchased on credit
      if (paymentMethod === 'KHATA_CREDIT' && customerId) {
        const customer = await tx.customer.findUniqueOrThrow({ where: { id: customerId } });
        const newBalance = Number(customer.currentBalance) + taxCalc.grandTotal;

        await tx.customer.update({
          where: { id: customerId },
          data: { currentBalance: newBalance },
        });

        await tx.khataLedger.create({
          data: {
            tenantId,
            customerId,
            orderId: order.id,
            type: 'DEBIT_CREDIT_GIVEN',
            amount: taxCalc.grandTotal,
            balanceAfter: newBalance,
            notes: `Store Purchase Order ${orderNumber}`,
          },
        });
      }

      return { order, invoice, payment, taxCalc };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to complete checkout order' }, { status: 400 });
  }
}
