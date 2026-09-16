import { NextResponse } from 'next/server';
import { getTenantDb } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.ORDERS_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status');
    const gateway = searchParams.get('gateway');
    const search = searchParams.get('search');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (gateway && gateway !== 'ALL') where.gateway = gateway;
    if (search && search.trim().length > 0) {
      where.OR = [
        { order: { orderNumber: { contains: search.trim(), mode: 'insensitive' } } },
        { order: { customer: { name: { contains: search.trim(), mode: 'insensitive' } } } },
        { order: { customer: { phone: { contains: search.trim() } } } },
      ];
    }

    const [payments, total, byStatus] = await Promise.all([
      tenantDb.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            include: { customer: true },
          },
        },
      }),
      tenantDb.payment.count({ where }),
      tenantDb.payment.groupBy({ by: ['status'], _sum: { amount: true }, _count: true }),
    ]);

    const statusSummary = byStatus.map((row) => ({
      status: row.status,
      count: row._count,
      amount: row._sum.amount || 0,
    }));

    const findSummary = (s: string) =>
      statusSummary.find((row) => row.status === s) || { status: s, count: 0, amount: 0 };

    const summary = {
      collected: findSummary('SUCCESS').amount,
      collectedCount: findSummary('SUCCESS').count,
      pending: findSummary('INITIATED').amount,
      pendingCount: findSummary('INITIATED').count,
      failed: findSummary('FAILED').amount,
      failedCount: findSummary('FAILED').count,
      refunded: findSummary('REFUNDED').amount,
      refundedCount: findSummary('REFUNDED').count,
      statusBreakdown: statusSummary,
    };

    return NextResponse.json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary,
    });
  } catch (error: any) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch payments' }, { status: 500 });
  }
}