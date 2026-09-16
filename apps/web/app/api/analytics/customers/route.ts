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

    const { currentStart, currentEnd, periodLabel } = getAnalyticsDateRange(range, startDate, endDate);

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

    let newCustomers = 0;
    let returningCustomers = 0;

    const customerPerformance = allCustomers.map((c) => {
      const isNew = new Date(c.createdAt) >= currentStart && new Date(c.createdAt) <= currentEnd;
      if (isNew) newCustomers++;

      const totalSpend = c.orders.reduce((acc, o) => acc + Number(o.grandTotal), 0);
      const orderCount = c.orders.length;

      if (orderCount > 1) returningCustomers++;

      const lastOrder = c.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      const daysSinceLastOrder = lastOrder
        ? (Date.now() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        : Infinity;

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        gstin: c.gstin,
        totalSpend: Number(totalSpend.toFixed(2)),
        orderCount,
        currentBalance: Number(c.currentBalance),
        isNew,
        daysSinceLastOrder,
      };
    });

    const totalCustomers = customerPerformance.length;
    const avgLtv = totalCustomers > 0
      ? Number((customerPerformance.reduce((acc, c) => acc + c.totalSpend, 0) / totalCustomers).toFixed(2))
      : 0;
    const repeatPurchaseRate = totalCustomers > 0
      ? Number(((returningCustomers / totalCustomers) * 100).toFixed(1))
      : 0;

    const topSpenders = [...customerPerformance]
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 10)
      .map(({ isNew: _isNew, daysSinceLastOrder: _days, ...spender }) => spender);

    // RFM-inspired segments: champions, loyal, new buyers, at risk
    const segments = {
      champions: customerPerformance.filter((c) => c.orderCount >= 4 && c.totalSpend >= 20000),
      loyal: customerPerformance.filter((c) => c.orderCount >= 2 && c.orderCount < 4 && c.totalSpend >= 5000),
      newBuyers: customerPerformance.filter((c) => c.isNew),
      atRisk: customerPerformance.filter((c) => c.daysSinceLastOrder > 90),
    };

    // LTV tiers
    const tiers: { min: number; max: number; range: string }[] = [
      { min: 0, max: 5000, range: '₹0 – ₹5K' },
      { min: 5000, max: 20000, range: '₹5K – ₹20K' },
      { min: 20000, max: 50000, range: '₹20K – ₹50K' },
      { min: 50000, max: 100000, range: '₹50K – ₹1L' },
      { min: 100000, max: Infinity, range: '₹1L+' },
    ];
    const ltvDistribution = tiers.map((t) => ({
      range: t.range,
      count: customerPerformance.filter((c) => c.totalSpend >= t.min && c.totalSpend < t.max).length,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        newCustomers,
        returningCustomers,
        repeatPurchaseRate,
        avgLtv,
        ltvDistribution,
        topSpenders,
        segments,
        periodLabel,
      },
    });
  } catch (error: any) {
    console.error('Fetch customer analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch customer analytics' }, { status: 500 });
  }
}