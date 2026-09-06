import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { logKhataSchema } from '@bharatstore/shared/schemas';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function POST(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.KHATA_WRITE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = auth.tenantId;

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
        throw new Error('Customer not found or access denied');
      }

      const isDebit = type === 'DEBIT_CREDIT_GIVEN';
      const updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: isDebit
          ? { currentBalance: { increment: amount } }
          : { currentBalance: { decrement: amount } },
      });

      const newBalance = Number(updatedCustomer.currentBalance);

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

      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: auth.userId,
          actorEmail: auth.userEmail || 'unknown',
          action: 'khata:transaction',
          resourceType: 'customer',
          resourceId: customerId,
          ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
          beforeState: { currentBalance: Number(customer.currentBalance) },
          afterState: { currentBalance: newBalance, type, amount },
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
