import { prisma } from '@bharatstore/database';

export interface CartItemForCoupon {
  variantId: string;
  productId: string;
  categoryId: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface CouponValidationResult {
  valid: boolean;
  reason?: string;
  coupon?: any;
  discountAmount: number;
  eligibleSubtotal: number;
  grossSubtotal: number;
}

export async function validateCouponForCart(
  tenantId: string,
  rawCode: string,
  cartItems: CartItemForCoupon[],
  customerInfo?: { customerId?: string; customerPhone?: string }
): Promise<CouponValidationResult> {
  const normalizedCode = rawCode.trim().toUpperCase();

  // 1. Fetch coupon with tenant boundary isolation
  const coupon = await prisma.coupon.findUnique({
    where: {
      tenantId_code: {
        tenantId,
        code: normalizedCode,
      },
    },
    include: {
      campaign: true,
    },
  });

  if (!coupon) {
    return { valid: false, reason: 'Invalid coupon code', discountAmount: 0, eligibleSubtotal: 0, grossSubtotal: 0 };
  }

  if (!coupon.isActive) {
    return { valid: false, reason: 'Coupon is inactive', discountAmount: 0, eligibleSubtotal: 0, grossSubtotal: 0 };
  }

  // 2. Check campaign status if linked
  if (coupon.campaign && coupon.campaign.status !== 'ACTIVE') {
    return { valid: false, reason: `Associated campaign is ${coupon.campaign.status.toLowerCase()}`, discountAmount: 0, eligibleSubtotal: 0, grossSubtotal: 0 };
  }

  // 3. Date window check
  const now = new Date();
  if (now < new Date(coupon.validFrom)) {
    return { valid: false, reason: 'Coupon is not yet active', discountAmount: 0, eligibleSubtotal: 0, grossSubtotal: 0 };
  }

  if (now > new Date(coupon.validUntil)) {
    return { valid: false, reason: 'Coupon has expired', discountAmount: 0, eligibleSubtotal: 0, grossSubtotal: 0 };
  }

  // 4. Global usage limit check
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, reason: 'Coupon maximum redemption limit reached', discountAmount: 0, eligibleSubtotal: 0, grossSubtotal: 0 };
  }

  // 5. Per-customer usage limit check
  if (coupon.perCustomerLimit !== null && (customerInfo?.customerId || customerInfo?.customerPhone)) {
    const previousRedemptions = await prisma.couponRedemption.count({
      where: {
        tenantId,
        couponId: coupon.id,
        OR: [
          ...(customerInfo.customerId ? [{ customerId: customerInfo.customerId }] : []),
          ...(customerInfo.customerPhone ? [{ customerPhone: customerInfo.customerPhone }] : []),
        ],
      },
    });

    if (previousRedemptions >= coupon.perCustomerLimit) {
      return { valid: false, reason: 'You have reached your limit for this coupon', discountAmount: 0, eligibleSubtotal: 0, grossSubtotal: 0 };
    }
  }

  // 6. Gross cart subtotal & minimum order value check
  const grossSubtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const minOrderValue = Number(coupon.minOrderValue);

  if (grossSubtotal < minOrderValue) {
    return {
      valid: false,
      reason: `Minimum order value of ₹${minOrderValue.toLocaleString('en-IN')} required for this coupon`,
      discountAmount: 0,
      eligibleSubtotal: 0,
      grossSubtotal,
    };
  }

  // 7. Targeting eligibility check (ALL_PRODUCTS / SELECTED_PRODUCTS / SELECTED_CATEGORIES)
  let eligibleItems = cartItems;
  if (coupon.targetType === 'SELECTED_PRODUCTS' && coupon.targetIds.length > 0) {
    const targetSet = new Set(coupon.targetIds);
    eligibleItems = cartItems.filter((i) => targetSet.has(i.productId));
  } else if (coupon.targetType === 'SELECTED_CATEGORIES' && coupon.targetIds.length > 0) {
    const targetSet = new Set(coupon.targetIds);
    eligibleItems = cartItems.filter((i) => targetSet.has(i.categoryId));
  }

  if (eligibleItems.length === 0) {
    return {
      valid: false,
      reason: 'Cart does not contain any products eligible for this coupon',
      discountAmount: 0,
      eligibleSubtotal: 0,
      grossSubtotal,
    };
  }

  const eligibleSubtotal = eligibleItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  // 8. Discount Amount Calculation
  let rawDiscount = 0;
  const discountVal = Number(coupon.discountValue);

  if (coupon.discountType === 'PERCENTAGE') {
    rawDiscount = (eligibleSubtotal * discountVal) / 100;
    if (coupon.maxDiscount !== null) {
      const maxDisc = Number(coupon.maxDiscount);
      rawDiscount = Math.min(rawDiscount, maxDisc);
    }
  } else {
    // FLAT_AMOUNT
    rawDiscount = Math.min(discountVal, eligibleSubtotal);
  }

  // Discount cannot exceed gross cart subtotal
  const discountAmount = Number(Math.min(rawDiscount, grossSubtotal).toFixed(2));

  return {
    valid: true,
    coupon,
    discountAmount,
    eligibleSubtotal,
    grossSubtotal,
  };
}
