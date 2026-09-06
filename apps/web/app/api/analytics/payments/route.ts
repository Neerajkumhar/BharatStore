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

    const payments = await tenantDb.payment.findMany({
      where: {
        createdAt: { gte: currentStart, lte: currentEnd },
      },
    });

    const statusMap = new Map<string, { count: number; totalAmount: number }>();
    const gatewayMap = new Map<string, { count: number; totalAmount: number }>();

    payments.forEach((p) => {
      const amt = Number(p.amount);

      // Status
      const existingStatus = statusMap.get(p.status) || { count: 0, totalAmount: 0 };
      statusMap.set(p.status, {
        count: existingStatus.count + 1,
        totalAmount: existingStatus.totalAmount + amt,
      });

      // Gateway
      const existingGateway = gatewayMap.get(p.gateway) || { count: 0, totalAmount: 0 };
      gatewayMap.set(p.gateway, {
        count: existingGateway.count + 1,
        totalAmount: existingGateway.totalAmount + amt,
      });
    });

    const totalCollected = payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((acc, p) => acc + Number(p.amount), 0);

    return NextResponse.json({
      success: true,
      data: {
        totalCollected: Number(totalCollected.toFixed(2)),
        totalPaymentRecords: payments.length,
        statusBreakdown: Array.from(statusMap.entries()).map(([status, val]) => ({
          status,
          count: val.count,
          amount: Number(val.totalAmount.toFixed(2)),
        })),
        gatewayBreakdown: Array.from(gatewayMap.entries()).map(([gateway, val]) => ({
          gateway,
          count: val.count,
          amount: Number(val.totalAmount.toFixed(2)),
        })),
      },
    });
  } catch (error: any) {
    console.error('Fetch payment analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch payment analytics' }, { status: 500 });
  }
}
