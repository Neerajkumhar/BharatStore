import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { validateCouponSchema } from '@bharatstore/shared/schemas';
import { validateCouponForCart } from '@/lib/marketing-engine';

export async function POST(request: Request) {
  try {
    const headerTenantId = request.headers.get('x-tenant-id');
    const body = await request.json();

    const tenantSlug = body.tenantSlug;
    let tenantId = headerTenantId;

    if (!tenantId && tenantSlug) {
      const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
      if (tenant) tenantId = tenant.id;
    }

    if (!tenantId) {
      // Fallback lookup if not passed in header
      const firstTenant = await prisma.tenant.findFirst();
      if (!firstTenant) {
        return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 });
      }
      tenantId = firstTenant.id;
    }

    const parsed = validateCouponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { code, items, customerPhone, customerId } = parsed.data;

    // Fetch variant details for cart items
    const variantIds = items.map((i) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds }, tenantId },
      include: { product: true },
    });

    const cartItemsForCoupon = items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId);
      const unitPrice = variant?.priceOverride ? Number(variant.priceOverride) : Number(variant?.product.sellingPrice || 0);

      return {
        variantId: item.variantId,
        productId: variant?.productId || '',
        categoryId: variant?.product.categoryId || '',
        title: variant?.product.title || 'Product',
        quantity: item.quantity,
        unitPrice,
      };
    });

    const validation = await validateCouponForCart(
      tenantId,
      code,
      cartItemsForCoupon,
      { customerId, customerPhone }
    );

    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        valid: false,
        reason: validation.reason,
        discountAmount: 0,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      discountAmount: validation.discountAmount,
      coupon: {
        id: validation.coupon.id,
        code: validation.coupon.code,
        discountType: validation.coupon.discountType,
        discountValue: Number(validation.coupon.discountValue),
      },
    });
  } catch (error: any) {
    console.error('Validate coupon error:', error);
    return NextResponse.json({ error: error.message || 'Failed to validate coupon' }, { status: 500 });
  }
}
