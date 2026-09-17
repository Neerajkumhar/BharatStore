import { prisma } from '@bharatstore/database';

const PERIOD_DAYS: Record<'MONTHLY' | 'ANNUAL', number> = {
  MONTHLY: 30,
  ANNUAL: 365,
};

/**
 * Activates (or renews) a tenant's paid subscription and writes an audit entry.
 * Idempotency is the caller's responsibility — guard on payment status.
 */
export async function activateSubscription(params: {
  tenantId: string;
  planId: string;
  billingPeriod: 'MONTHLY' | 'ANNUAL';
  gatewaySubId?: string | null;
  actorId?: string | null;
  actorEmail?: string | null;
}) {
  const now = new Date();
  const periodEnd = new Date(now.getTime() + PERIOD_DAYS[params.billingPeriod] * 24 * 60 * 60 * 1000);

  return prisma.$transaction(async (tx) => {
    const subscription = await tx.tenantSubscription.upsert({
      where: { tenantId: params.tenantId },
      update: {
        planId: params.planId,
        status: 'ACTIVE',
        billingPeriod: params.billingPeriod,
        trialEndsAt: null,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAt: null,
        cancelledAt: null,
        paymentMethod: 'razorpay',
        ...(params.gatewaySubId ? { gatewaySubId: params.gatewaySubId } : {}),
      },
      create: {
        tenantId: params.tenantId,
        planId: params.planId,
        status: 'ACTIVE',
        billingPeriod: params.billingPeriod,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        paymentMethod: 'razorpay',
        gatewaySubId: params.gatewaySubId ?? null,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId: params.tenantId,
        actorId: params.actorId ?? null,
        actorEmail: params.actorEmail ?? null,
        action: 'SUBSCRIPTION_ACTIVATED',
        resourceType: 'tenant_subscription',
        resourceId: subscription.id,
        afterState: {
          planId: params.planId,
          billingPeriod: params.billingPeriod,
          status: 'ACTIVE',
          currentPeriodEnd: periodEnd.toISOString(),
          paymentMethod: 'razorpay',
          gatewaySubId: params.gatewaySubId ?? null,
        },
      },
    });

    return subscription;
  });
}
