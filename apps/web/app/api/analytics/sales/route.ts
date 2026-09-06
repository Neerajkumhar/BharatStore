import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { getAnalyticsDateRange } from '@bharatstore/shared/utils';

async function getActiveTenantId(request: Request): Promise<string> {
  const headerTenantId = request.headers.get('x-tenant-id');
  if (headerTenantId) return headerTenantId;

  const firstTenant = await prisma.tenant.findFirst();
  if (!firstTenant) {
    throw new Error('No active tenant found in system');
  }
  return firstTenant.id;
}

export async function GET(request: Request) {
  try {
    const tenantId = await getActiveTenantId(request);
    const tenantDb = getTenantDb(tenantId);

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const { currentStart, currentEnd } = getAnalyticsDateRange(range, startDate, endDate);

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

    // 1. Group sales by Date (Daily trend)
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

    // 2. Sales by Channel
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

    // 3. Sales by Payment Method
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

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: Number(orders.reduce((acc, o) => acc + Number(o.grandTotal), 0).toFixed(2)),
        totalOrders: orders.length,
        totalUnits: orders.reduce((acc, o) => acc + o.items.reduce((sum, i) => sum + i.quantity, 0), 0),
        salesTrend,
        salesByChannel,
        salesByPaymentMethod,
      },
    });
  } catch (error: any) {
    console.error('Fetch sales analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch sales analytics' }, { status: 500 });
  }
}
