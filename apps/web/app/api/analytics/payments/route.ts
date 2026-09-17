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

    const payments = await tenantDb.payment.findMany({
      where: {
        createdAt: { gte: currentStart, lte: currentEnd },
      },
      include: {
        order: { include: { customer: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const statusMap = new Map<string, { count: number; revenue: number }>();
    const methodMap = new Map<string, { count: number; revenue: number }>();

    payments.forEach((p) => {
      const amt = Number(p.amount);

      const existingStatus = statusMap.get(p.status) || { count: 0, revenue: 0 };
      statusMap.set(p.status, {
        count: existingStatus.count + 1,
        revenue: existingStatus.revenue + amt,
      });

      const existingMethod = methodMap.get(p.gateway) || { count: 0, revenue: 0 };
      methodMap.set(p.gateway, {
        count: existingMethod.count + 1,
        revenue: existingMethod.revenue + amt,
      });
    });

    const successful = payments.filter((p) => p.status === 'SUCCESS');
    const totalCollectedRevenue = successful.reduce((acc, p) => acc + Number(p.amount), 0);

    const statusBreakdown: Record<string, { count: number; revenue: number }> = {};
    statusMap.forEach((val, status) => {
      statusBreakdown[status] = { count: val.count, revenue: Number(val.revenue.toFixed(2)) };
    });

    const methodBreakdown: Record<string, { count: number; revenue: number }> = {};
    methodMap.forEach((val, gateway) => {
      methodBreakdown[gateway] = { count: val.count, revenue: Number(val.revenue.toFixed(2)) };
    });

    const recentPayments = payments.slice(0, 15).map((p) => ({
      id: p.id,
      paymentNumber: `${p.id.slice(0, 8)}…${p.id.slice(-4)}`,
      orderNumber: p.order?.orderNumber || '—',
      customerName: p.order?.customer?.name || 'Walk-in',
      method: p.gateway,
      amount: Number(p.amount),
      status: p.status,
      createdAt: p.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalCollectedRevenue: Number(totalCollectedRevenue.toFixed(2)),
        completedCount: successful.length,
        failedCount: payments.filter((p) => p.status === 'FAILED').length,
        refundedCount: payments.filter((p) => p.status === 'REFUNDED').length,
        methodBreakdown,
        statusBreakdown,
        recentPayments,
        periodLabel,
      },
    });
  } catch (error: any) {
    console.error('Fetch payment analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch payment analytics' }, { status: 500 });
  }
}