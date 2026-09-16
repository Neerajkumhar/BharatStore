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

    const [customers, khataEntries] = await Promise.all([
      tenantDb.customer.findMany(),
      tenantDb.khataLedger.findMany({
        where: {
          createdAt: { gte: currentStart, lte: currentEnd },
        },
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalOutstanding = customers.reduce((acc, c) => acc + Math.max(0, Number(c.currentBalance)), 0);
    const debtorCount = customers.filter((c) => Number(c.currentBalance) > 0).length;
    const totalCreditLimit = customers.reduce((acc, c) => acc + Math.max(0, Number(c.creditLimit)), 0);
    const creditUtilizationPct = totalCreditLimit > 0
      ? Number(((totalOutstanding / totalCreditLimit) * 100).toFixed(1))
      : 0;

    const totalCreditSalesPeriod = khataEntries
      .filter((e) => e.type === 'DEBIT_CREDIT_GIVEN')
      .reduce((acc, e) => acc + Number(e.amount), 0);

    const totalCollectionsPeriod = khataEntries
      .filter((e) => e.type === 'CREDIT_PAYMENT_RECEIVED')
      .reduce((acc, e) => acc + Number(e.amount), 0);

    const topDebtors = customers
      .filter((c) => Number(c.currentBalance) > 0)
      .map((c) => {
        const balance = Number(c.currentBalance);
        const creditLimit = Number(c.creditLimit);
        return {
          id: c.id,
          name: c.name,
          phone: c.phone,
          creditLimit,
          balance,
          utilPct: creditLimit > 0 ? Math.round((balance / creditLimit) * 100) : 0,
        };
      })
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 10);

    const recentLedgerEntries = khataEntries.slice(0, 15).map((e) => ({
      id: e.id,
      customerId: e.customerId,
      customerName: e.customer?.name || 'Unknown',
      type: e.type,
      paymentMode: e.paymentMode,
      amount: Number(e.amount),
      balanceAfter: Number(e.balanceAfter),
      createdAt: e.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalOutstanding: Number(totalOutstanding.toFixed(2)),
        debtorCount,
        totalCreditLimit: Number(totalCreditLimit.toFixed(2)),
        creditUtilizationPct,
        totalCreditSalesPeriod: Number(totalCreditSalesPeriod.toFixed(2)),
        totalCollectionsPeriod: Number(totalCollectionsPeriod.toFixed(2)),
        topDebtors,
        recentLedgerEntries,
        periodLabel,
      },
    });
  } catch (error: any) {
    console.error('Fetch Khata analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch Khata analytics' }, { status: 500 });
  }
}