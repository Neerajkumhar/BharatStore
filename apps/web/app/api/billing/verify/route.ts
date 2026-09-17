import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { activateSubscription } from '@/lib/subscription-activation';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function POST(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.BILLING_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const orderId = typeof body?.razorpay_order_id === 'string' ? body.razorpay_order_id : '';
    const paymentId = typeof body?.razorpay_payment_id === 'string' ? body.razorpay_payment_id : '';
    const signature = typeof body?.razorpay_signature === 'string' ? body.razorpay_signature : '';

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: 'Missing Razorpay payment details' }, { status: 400 });
    }

    if (!verifyPaymentSignature({ orderId, paymentId, signature })) {
      return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
    }

    const payment = await prisma.subscriptionPayment.findFirst({
      where: { gatewayOrderId: orderId, tenantId: auth.tenantId },
      include: { plan: true },
    });
    if (!payment) {
      return NextResponse.json({ error: 'Order not found for this tenant' }, { status: 404 });
    }

    if (payment.status === 'PAID') {
      return NextResponse.json({ success: true, data: { alreadyPaid: true, planSlug: payment.planId } });
    }

    // Mark paid and activate the plan atomically.
    await prisma.subscriptionPayment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        gatewayPaymentId: paymentId,
        gatewaySignature: signature,
        paidAt: new Date(),
        method: 'razorpay',
      },
    });

    await activateSubscription({
      tenantId: auth.tenantId,
      planId: payment.planId,
      billingPeriod: payment.billingPeriod as 'MONTHLY' | 'ANNUAL',
      gatewaySubId: paymentId,
      actorId: auth.userId ?? null,
      actorEmail: auth.userEmail ?? null,
    });

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: payment.planId } });

    return NextResponse.json({
      success: true,
      data: {
        planSlug: plan?.slug ?? null,
        planName: plan?.name ?? null,
        billingPeriod: payment.billingPeriod,
      },
    });
  } catch (error: any) {
    console.error('Verify billing payment error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to verify payment' }, { status: 500 });
  }
}
