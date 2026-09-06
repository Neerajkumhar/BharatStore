import { NextResponse } from 'next/server';
import { getTenantDb } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.MARKETING_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const [
      activeCampaignsCount,
      activeCouponsCount,
      redemptions,
      attributedOrders,
      topCoupons,
    ] = await Promise.all([
      tenantDb.campaign.count({ where: { status: 'ACTIVE' } }),
      tenantDb.coupon.count({ where: { isActive: true } }),
      tenantDb.couponRedemption.findMany(),
      tenantDb.order.findMany({
        where: {
          couponId: { not: null },
          status: { not: 'CANCELLED' },
        },
        select: {
          grandTotal: true,
          discountTotal: true,
        },
      }),
      tenantDb.coupon.findMany({
        take: 10,
        orderBy: { usageCount: 'desc' },
        include: {
          _count: {
            select: { redemptions: true, orders: true },
          },
        },
      }),
    ]);

    const totalRedemptions = redemptions.length;
    const totalDiscountGiven = redemptions.reduce((acc, r) => acc + Number(r.discountAmount), 0);
    const attributedRevenue = attributedOrders.reduce((acc, o) => acc + Number(o.grandTotal), 0);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          activeCampaignsCount,
          activeCouponsCount,
          totalRedemptions,
          totalDiscountGiven: Number(totalDiscountGiven.toFixed(2)),
          attributedRevenue: Number(attributedRevenue.toFixed(2)),
          attributedOrdersCount: attributedOrders.length,
        },
        topCoupons: topCoupons.map((c) => ({
          id: c.id,
          code: c.code,
          discountType: c.discountType,
          discountValue: Number(c.discountValue),
          usageCount: c.usageCount,
          usageLimit: c.usageLimit,
          isActive: c.isActive,
        })),
      },
    });
  } catch (error: any) {
    console.error('Fetch marketing analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch marketing analytics' }, { status: 500 });
  }
}
