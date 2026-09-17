import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { createRazorpayOrder, getRazorpayCredentials, toPaise } from '@/lib/razorpay';
import { PERMISSIONS } from '@bharatstore/shared/constants';

const PERIODS = new Set(['MONTHLY', 'ANNUAL']);

export async function POST(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.BILLING_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const creds = getRazorpayCredentials();
    if (!creds) {
      return NextResponse.json(
        { error: 'Online payments are not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => null);
    const planSlug = typeof body?.planSlug === 'string' ? body.planSlug : '';
    const billingPeriod = typeof body?.billingPeriod === 'string' ? body.billingPeriod.toUpperCase() : 'MONTHLY';

    if (!PERIODS.has(billingPeriod)) {
      return NextResponse.json({ error: 'Invalid billing period' }, { status: 400 });
    }

    const plan = await prisma.subscriptionPlan.findFirst({
      where: { slug: planSlug, isActive: true },
    });
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const price = billingPeriod === 'ANNUAL' ? Number(plan.annualPrice) : Number(plan.monthlyPrice);
    if (!price || price <= 0) {
      return NextResponse.json({ error: 'This plan is not available for online purchase' }, { status: 400 });
    }
    const amount = toPaise(price);

    const tenant = await prisma.tenant.findUnique({
      where: { id: auth.tenantId },
      select: { tradeName: true, email: true },
    });

    // Persist an order record first so the intent survives a gateway failure.
    const payment = await prisma.subscriptionPayment.create({
      data: {
        tenantId: auth.tenantId,
        planId: plan.id,
        billingPeriod: billingPeriod as 'MONTHLY' | 'ANNUAL',
        amount,
        currency: plan.currency,
        status: 'CREATED',
      },
    });

    let order;
    try {
      order = await createRazorpayOrder({
        amount,
        currency: plan.currency,
        receipt: `rcpt_${payment.id.replace(/-/g, '').slice(0, 30)}`,
        notes: {
          tenantId: auth.tenantId,
          planSlug: plan.slug,
          billingPeriod,
          paymentId: payment.id,
        },
      });
    } catch (error: any) {
      await prisma.subscriptionPayment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', notes: String(error?.message ?? 'gateway error').slice(0, 500) },
      });
      throw error;
    }

    await prisma.subscriptionPayment.update({
      where: { id: payment.id },
      data: { gatewayOrderId: order.id },
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        orderId: order.id,
        amount,
        currency: plan.currency,
        keyId: creds.keyId,
        name: tenant?.tradeName ?? 'BharatStore',
        description: `${plan.name} plan · ${billingPeriod === 'ANNUAL' ? 'Annual' : 'Monthly'}`,
        prefill: { name: tenant?.tradeName ?? '', email: tenant?.email ?? '' },
      },
    });
  } catch (error: any) {
    console.error('Create billing checkout error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to start checkout' },
      { status: 500 }
    );
  }
}
