import { NextResponse } from 'next/server';
import { getTenantDb } from '@bharatstore/database';
import { getAnalyticsDateRange, calculatePercentageChange } from '@bharatstore/shared/utils';
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

    const { currentStart, currentEnd, previousStart, previousEnd, periodLabel } = getAnalyticsDateRange(
      range,
      startDate,
      endDate
    );

    // Query current period orders
    const currentOrders = await tenantDb.order.findMany({
      where: {
        createdAt: { gte: currentStart, lte: currentEnd },
        status: { not: 'CANCELLED' },
      },
      include: {
        items: true,
      },
    });

    // Query previous period orders
    const previousOrders = await tenantDb.order.findMany({
      where: {
        createdAt: { gte: previousStart, lte: previousEnd },
        status: { not: 'CANCELLED' },
      },
      include: {
        items: true,
      },
    });

    // Aggregations Current
    const currentRevenue = currentOrders.reduce((acc, o) => acc + Number(o.grandTotal), 0);
    const currentOrderCount = currentOrders.length;
    const currentAov = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
    const currentItemsSold = currentOrders.reduce(
      (acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0),
      0
    );

    // Aggregations Previous
    const previousRevenue = previousOrders.reduce((acc, o) => acc + Number(o.grandTotal), 0);
    const previousOrderCount = previousOrders.length;
    const previousAov = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;
    const previousItemsSold = previousOrders.reduce(
      (acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0),
      0
    );

    // Khata & Customers
    const [customers, allCustomers] = await Promise.all([
      tenantDb.customer.findMany({
        where: {
          orders: {
            some: {
              createdAt: { gte: currentStart, lte: currentEnd },
            },
          },
        },
      }),
      tenantDb.customer.findMany(),
    ]);

    const totalOutstandingKhata = allCustomers.reduce((acc, c) => acc + Math.max(0, Number(c.currentBalance)), 0);

    return NextResponse.json({
      success: true,
      data: {
        periodLabel,
        dateRange: {
          currentStart,
          currentEnd,
        },
        kpis: {
          revenue: {
            value: Number(currentRevenue.toFixed(2)),
            previousValue: Number(previousRevenue.toFixed(2)),
            changePercent: calculatePercentageChange(currentRevenue, previousRevenue),
          },
          orders: {
            value: currentOrderCount,
            previousValue: previousOrderCount,
            changePercent: calculatePercentageChange(currentOrderCount, previousOrderCount),
          },
          aov: {
            value: Number(currentAov.toFixed(2)),
            previousValue: Number(previousAov.toFixed(2)),
            changePercent: calculatePercentageChange(currentAov, previousAov),
          },
          customers: {
            value: customers.length,
            totalRegistered: allCustomers.length,
          },
          outstandingKhata: {
            value: Number(totalOutstandingKhata.toFixed(2)),
          },
          itemsSold: {
            value: currentItemsSold,
            previousValue: previousItemsSold,
            changePercent: calculatePercentageChange(currentItemsSold, previousItemsSold),
          },
        },
      },
    });
  } catch (error: any) {
    console.error('Fetch analytics overview error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch analytics overview' }, { status: 500 });
  }
}
