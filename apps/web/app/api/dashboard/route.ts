import { NextResponse } from 'next/server';
import { getTenantDb } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { getAnalyticsDateRange } from '@bharatstore/shared/utils';
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

    const { currentStart, currentEnd, periodLabel } = getAnalyticsDateRange(range);

    const [todayStartOrders, activeOrders, recentOrders, variants, customers] = await Promise.all([
      tenantDb.order.findMany({
        where: {
          createdAt: { gte: currentStart, lte: currentEnd },
          status: { not: 'CANCELLED' },
        },
      }),
      tenantDb.order.findMany({
        where: {
          status: { in: ['PENDING', 'CONFIRMED', 'PACKED', 'DISPATCHED'] },
        },
      }),
      tenantDb.order.findMany({
        where: {
          status: { not: 'CANCELLED' },
        },
        include: {
          customer: true,
          items: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      tenantDb.productVariant.findMany({
        include: { product: true },
      }),
      tenantDb.customer.findMany(),
    ]);

    const todayOrderCount = todayStartOrders.length;
    const todayRevenue = todayStartOrders.reduce((acc, o) => acc + Number(o.grandTotal), 0);

    const activeOrderCount = activeOrders.length;

    const lowStockVariants = variants.filter((v) => v.currentStock > 0 && v.currentStock <= v.lowStockAlert);
    const outOfStockVariants = variants.filter((v) => v.currentStock === 0);

    const khataReceivable = customers.reduce((acc, c) => acc + Math.max(0, Number(c.currentBalance)), 0);
    const khataDebtors = customers.filter((c) => Number(c.currentBalance) > 0).length;

    const alerts: Array<{
      id: string;
      type: string;
      severity: 'critical' | 'warning' | 'info';
      title: string;
      message: string;
      count?: number;
      actionUrl?: string;
    }> = [];

    if (outOfStockVariants.length > 0) {
      alerts.push({
        id: 'alert-out-of-stock',
        type: 'OUT_OF_STOCK',
        severity: 'critical',
        title: `${outOfStockVariants.length} Product${outOfStockVariants.length > 1 ? 's' : ''} Out of Stock`,
        message: `${outOfStockVariants.map((v) => `${v.product.title} (${v.variantName})`).slice(0, 3).join(', ')}${outOfStockVariants.length > 3 ? ` and ${outOfStockVariants.length - 3} more` : ''}`,
        count: outOfStockVariants.length,
        actionUrl: '/inventory',
      });
    }

    if (lowStockVariants.length > 0) {
      alerts.push({
        id: 'alert-low-stock',
        type: 'LOW_STOCK',
        severity: 'warning',
        title: `${lowStockVariants.length} Product${lowStockVariants.length > 1 ? 's' : ''} Running Low`,
        message: `${lowStockVariants.map((v) => `${v.product.title} (${v.variantName}: ${v.currentStock} left)`).slice(0, 3).join(', ')}${lowStockVariants.length > 3 ? ` and ${lowStockVariants.length - 3} more` : ''}`,
        count: lowStockVariants.length,
        actionUrl: '/inventory',
      });
    }

    const highKhataCustomers = customers.filter((c) => {
      const balance = Number(c.currentBalance);
      const limit = Number(c.creditLimit);
      return (limit > 0 && balance >= limit * 0.8) || balance >= 5000;
    });

    if (highKhataCustomers.length > 0) {
      const totalOutstanding = highKhataCustomers.reduce((acc, c) => acc + Number(c.currentBalance), 0);
      alerts.push({
        id: 'alert-high-khata',
        type: 'HIGH_KHATA',
        severity: 'warning',
        title: `${highKhataCustomers.length} Customer${highKhataCustomers.length > 1 ? 's' : ''} High Khata Credit`,
        message: `Total ₹${totalOutstanding.toLocaleString('en-IN')} outstanding across ${highKhataCustomers.length} high-credit customer accounts.`,
        count: highKhataCustomers.length,
        actionUrl: '/customers',
      });
    }

    if (activeOrderCount > 0) {
      alerts.push({
        id: 'alert-pending-orders',
        type: 'PENDING_ORDERS',
        severity: activeOrderCount > 5 ? 'warning' : 'info',
        title: `${activeOrderCount} Order${activeOrderCount > 1 ? 's' : ''} Awaiting Fulfillment`,
        message: `${activeOrderCount} active order${activeOrderCount > 1 ? 's are' : ' is'} currently pending processing or packing.`,
        count: activeOrderCount,
        actionUrl: '/orders',
      });
    }

    const recentOrderItems = recentOrders.map((o) => {
      const firstItem = o.items[0];
      const itemSummary = firstItem
        ? `${firstItem.productTitle}${o.items.length > 1 ? ` +${o.items.length - 1} more` : ''}`
        : '—';
      const payment = o.payments[0];

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customer?.name || 'Walk-in',
        phone: o.customer?.phone || '—',
        itemSummary,
        total: Number(o.grandTotal),
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: payment?.gateway || (o.paymentStatus === 'PAID' ? 'CASH' : ''),
        createdAt: o.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        periodLabel,
        generatedAt: new Date().toISOString(),
        kpis: {
          todayRevenue: Number(todayRevenue.toFixed(2)),
          todayOrderCount,
          activeOrders: activeOrderCount,
          lowStockCount: lowStockVariants.length,
          outOfStockCount: outOfStockVariants.length,
          khataReceivable: Number(khataReceivable.toFixed(2)),
          khataDebtors,
        },
        recentOrders: recentOrderItems,
        alerts,
      },
    });
  } catch (error: any) {
    console.error('Fetch dashboard data error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch dashboard data' }, { status: 500 });
  }
}