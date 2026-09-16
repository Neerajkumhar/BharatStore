import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { createOrderSchema } from '@bharatstore/shared/schemas';
import { calculateGstTaxSplit } from '@bharatstore/shared/utils';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';
import { validateCouponForCart } from '@/lib/marketing-engine';
import { enforcePlanLimit, recordUsage } from '@/lib/plan-enforcement';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.ORDERS_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

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
    const auth = await authorizeRequest(request, PERMISSIONS.ORDERS_CREATE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = auth.tenantId;
    const userId = auth.userId || null;

    const limitViolation = await enforcePlanLimit(tenantId, 'orders');
    if (limitViolation) return limitViolation;

    const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });

    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { customerId, channel, items, paymentMethod, notes, placeOfSupply } = parsed.data;
    const couponCode = body.couponCode;

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

      // 3. Coupon validation & discount calculation
      let discountTotal = 0;
      let appliedCoupon: any = null;
      let discountedItems = itemDetails;

      if (couponCode && typeof couponCode === 'string' && couponCode.trim().length > 0) {
        const customer = customerId ? await tx.customer.findUnique({ where: { id: customerId } }) : null;
        const cartItemsForCoupon = itemDetails.map((detail) => ({
          variantId: detail.variant.id,
          productId: detail.variant.productId,
          categoryId: detail.variant.product.categoryId,
          title: detail.variant.product.title,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
        }));

        const couponValidation = await validateCouponForCart(
          tenantId,
          couponCode,
          cartItemsForCoupon,
          { customerId: customer?.id, customerPhone: customer?.phone }
        );

        if (!couponValidation.valid) {
          throw new Error(couponValidation.reason || 'Invalid coupon code');
        }

        appliedCoupon = couponValidation.coupon;
        discountTotal = couponValidation.discountAmount;

        if (discountTotal > 0 && couponValidation.eligibleSubtotal > 0) {
          discountedItems = itemDetails.map((detail) => {
            const lineSubtotal = detail.unitPrice * detail.quantity;
            const isEligible =
              appliedCoupon.targetType === 'ALL_PRODUCTS' ||
              (appliedCoupon.targetType === 'SELECTED_PRODUCTS' && appliedCoupon.targetIds.includes(detail.variant.productId)) ||
              (appliedCoupon.targetType === 'SELECTED_CATEGORIES' && appliedCoupon.targetIds.includes(detail.variant.product.categoryId));

            if (!isEligible) return detail;

            const lineDiscount = Number(((lineSubtotal / couponValidation.eligibleSubtotal) * discountTotal).toFixed(2));
            const discountedUnitPrice = Math.max(0, Number(((lineSubtotal - lineDiscount) / detail.quantity).toFixed(2)));

            return {
              ...detail,
              unitPrice: discountedUnitPrice,
            };
          });
        }
      }

      // 4. Compute tax totals via calculation engine on discounted line prices
      const taxCalc = calculateGstTaxSplit(discountedItems, tenant.stateCode, placeOfSupply || tenant.stateCode);

      // 5. Generate sequential IDs
      const timestamp = Date.now().toString().slice(-6);
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const orderNumber = `BS-2026-${timestamp}${randomSuffix}`;
      const invoiceNumber = `INV-2026-${timestamp}${randomSuffix}`;

      const isPaid = paymentMethod === 'CASH' || paymentMethod === 'UPI_DIRECT' || paymentMethod === 'RAZORPAY';
      const paymentStatus = isPaid ? 'PAID' : paymentMethod === 'KHATA_CREDIT' ? 'UNPAID' : 'UNPAID';

      // 6. Create Order
      const order = await tx.order.create({
        data: {
          tenantId,
          orderNumber,
          customerId: customerId || null,
          couponId: appliedCoupon ? appliedCoupon.id : null,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          channel,
          status: 'CONFIRMED',
          paymentStatus,
          subtotal: taxCalc.subtotal,
          discountTotal,
          taxTotal: taxCalc.taxTotal,
          grandTotal: taxCalc.grandTotal,
          notes: notes || null,
        },
      });

      // Atomically update Coupon usage count and log redemption
      if (appliedCoupon) {
        if (appliedCoupon.usageLimit !== null) {
          const incRes = await tx.coupon.updateMany({
            where: { id: appliedCoupon.id, tenantId, usageCount: { lt: appliedCoupon.usageLimit } },
            data: { usageCount: { increment: 1 } },
          });
          if (incRes.count === 0) {
            throw new Error('Coupon usage limit reached during checkout');
          }
        } else {
          await tx.coupon.update({
            where: { id: appliedCoupon.id },
            data: { usageCount: { increment: 1 } },
          });
        }

        const customerObj = customerId ? await tx.customer.findUnique({ where: { id: customerId } }) : null;
        await tx.couponRedemption.create({
          data: {
            tenantId,
            couponId: appliedCoupon.id,
            orderId: order.id,
            customerId: customerId || null,
            customerPhone: customerObj?.phone || null,
            discountAmount: discountTotal,
          },
        });

        if (appliedCoupon.campaignId) {
          await tx.campaign.update({
            where: { id: appliedCoupon.campaignId },
            data: { usageCount: { increment: 1 } },
          });
        }
      }

      // 7. Create OrderItems & Decrement Stock atomically
      for (const detail of discountedItems) {
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

        // Double-entry inventory SALE log & atomic stock decrement guard
        const updateRes = await tx.productVariant.updateMany({
          where: { id: detail.variant.id, tenantId, currentStock: { gte: detail.quantity } },
          data: { currentStock: { decrement: detail.quantity } },
        });

        if (updateRes.count === 0) {
          throw new Error(`Insufficient stock for ${detail.variant.product.title} (${detail.variant.variantName})`);
        }

        const updatedVariant = await tx.productVariant.findUniqueOrThrow({ where: { id: detail.variant.id } });

        await tx.inventoryLedger.create({
          data: {
            tenantId,
            variantId: detail.variant.id,
            changeQuantity: -detail.quantity,
            balanceAfter: updatedVariant.currentStock,
            eventType: 'SALE',
            referenceId: orderNumber,
            notes: `POS Sale Order ${orderNumber}`,
            createdById: userId,
          },
        });
      }

      // 8. Create Payment record
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

      // 9. Create Tax Invoice
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

      // 10. Log Khata Debit if customer purchased on credit
      if (paymentMethod === 'KHATA_CREDIT' && customerId) {
        const updatedCustomer = await tx.customer.update({
          where: { id: customerId },
          data: { currentBalance: { increment: taxCalc.grandTotal } },
        });

        await tx.khataLedger.create({
          data: {
            tenantId,
            customerId,
            orderId: order.id,
            type: 'DEBIT_CREDIT_GIVEN',
            amount: taxCalc.grandTotal,
            balanceAfter: Number(updatedCustomer.currentBalance),
            notes: `Store Purchase Order ${orderNumber}`,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: userId,
          actorEmail: auth.userEmail || 'unknown',
          action: 'order:create',
          resourceType: 'order',
          resourceId: order.id,
          ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
          afterState: { orderNumber: order.orderNumber, grandTotal: order.grandTotal, discountTotal, channel },
        },
      });

      return { order, invoice, payment, taxCalc };
    });

    await recordUsage(tenantId, { ordersCount: 1 });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to complete checkout order' }, { status: 400 });
  }
}
