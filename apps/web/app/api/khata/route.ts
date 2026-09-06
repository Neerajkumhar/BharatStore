import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { logKhataSchema } from '@bharatstore/shared/schemas';

async function getActiveTenantId(request: Request): Promise<string> {
  const headerTenantId = request.headers.get('x-tenant-id');
  if (headerTenantId) return headerTenantId;

  const firstTenant = await prisma.tenant.findFirst();
  if (!firstTenant) {
    throw new Error('No active tenant found in system');
  }
  return firstTenant.id;
}

export async function POST(request: Request) {
  try {
    const tenantId = await getActiveTenantId(request);

    const body = await request.json();
    const parsed = logKhataSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { customerId, type, amount, paymentMode, orderId, notes } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id: customerId, tenantId },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      const balanceChange = type === 'DEBIT_CREDIT_GIVEN' ? amount : -amount;
      const newBalance = Number(customer.currentBalance) + balanceChange;

      const updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: { currentBalance: newBalance },
      });

      const khataEntry = await tx.khataLedger.create({
        data: {
          tenantId,
          customerId,
          orderId: orderId || null,
          type,
          amount,
          balanceAfter: newBalance,
          paymentMode: paymentMode || null,
          notes: notes || null,
        },
      });

      return { customer: updatedCustomer, khataEntry };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Khata ledger entry error:', error);
    return NextResponse.json({ error: error.message || 'Failed to record Khata transaction' }, { status: 400 });
  }
}
