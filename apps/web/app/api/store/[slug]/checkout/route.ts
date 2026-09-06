import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { calculateGstTaxSplit } from '@bharatstore/shared/utils';
import { validateCouponForCart } from '@/lib/marketing-engine';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 1. Resolve storefront tenant by slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: { storefrontTheme: true },
    });

    if (!tenant || !tenant.isActive) {
      return NextResponse.json({ error: 'Storefront not found or store is inactive' }, { status: 404 });
    }

    if (tenant.storefrontTheme && tenant.storefrontTheme.isPublished === false) {
      return NextResponse.json({ error: 'Storefront is currently offline' }, { status: 403 });
    }

    const tenantId = tenant.id;
    const body = await request.json();

    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      city,
      stateCode,
      pincode,
      gstin,
      paymentMethod,
      items,
      notes,
      couponCode,
    } = body;

    // 2. Validate customer & cart inputs
    if (!customerName || !customerPhone || !shippingAddress || !city || !stateCode || !pincode) {
      return NextResponse.json({ error: 'Missing required customer contact or delivery address fields' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart cannot be empty' }, { status: 400 });
    }

    // 3. Resolve or create Customer by phone number for this tenant
    let customer = await prisma.customer.findFirst({
      where: { tenantId, phone: customerPhone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          tenantId,
          name: customerName,
          phone: customerPhone,
          email: customerEmail || null,
          gstin: gstin || null,
        },
      });
    } else {
      if (customerEmail || gstin || customerName) {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: {
            ...(customerName && { name: customerName }),
            ...(customerEmail && { email: customerEmail }),
            ...(gstin && { gstin }),
          },
        });
      }
    }

    // 4. Execute atomic order transaction on existing engine
    const result = await prisma.$transaction(async (tx) => {
      // Fetch variants with tenant boundary check
      const variantIds = items.map((i: any) => i.variantId);
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds }, tenantId },
        include: { product: true },
      });

      if (variants.length !== items.length) {
        throw new Error('One or more requested product variants were not found or belong to another store');
      }

      // Revalidate stock & compute server-authoritative line details
      const itemDetails = items.map((itemInput: any) => {
        const variant = variants.find((v) => v.id === itemInput.variantId)!;
        if (!variant.product.isPublished) {
          throw new Error(`Product "${variant.product.title}" is no longer available`);
        }
        if (variant.currentStock < itemInput.quantity) {
          throw new Error(`Insufficient stock for ${variant.product.title} (${variant.variantName}). Only ${variant.currentStock} left in stock.`);
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

      // 5. Coupon validation & discount calculation (Server Authoritative)
      let discountTotal = 0;
      let appliedCoupon: any = null;
      let discountedItems = itemDetails;

      if (couponCode && typeof couponCode === 'string' && couponCode.trim().length > 0) {
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
          { customerId: customer.id, customerPhone: customer.phone }
        );

        if (!couponValidation.valid) {
          throw new Error(couponValidation.reason || 'Invalid coupon code');
        }

        appliedCoupon = couponValidation.coupon;
        discountTotal = couponValidation.discountAmount;

        // Apply discount proportionally to line subtotals before tax calculation
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

      // Recalculate GST Tax via GST engine on discounted prices
      const placeOfSupply = stateCode || tenant.stateCode;
      const taxCalc = calculateGstTaxSplit(discountedItems, tenant.stateCode, placeOfSupply);

      // Generate sequential order & invoice numbers
      const timestamp = Date.now().toString().slice(-6);
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const orderNumber = `BS-WEB-${timestamp}${randomSuffix}`;
      const invoiceNumber = `INV-WEB-${timestamp}${randomSuffix}`;

      const validMethod = ['CASH', 'UPI_DIRECT', 'RAZORPAY', 'KHATA_CREDIT'].includes(paymentMethod) ? paymentMethod : 'CASH';
      const isPaid = validMethod === 'CASH' || validMethod === 'UPI_DIRECT' || validMethod === 'RAZORPAY';
      const paymentStatus = isPaid ? 'PAID' : 'UNPAID';

      // Create Order in existing table with STOREFRONT channel
      const order = await tx.order.create({
        data: {
          tenantId,
          orderNumber,
          customerId: customer.id,
          couponId: appliedCoupon ? appliedCoupon.id : null,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          channel: 'STOREFRONT',
          status: 'CONFIRMED',
          paymentStatus,
          subtotal: taxCalc.subtotal,
          discountTotal,
          taxTotal: taxCalc.taxTotal,
          grandTotal: taxCalc.grandTotal,
          notes: notes ? `Online Order (${shippingAddress}, ${city}, ${pincode}): ${notes}` : `Online Store Order (${shippingAddress}, ${city}, ${pincode})`,
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

        await tx.couponRedemption.create({
          data: {
            tenantId,
            couponId: appliedCoupon.id,
            orderId: order.id,
            customerId: customer.id,
            customerPhone: customer.phone,
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

      // Create OrderItems & decrement stock atomically with guard
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
            notes: `Storefront Web Checkout Order ${orderNumber}`,
          },
        });
      }

      // Create Payment record in existing payment architecture
      const paymentGateway = validMethod === 'UPI_DIRECT'
        ? 'UPI_DIRECT'
        : validMethod === 'CASH'
        ? 'CASH'
        : validMethod === 'RAZORPAY'
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

      // Create Tax Invoice
      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          orderId: order.id,
          invoiceNumber,
          invoiceType: tenant.isCompositeScheme ? 'BILL_OF_SUPPLY' : 'TAX_INVOICE',
          supplierGstin: tenant.gstin || '09AAECR1234F1Z5',
          placeOfSupply,
          totalCgst: taxCalc.cgstTotal,
          totalSgst: taxCalc.sgstTotal,
          totalIgst: taxCalc.igstTotal,
          grandTotal: taxCalc.grandTotal,
        },
      });

      // Debit Khata if credit purchase
      if (validMethod === 'KHATA_CREDIT') {
        const updatedCustomer = await tx.customer.update({
          where: { id: customer.id },
          data: { currentBalance: { increment: taxCalc.grandTotal } },
        });

        await tx.khataLedger.create({
          data: {
            tenantId,
            customerId: customer.id,
            orderId: order.id,
            type: 'DEBIT_CREDIT_GIVEN',
            amount: taxCalc.grandTotal,
            balanceAfter: Number(updatedCustomer.currentBalance),
            notes: `Online Store Checkout Order ${orderNumber}`,
          },
        });
      }

      return { order, invoice, payment, customer, taxCalc };
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: result.order.id,
        orderNumber: result.order.orderNumber,
        grandTotal: Number(result.order.grandTotal),
        paymentStatus: result.order.paymentStatus,
        invoiceNumber: result.invoice.invoiceNumber,
        customerName: result.customer.name,
      },
    });
  } catch (error: any) {
    console.error('Public storefront checkout error:', error);
    return NextResponse.json({ error: error.message || 'Failed to complete online checkout' }, { status: 400 });
  }
}
