import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { createCouponSchema } from '@bharatstore/shared/schemas';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.MARKETING_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (search) {
      where.code = { contains: search, mode: 'insensitive' };
    }
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    const coupons = await tenantDb.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: {
          select: { id: true, name: true, status: true },
        },
        _count: {
          select: { redemptions: true, orders: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: coupons });
  } catch (error: any) {
    console.error('Fetch coupons error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.MARKETING_WRITE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = auth.tenantId;
    const body = await request.json();
    const parsed = createCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      campaignId,
      promotionRuleId,
      code,
      discountType,
      discountValue,
      targetType,
      targetIds,
      minOrderValue,
      maxDiscount,
      validFrom,
      validUntil,
      usageLimit,
      perCustomerLimit,
      isActive,
    } = parsed.data;

    const normalizedCode = code.trim().toUpperCase();

    // Tenant-scoped uniqueness check
    const existing = await prisma.coupon.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: normalizedCode,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Coupon code "${normalizedCode}" already exists for this tenant` },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        tenantId,
        campaignId: campaignId || null,
        promotionRuleId: promotionRuleId || null,
        code: normalizedCode,
        discountType,
        discountValue,
        targetType,
        targetIds,
        minOrderValue,
        maxDiscount: maxDiscount !== undefined ? maxDiscount : null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        usageLimit: usageLimit !== undefined ? usageLimit : null,
        perCustomerLimit: perCustomerLimit !== undefined ? perCustomerLimit : null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail || 'unknown',
        action: 'coupon:create',
        resourceType: 'coupon',
        resourceId: coupon.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        afterState: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
      },
    });

    return NextResponse.json({ success: true, data: coupon });
  } catch (error: any) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create coupon' }, { status: 500 });
  }
}
