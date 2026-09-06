import { NextResponse } from 'next/server';
import { getTenantDb } from '@bharatstore/database';
import { getAnalyticsDateRange } from '@bharatstore/shared/utils';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.SETTINGS_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const { currentStart, currentEnd } = getAnalyticsDateRange(range, startDate, endDate);

    const [allCustomers, periodOrders] = await Promise.all([
      tenantDb.customer.findMany({
        include: {
          orders: {
            where: { status: { not: 'CANCELLED' } },
          },
        },
      }),
      tenantDb.order.findMany({
        where: {
          createdAt: { gte: currentStart, lte: currentEnd },
          status: { not: 'CANCELLED' },
        },
      }),
    ]);

    let newCustomersCount = 0;
    let returningCustomersCount = 0;
    let highValueCount = 0;
    let inactiveCount = 0;

    const customerPerformance = allCustomers.map((c) => {
      const isNew = new Date(c.createdAt) >= currentStart && new Date(c.createdAt) <= currentEnd;
      if (isNew) newCustomersCount++;

      const ltv = c.orders.reduce((acc, o) => acc + Number(o.grandTotal), 0);
      const ordersCount = c.orders.length;

      if (ordersCount > 1) returningCustomersCount++;
      if (ltv >= 20000) highValueCount++;

      const lastOrder = c.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      const daysSinceLastOrder = lastOrder
        ? (Date.now() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        : 999;

      if (daysSinceLastOrder > 90) inactiveCount++;

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        gstin: c.gstin,
        ltv: Number(ltv.toFixed(2)),
        ordersCount,
        currentBalance: Number(c.currentBalance),
        segment: ltv >= 20000 ? 'High Value' : isNew ? 'New' : ordersCount > 1 ? 'Returning' : 'Standard',
      };
    });

    const topCustomers = [...customerPerformance].sort((a, b) => b.ltv - a.ltv).slice(0, 10);
    const avgLtv = allCustomers.length > 0
      ? customerPerformance.reduce((acc, c) => acc + c.ltv, 0) / allCustomers.length
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalCustomers: allCustomers.length,
          newCustomers: newCustomersCount,
          returningCustomers: returningCustomersCount,
          highValueCustomers: highValueCount,
          inactiveCustomers: inactiveCount,
          averageLtv: Number(avgLtv.toFixed(2)),
        },
        topCustomers,
      },
    });
  } catch (error: any) {
    console.error('Fetch customer analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch customer analytics' }, { status: 500 });
  }
}
