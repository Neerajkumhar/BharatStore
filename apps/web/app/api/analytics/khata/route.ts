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

    const [customers, khataEntries] = await Promise.all([
      tenantDb.customer.findMany(),
      tenantDb.khataLedger.findMany({
        where: {
          createdAt: { gte: currentStart, lte: currentEnd },
        },
      }),
    ]);

    const totalOutstandingCredit = customers.reduce((acc, c) => acc + Math.max(0, Number(c.currentBalance)), 0);
    const customersWithOutstanding = customers.filter((c) => Number(c.currentBalance) > 0);

    const periodCreditGiven = khataEntries
      .filter((e) => e.type === 'DEBIT_CREDIT_GIVEN')
      .reduce((acc, e) => acc + Number(e.amount), 0);

    const periodPaymentsCollected = khataEntries
      .filter((e) => e.type === 'CREDIT_PAYMENT_RECEIVED')
      .reduce((acc, e) => acc + Number(e.amount), 0);

    const topDebtors = customersWithOutstanding
      .map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        currentBalance: Number(c.currentBalance),
        creditLimit: Number(c.creditLimit),
      }))
      .sort((a, b) => b.currentBalance - a.currentBalance)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalOutstandingCredit: Number(totalOutstandingCredit.toFixed(2)),
          customersWithOutstandingCount: customersWithOutstanding.length,
          periodCreditGiven: Number(periodCreditGiven.toFixed(2)),
          periodPaymentsCollected: Number(periodPaymentsCollected.toFixed(2)),
        },
        topDebtors,
      },
    });
  } catch (error: any) {
    console.error('Fetch Khata analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch Khata analytics' }, { status: 500 });
  }
}
