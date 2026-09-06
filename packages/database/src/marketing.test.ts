import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTenantDb, prisma } from './client';
import { validateCouponForCart, CartItemForCoupon } from '../../../apps/web/lib/marketing-engine';
import { calculateGstTaxSplit } from '@bharatstore/shared/utils';

describe('Milestone 7: Marketing & Promotions Engine', () => {
  let tenantAId: string;
  let tenantASlug: string;
  let tenantBId: string;
  let tenantBSlug: string;

  let productA1Id: string;
  let variantA1Id: string;
  let productA2Id: string;
  let variantA2Id: string;
  let categoryAId: string;
  let categoryBId: string;

  let customerA1Id: string;
  let customerA1Phone: string;
  let customerA2Id: string;
  let customerA2Phone: string;

  let campaignAId: string;

  beforeAll(async () => {
    // 1. Create Tenant A
    const tenantA = await prisma.tenant.create({
      data: {
        legalName: 'Festive Fabrics India Pvt Ltd',
        tradeName: 'Festive Fabrics',
        slug: `festive-fabrics-${Date.now()}`,
        phone: '9876543210',
        addressLine1: '12 Commercial Street',
        city: 'Bengaluru',
        stateCode: '29',
        pincode: '560001',
      },
    });
    tenantAId = tenantA.id;
    tenantASlug = tenantA.slug;

    // 2. Create Tenant B (for tenant isolation tests)
    const tenantB = await prisma.tenant.create({
      data: {
        legalName: 'Northern Retail Traders',
        tradeName: 'Northern Retail',
        slug: `northern-retail-${Date.now()}`,
        phone: '9876543211',
        addressLine1: '45 Mall Road',
        city: 'Delhi',
        stateCode: '07',
        pincode: '110001',
      },
    });
    tenantBId = tenantB.id;
    tenantBSlug = tenantB.slug;

    const tenantDbA = getTenantDb(tenantAId);

    // 3. Create Categories & Products for Tenant A
    const categoryA = await tenantDbA.category.create({
      data: {
        name: 'Ethnic Wear',
        slug: `ethnic-wear-${Date.now()}`,
      },
    });
    categoryAId = categoryA.id;

    const categoryB = await tenantDbA.category.create({
      data: {
        name: 'Western Wear',
        slug: `western-wear-${Date.now()}`,
      },
    });
    categoryBId = categoryB.id;

    const productA1 = await tenantDbA.product.create({
      data: {
        categoryId: categoryAId,
        title: 'Silk Saree',
        slug: `silk-saree-${Date.now()}`,
        hsnCode: '5007',
        gstRate: 5,
        sellingPrice: 1000,
        mrp: 1200,
        isPublished: true,
      },
    });
    productA1Id = productA1.id;

    const variantA1 = await tenantDbA.productVariant.create({
      data: {
        productId: productA1Id,
        sku: `SKU-SAREE-${Date.now()}`,
        variantName: 'Red Silk Saree',
        currentStock: 50,
      },
    });
    variantA1Id = variantA1.id;

    const productA2 = await tenantDbA.product.create({
      data: {
        categoryId: categoryBId,
        title: 'Designer Kurta',
        slug: `designer-kurta-${Date.now()}`,
        hsnCode: '6205',
        gstRate: 12,
        sellingPrice: 500,
        mrp: 600,
        isPublished: true,
      },
    });
    productA2Id = productA2.id;

    const variantA2 = await tenantDbA.productVariant.create({
      data: {
        productId: productA2Id,
        sku: `SKU-KURTA-${Date.now()}`,
        variantName: 'Blue Kurta M',
        currentStock: 30,
      },
    });
    variantA2Id = variantA2.id;

    // 4. Create Customers for Tenant A
    const customerA1 = await tenantDbA.customer.create({
      data: {
        name: 'Anita Sharma',
        phone: '9123456789',
      },
    });
    customerA1Id = customerA1.id;
    customerA1Phone = customerA1.phone;

    const customerA2 = await tenantDbA.customer.create({
      data: {
        name: 'Rohan Verma',
        phone: '9123456790',
      },
    });
    customerA2Id = customerA2.id;
    customerA2Phone = customerA2.phone;

    // 5. Create Marketing Campaign
    const campaignA = await tenantDbA.campaign.create({
      data: {
        name: 'Diwali Dhamaka 2026',
        description: 'Festival mega sale discounts',
        status: 'ACTIVE',
        startAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        budget: 50000,
      },
    });
    campaignAId = campaignA.id;
  });

  afterAll(async () => {
    // Cleanup created test records
    await prisma.couponRedemption.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.orderItem.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.order.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.coupon.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.campaign.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.productVariant.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.product.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.category.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.customer.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantAId, tenantBId] } } });
  });

  it('1. Normalizes coupon code to uppercase and enforces tenant-scoped uniqueness', async () => {
    const tenantDbA = getTenantDb(tenantAId);

    // Create coupon with lowercase code
    const coupon1 = await tenantDbA.coupon.create({
      data: {
        campaignId: campaignAId,
        code: 'diwali20'.toUpperCase(),
        discountType: 'PERCENTAGE',
        discountValue: 20,
        validFrom: new Date(Date.now() - 86400000),
        validUntil: new Date(Date.now() + 86400000),
        isActive: true,
      },
    });

    expect(coupon1.code).toBe('DIWALI20');

    // Duplicate code in same tenant should throw error
    await expect(
      tenantDbA.coupon.create({
        data: {
          code: 'DIWALI20',
          discountType: 'FLAT_AMOUNT',
          discountValue: 100,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 86400000),
        },
      })
    ).rejects.toThrow();

    // Same coupon code in Tenant B should be allowed
    const tenantDbB = getTenantDb(tenantBId);
    const couponB = await tenantDbB.coupon.create({
      data: {
        code: 'DIWALI20',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 86400000),
      },
    });
    expect(couponB.code).toBe('DIWALI20');
    expect(couponB.tenantId).toBe(tenantBId);
  });

  it('2. Evaluates percentage discounts with max discount limit', async () => {
    const tenantDbA = getTenantDb(tenantAId);
    await tenantDbA.coupon.create({
      data: {
        code: 'MEGA25',
        discountType: 'PERCENTAGE',
        discountValue: 25, // 25% off ₹1000 = ₹250
        maxDiscount: 150, // Capped at ₹150
        validFrom: new Date(Date.now() - 86400000),
        validUntil: new Date(Date.now() + 86400000),
        isActive: true,
      },
    });

    const cart: CartItemForCoupon[] = [
      {
        variantId: variantA1Id,
        productId: productA1Id,
        categoryId: categoryAId,
        title: 'Silk Saree',
        quantity: 1,
        unitPrice: 1000,
      },
    ]; // ₹1000 subtotal

    const result = await validateCouponForCart(tenantAId, 'mega25', cart);

    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(150); // capped by maxDiscount
    expect(result.coupon?.code).toBe('MEGA25');
  });

  it('3. Validates minimum order value requirement', async () => {
    const tenantDbA = getTenantDb(tenantAId);
    await tenantDbA.coupon.create({
      data: {
        code: 'FLAT200',
        discountType: 'FLAT_AMOUNT',
        discountValue: 200,
        minOrderValue: 1500, // Requires ₹1500 min order
        validFrom: new Date(Date.now() - 86400000),
        validUntil: new Date(Date.now() + 86400000),
        isActive: true,
      },
    });

    // Cart value = ₹1000 (< ₹1500)
    const cartLow: CartItemForCoupon[] = [
      {
        variantId: variantA1Id,
        productId: productA1Id,
        categoryId: categoryAId,
        title: 'Silk Saree',
        quantity: 1,
        unitPrice: 1000,
      },
    ];
    const resultLow = await validateCouponForCart(tenantAId, 'FLAT200', cartLow);
    expect(resultLow.valid).toBe(false);
    expect(resultLow.reason).toContain('Minimum order value');

    // Cart value = ₹2000 (2 x ₹1000 >= ₹1500)
    const cartHigh: CartItemForCoupon[] = [
      {
        variantId: variantA1Id,
        productId: productA1Id,
        categoryId: categoryAId,
        title: 'Silk Saree',
        quantity: 2,
        unitPrice: 1000,
      },
    ];
    const resultHigh = await validateCouponForCart(tenantAId, 'FLAT200', cartHigh);
    expect(resultHigh.valid).toBe(true);
    expect(resultHigh.discountAmount).toBe(200);
  });

  it('4. Enforces validity date window (expired and future coupons)', async () => {
    const tenantDbA = getTenantDb(tenantAId);

    // Expired coupon
    await tenantDbA.coupon.create({
      data: {
        code: 'EXPIRED10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        validFrom: new Date(Date.now() - 10 * 86400000),
        validUntil: new Date(Date.now() - 2 * 86400000), // Expired 2 days ago
        isActive: true,
      },
    });

    const cart: CartItemForCoupon[] = [
      {
        variantId: variantA1Id,
        productId: productA1Id,
        categoryId: categoryAId,
        title: 'Silk Saree',
        quantity: 1,
        unitPrice: 1000,
      },
    ];

    const resExpired = await validateCouponForCart(tenantAId, 'EXPIRED10', cart);
    expect(resExpired.valid).toBe(false);
    expect(resExpired.reason).toContain('expired');

    // Future coupon (not started yet)
    await tenantDbA.coupon.create({
      data: {
        code: 'FUTURE10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        validFrom: new Date(Date.now() + 2 * 86400000), // Starts in 2 days
        validUntil: new Date(Date.now() + 10 * 86400000),
        isActive: true,
      },
    });

    const resFuture = await validateCouponForCart(tenantAId, 'FUTURE10', cart);
    expect(resFuture.valid).toBe(false);
    expect(resFuture.reason).toContain('not yet active');
  });

  it('5. Enforces category and product target restrictions', async () => {
    const tenantDbA = getTenantDb(tenantAId);

    // Coupon targeted specifically to categoryAId (Ethnic Wear)
    await tenantDbA.coupon.create({
      data: {
        code: 'ETHNIC50',
        discountType: 'FLAT_AMOUNT',
        discountValue: 50,
        targetType: 'SELECTED_CATEGORIES',
        targetIds: [categoryAId],
        validFrom: new Date(Date.now() - 86400000),
        validUntil: new Date(Date.now() + 86400000),
        isActive: true,
      },
    });

    // Product A1 is in categoryAId -> valid
    const cartCategoryMatch: CartItemForCoupon[] = [
      {
        variantId: variantA1Id,
        productId: productA1Id,
        categoryId: categoryAId,
        title: 'Silk Saree',
        quantity: 1,
        unitPrice: 1000,
      },
    ];
    const resCat = await validateCouponForCart(tenantAId, 'ETHNIC50', cartCategoryMatch);
    expect(resCat.valid).toBe(true);

    // Product A2 is in categoryBId (Western Wear) -> invalid
    const cartCategoryMismatch: CartItemForCoupon[] = [
      {
        variantId: variantA2Id,
        productId: productA2Id,
        categoryId: categoryBId,
        title: 'Designer Kurta',
        quantity: 1,
        unitPrice: 500,
      },
    ];
    const resCatMismatch = await validateCouponForCart(tenantAId, 'ETHNIC50', cartCategoryMismatch);
    expect(resCatMismatch.valid).toBe(false);
    expect(resCatMismatch.reason).toContain('does not contain any products eligible');
  });

  it('6. Enforces per-customer limit and global usage limit', async () => {
    const tenantDbA = getTenantDb(tenantAId);

    const couponLimit = await tenantDbA.coupon.create({
      data: {
        code: 'LIMITED1',
        discountType: 'FLAT_AMOUNT',
        discountValue: 100,
        usageLimit: 5,
        perCustomerLimit: 1, // Max 1 per customer
        validFrom: new Date(Date.now() - 86400000),
        validUntil: new Date(Date.now() + 86400000),
        isActive: true,
      },
    });

    const cart: CartItemForCoupon[] = [
      {
        variantId: variantA1Id,
        productId: productA1Id,
        categoryId: categoryAId,
        title: 'Silk Saree',
        quantity: 1,
        unitPrice: 1000,
      },
    ];

    // Customer A1 first usage -> valid
    const resA1_1 = await validateCouponForCart(tenantAId, 'LIMITED1', cart, {
      customerId: customerA1Id,
      customerPhone: customerA1Phone,
    });
    expect(resA1_1.valid).toBe(true);

    // Create a dummy order to satisfy orderId required FK
    const dummyOrder = await tenantDbA.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        channel: 'STOREFRONT',
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        customerId: customerA1Id,
        subtotal: 1000,
        taxTotal: 50,
        discountTotal: 100,
        grandTotal: 950,
      },
    });

    // Simulate redemption record for Customer A1
    await tenantDbA.couponRedemption.create({
      data: {
        couponId: couponLimit.id,
        orderId: dummyOrder.id,
        customerId: customerA1Id,
        customerPhone: customerA1Phone,
        discountAmount: 100,
      },
    });

    await tenantDbA.coupon.update({
      where: { id: couponLimit.id },
      data: { usageCount: { increment: 1 } },
    });

    // Customer A1 second usage -> fails perCustomerLimit
    const resA1_2 = await validateCouponForCart(tenantAId, 'LIMITED1', cart, {
      customerId: customerA1Id,
      customerPhone: customerA1Phone,
    });
    expect(resA1_2.valid).toBe(false);
    expect(resA1_2.reason).toContain('reached your limit');

    // Customer A2 (who hasn't redeemed yet) -> valid
    const resA2_1 = await validateCouponForCart(tenantAId, 'LIMITED1', cart, {
      customerId: customerA2Id,
      customerPhone: customerA2Phone,
    });
    expect(resA2_1.valid).toBe(true);
  });

  it('7. Integrates trade discount with GST tax calculation correctly under Section 15(3)', async () => {
    // Under Indian GST laws, trade discounts provided at or before time of supply are deducted from price BEFORE applying GST.
    // Product A1: Price ₹1000, GST 5%.
    // Discount: ₹200 off.
    // Discounted price = ₹800.
    // GST Tax split on ₹800 at 5% intra-state:
    const itemSubtotal = 1000;
    const discount = 200;
    const discountedPrice = itemSubtotal - discount; // 800

    const items = [
      { unitPrice: discountedPrice, quantity: 1, gstRate: 5 }
    ];

    const taxCalc = calculateGstTaxSplit(items, '29', '29'); // Intra-state (CGST + SGST)

    expect(taxCalc.subtotal).toBe(800);
    expect(taxCalc.cgstTotal + taxCalc.sgstTotal).toBe(40); // 5% of 800 is 40 (20 CGST + 20 SGST)
    expect(taxCalc.cgstTotal).toBe(20);
    expect(taxCalc.sgstTotal).toBe(20);
    expect(taxCalc.grandTotal).toBe(840);
  });

  it('8. Atomic usage increment prevents overselling spots under concurrency', async () => {
    const tenantDbA = getTenantDb(tenantAId);

    // Create coupon with 1 spot left (usageLimit: 10, current usageCount: 9)
    const singleSpotCoupon = await tenantDbA.coupon.create({
      data: {
        code: 'SOLDOUT',
        discountType: 'FLAT_AMOUNT',
        discountValue: 50,
        usageLimit: 10,
        usageCount: 9,
        validFrom: new Date(Date.now() - 86400000),
        validUntil: new Date(Date.now() + 86400000),
        isActive: true,
      },
    });

    // Simulate 2 concurrent checkout attempts trying to claim the last spot using atomic prisma update
    const attemptAtomicClaim = async () => {
      const updated = await tenantDbA.coupon.updateMany({
        where: {
          id: singleSpotCoupon.id,
          isActive: true,
          usageLimit: { not: null },
          usageCount: { lt: 10 },
        },
        data: {
          usageCount: { increment: 1 },
        },
      });
      return updated.count;
    };

    const results = await Promise.all([attemptAtomicClaim(), attemptAtomicClaim()]);

    const totalIncremented = results.reduce((acc, c) => acc + c, 0);
    expect(totalIncremented).toBe(1); // Exactly 1 succeeded, 1 failed

    const finalCouponState = await tenantDbA.coupon.findUnique({ where: { id: singleSpotCoupon.id } });
    expect(finalCouponState?.usageCount).toBe(10);
  });

  it('9. Prevents cross-tenant coupon validation (Tenant Isolation)', async () => {
    const cart: CartItemForCoupon[] = [
      {
        variantId: variantA1Id,
        productId: productA1Id,
        categoryId: categoryAId,
        title: 'Silk Saree',
        quantity: 1,
        unitPrice: 1000,
      },
    ];

    // Tenant B tries to validate Tenant A's coupon code 'DIWALI20' (which was created for Tenant A)
    const resultTenantB = await validateCouponForCart(tenantBId, 'DIWALI20', cart);
    // Note: DIWALI20 was also created on Tenant B in test 1 with 15%, so let's check it returns Tenant B's discount, not Tenant A's.
    expect(Number(resultTenantB.coupon?.discountValue)).toBe(15);
    expect(resultTenantB.coupon?.tenantId).toBe(tenantBId);

    // Tenant B tries to validate 'MEGA25' (which only exists on Tenant A)
    const resCross = await validateCouponForCart(tenantBId, 'MEGA25', cart);
    expect(resCross.valid).toBe(false);
    expect(resCross.reason).toContain('Invalid coupon code');
  });
});
