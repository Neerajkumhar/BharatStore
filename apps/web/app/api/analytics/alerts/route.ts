import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';

async function getActiveTenantId(request: Request): Promise<string> {
  const headerTenantId = request.headers.get('x-tenant-id');
  if (headerTenantId) return headerTenantId;

  const firstTenant = await prisma.tenant.findFirst();
  if (!firstTenant) {
    throw new Error('No active tenant found in system');
  }
  return firstTenant.id;
}

export interface BusinessAlert {
  id: string;
  type: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'HIGH_KHATA' | 'PENDING_ORDERS';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  count?: number;
  metadata?: Record<string, any>;
  actionUrl?: string;
}

export async function GET(request: Request) {
  try {
    const tenantId = await getActiveTenantId(request);
    const tenantDb = getTenantDb(tenantId);

    const [variants, customers, pendingOrders] = await Promise.all([
      tenantDb.productVariant.findMany({
        include: { product: true },
      }),
      tenantDb.customer.findMany({
        where: {
          currentBalance: { gt: 0 },
        },
      }),
      tenantDb.order.findMany({
        where: {
          status: { in: ['PENDING', 'CONFIRMED', 'PACKED'] },
        },
        include: { customer: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const alerts: BusinessAlert[] = [];

    // 1. Out of Stock Alerts
    const outOfStock = variants.filter((v) => v.currentStock === 0);
    if (outOfStock.length > 0) {
      alerts.push({
        id: 'alert-out-of-stock',
        type: 'OUT_OF_STOCK',
        severity: 'critical',
        title: `${outOfStock.length} Product${outOfStock.length > 1 ? 's' : ''} Out of Stock`,
        message: `${outOfStock.map((v) => `${v.product.title} (${v.variantName})`).slice(0, 3).join(', ')}${outOfStock.length > 3 ? ` and ${outOfStock.length - 3} more` : ''}`,
        count: outOfStock.length,
        actionUrl: '/inventory',
        metadata: { items: outOfStock.map((v) => ({ id: v.id, name: `${v.product.title} - ${v.variantName}`, sku: v.sku })) },
      });
    }

    // 2. Low Stock Alerts
    const lowStock = variants.filter((v) => v.currentStock > 0 && v.currentStock <= v.lowStockAlert);
    if (lowStock.length > 0) {
      alerts.push({
        id: 'alert-low-stock',
        type: 'LOW_STOCK',
        severity: 'warning',
        title: `${lowStock.length} Product${lowStock.length > 1 ? 's' : ''} Running Low`,
        message: `${lowStock.map((v) => `${v.product.title} (${v.variantName}: ${v.currentStock} left)`).slice(0, 3).join(', ')}${lowStock.length > 3 ? ` and ${lowStock.length - 3} more` : ''}`,
        count: lowStock.length,
        actionUrl: '/inventory',
        metadata: { items: lowStock.map((v) => ({ id: v.id, name: `${v.product.title} - ${v.variantName}`, currentStock: v.currentStock, threshold: v.lowStockAlert })) },
      });
    }

    // 3. High Khata Credit Alerts
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
        severity: highKhataCustomers.some((c) => Number(c.creditLimit) > 0 && Number(c.currentBalance) >= Number(c.creditLimit)) ? 'critical' : 'warning',
        title: `${highKhataCustomers.length} Customer${highKhataCustomers.length > 1 ? 's' : ''} High Khata Credit`,
        message: `Total ₹${totalOutstanding.toLocaleString('en-IN')} outstanding across ${highKhataCustomers.length} high-credit customer accounts.`,
        count: highKhataCustomers.length,
        actionUrl: '/khata',
        metadata: { customers: highKhataCustomers.map((c) => ({ id: c.id, name: c.name, phone: c.phone, balance: Number(c.currentBalance), creditLimit: Number(c.creditLimit) })) },
      });
    }

    // 4. Pending / Unfulfilled Orders Alerts
    if (pendingOrders.length > 0) {
      alerts.push({
        id: 'alert-pending-orders',
        type: 'PENDING_ORDERS',
        severity: pendingOrders.length > 5 ? 'warning' : 'info',
        title: `${pendingOrders.length} Order${pendingOrders.length > 1 ? 's' : ''} Awaiting Fulfillment`,
        message: `${pendingOrders.length} active order${pendingOrders.length > 1 ? 's are' : ' is'} currently pending processing or packing.`,
        count: pendingOrders.length,
        actionUrl: '/orders',
        metadata: { orders: pendingOrders.map((o) => ({ id: o.id, orderNumber: o.orderNumber, status: o.status, amount: Number(o.grandTotal) })) },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalAlerts: alerts.length,
        criticalCount: alerts.filter((a) => a.severity === 'critical').length,
        warningCount: alerts.filter((a) => a.severity === 'warning').length,
        infoCount: alerts.filter((a) => a.severity === 'info').length,
        alerts,
      },
    });
  } catch (error: any) {
    console.error('Fetch analytics alerts error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch analytics alerts' }, { status: 500 });
  }
}
