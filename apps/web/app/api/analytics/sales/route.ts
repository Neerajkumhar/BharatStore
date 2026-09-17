import { NextResponse } from 'next/server';
import { getTenantDb } from '@bharatstore/database';
import { getAnalyticsDateRange } from '@bharatstore/shared/utils';
import { authorizeRequest } from '@/lib/authorization';
import { requireFeature } from '@/lib/plan-enforcement';
import { PERMISSIONS, FEATURE_FLAGS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.SETTINGS_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const featureDenied = await requireFeature(auth.tenantId, FEATURE_FLAGS.ADVANCED_ANALYTICS);
    if (featureDenied) return featureDenied;

    const tenantDb = getTenantDb(auth.tenantId);

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const { currentStart, currentEnd, periodLabel } = getAnalyticsDateRange(range, startDate, endDate);

    const orders = await tenantDb.order.findMany({
      where: {
        createdAt: { gte: currentStart, lte: currentEnd },
        status: { not: 'CANCELLED' },
      },
      include: {
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const salesByDateMap = new Map<string, { revenue: number; orders: number; units: number }>();

    orders.forEach((o) => {
      const dateKey = new Date(o.createdAt).toISOString().split('T')[0];
      const existing = salesByDateMap.get(dateKey) || { revenue: 0, orders: 0, units: 0 };

      const orderRevenue = Number(o.grandTotal);
      const orderUnits = o.items.reduce((sum, item) => sum + item.quantity, 0);

      salesByDateMap.set(dateKey, {
        revenue: existing.revenue + orderRevenue,
        orders: existing.orders + 1,
        units: existing.units + orderUnits,
      });
    });

    const salesTrend = Array.from(salesByDateMap.entries()).map(([date, val]) => ({
      date,
      revenue: Number(val.revenue.toFixed(2)),
      orders: val.orders,
      units: val.units,
    }));

    const channelMap = new Map<string, { revenue: number; orders: number; units: number }>();
    orders.forEach((o) => {
      const ch = o.channel || 'STOREFRONT';
      const existing = channelMap.get(ch) || { revenue: 0, orders: 0, units: 0 };
      const orderRevenue = Number(o.grandTotal);
      const orderUnits = o.items.reduce((sum, item) => sum + item.quantity, 0);

      channelMap.set(ch, {
        revenue: existing.revenue + orderRevenue,
        orders: existing.orders + 1,
        units: existing.units + orderUnits,
      });
    });

    const salesByChannel = Array.from(channelMap.entries()).map(([channel, val]) => ({
      channel,
      revenue: Number(val.revenue.toFixed(2)),
      orders: val.orders,
      units: val.units,
    }));

    const paymentMap = new Map<string, { revenue: number; orders: number }>();
    orders.forEach((o) => {
      const pMethod = o.payments[0]?.gateway || (o.paymentStatus === 'PAID' ? 'CASH' : 'KHATA_CREDIT');
      const existing = paymentMap.get(pMethod) || { revenue: 0, orders: 0 };

      paymentMap.set(pMethod, {
        revenue: existing.revenue + Number(o.grandTotal),
        orders: existing.orders + 1,
      });
    });

    const salesByPaymentMethod = Array.from(paymentMap.entries()).map(([method, val]) => ({
      method,
      revenue: Number(val.revenue.toFixed(2)),
      orders: val.orders,
    }));

    const grossRevenue = Number(orders.reduce((acc, o) => acc + Number(o.grandTotal), 0).toFixed(2));
    const orderCount = orders.length;
    const avgOrderValue = orderCount > 0 ? Number((grossRevenue / orderCount).toFixed(2)) : 0;
    const itemsSold = orders.reduce((acc, o) => acc + o.items.reduce((sum, i) => sum + i.quantity, 0), 0);

    const totals = {
      grossRevenue,
      orderCount,
      avgOrderValue,
      itemsSold,
    };

    const dailySales = salesTrend;

    const channelBreakdown: Record<string, { revenue: number; orders: number; units: number }> = {};
    salesByChannel.forEach((c) => {
      channelBreakdown[c.channel] = { revenue: c.revenue, orders: c.orders, units: c.units };
    });

    const paymentMethodBreakdown: Record<string, { revenue: number; orders: number }> = {};
    salesByPaymentMethod.forEach((p) => {
      paymentMethodBreakdown[p.method] = { revenue: p.revenue, orders: p.orders };
    });

    return NextResponse.json({
      success: true,
      data: {
        periodLabel,
        totalRevenue: grossRevenue,
        totalOrders: orderCount,
        totalUnits: itemsSold,
        totals,
        salesTrend,
        dailySales,
        salesByChannel,
        channelBreakdown,
        salesByPaymentMethod,
        paymentMethodBreakdown,
      },
    });
  } catch (error: any) {
    console.error('Fetch sales analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch sales analytics' }, { status: 500 });
  }
}
