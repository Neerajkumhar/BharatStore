import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { activateSubscription } from '@/lib/subscription-activation';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const event: string = payload?.event ?? '';
  const paymentEntity = payload?.payload?.payment?.entity;
  const orderId: string | undefined = paymentEntity?.order_id ?? payload?.payload?.order?.entity?.id;

  try {
    if (event === 'payment.captured' || event === 'order.paid') {
      if (!orderId) return NextResponse.json({ received: true });

      const payment = await prisma.subscriptionPayment.findFirst({
        where: { gatewayOrderId: orderId },
      });
      if (!payment || payment.status === 'PAID') {
        return NextResponse.json({ received: true });
      }

      await prisma.subscriptionPayment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          gatewayPaymentId: paymentEntity?.id ?? null,
          paidAt: new Date(),
          method: paymentEntity?.method ?? 'razorpay',
        },
      });

      await activateSubscription({
        tenantId: payment.tenantId,
        planId: payment.planId,
        billingPeriod: payment.billingPeriod as 'MONTHLY' | 'ANNUAL',
        gatewaySubId: paymentEntity?.id ?? orderId,
      });
    } else if (event === 'payment.failed') {
      if (!orderId) return NextResponse.json({ received: true });
      const payment = await prisma.subscriptionPayment.findFirst({
        where: { gatewayOrderId: orderId },
      });
      if (payment && payment.status !== 'PAID') {
        await prisma.subscriptionPayment.update({
          where: { id: payment.id },
          data: { status: 'FAILED', notes: paymentEntity?.error_description?.slice(0, 500) ?? null },
        });
      }
    }
  } catch (error) {
    console.error('Razorpay webhook handler error:', error);
    // Return 200 so Razorpay does not retry indefinitely — the payment can be verified via /verify.
  }

  return NextResponse.json({ received: true });
}
