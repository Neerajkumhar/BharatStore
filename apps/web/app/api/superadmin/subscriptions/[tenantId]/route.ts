import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@bharatstore/database';
import { authorizeSuperAdmin } from '@/lib/superadmin-auth';
import { clientIp } from '@/lib/platform-audit';

const actionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('change_plan'),
    planId: z.string().min(1),
    billingPeriod: z.enum(['monthly', 'annual']).default('monthly'),
  }),
  z.object({
    action: z.literal('extend_trial'),
    days: z.number().int().min(1).max(90),
  }),
  z.object({
    action: z.literal('cancel'),
    reason: z.string().optional(),
  }),
  z.object({
    action: z.literal('reactivate'),
  }),
]);

export async function GET(request: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true },
    });
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const subscription = await prisma.tenantSubscription.findUnique({
      where: { tenantId },
      include: {
        plan: { include: { planFeatures: { include: { feature: true } } } },
        tenant: {
          select: {
            id: true,
            tradeName: true,
            slug: true,
            isActive: true,
            gstin: true,
            _count: { select: { orders: true, products: true, memberships: true } },
          },
        },
      },
    });

    if (!subscription) return NextResponse.json({ error: 'No subscription found' }, { status: 404 });

    // All available plans for reference
    const availablePlans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: subscription.id,
        status: subscription.status,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAt: subscription.cancelAt,
        cancelledAt: subscription.cancelledAt,
        plan: {
          ...subscription.plan,
          monthlyPrice: Number(subscription.plan.monthlyPrice),
          annualPrice: Number(subscription.plan.annualPrice),
          featureSlugs: subscription.plan.planFeatures.map((pf) => pf.feature.slug),
        },
        tenant: subscription.tenant,
        usage: {
          orders: subscription.tenant._count.orders,
          products: subscription.tenant._count.products,
          staff: subscription.tenant._count.memberships,
        },
      },
      availablePlans: availablePlans.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        monthlyPrice: Number(p.monthlyPrice),
        annualPrice: Number(p.annualPrice),
      })),
    });
  } catch (error: any) {
    console.error('Super admin subscription detail error:', error);
    return NextResponse.json({ error: 'Failed to load subscription' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid action', details: parsed.error.format() }, { status: 400 });
    }

    const existing = await prisma.tenantSubscription.findUnique({
      where: { tenantId },
      include: {
        plan: true,
        tenant: { select: { tradeName: true, slug: true } },
      },
    });
    // change_plan may also assign the first plan to a tenant that currently
    // defaults to the Free plan (no subscription row yet).
    if (!existing && parsed.data.action !== 'change_plan') {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    let result;

    switch (parsed.data.action) {
      case 'change_plan': {
        const nextPlan = await prisma.subscriptionPlan.findUnique({ where: { id: parsed.data.planId } });
        if (!nextPlan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

        const now = new Date();
        const billingPeriod = parsed.data.billingPeriod === 'annual' ? 'ANNUAL' : 'MONTHLY';
        const currentPeriodEnd =
          billingPeriod === 'ANNUAL'
            ? new Date(now.getFullYear() + 1)
            : new Date(now.setMonth(now.getMonth() + 1));

        // Reset the period on plan change (admin action, documented in audit log)
        result = await prisma.$transaction(async (tx) => {
          await tx.tenantFeatureOverride.deleteMany({ where: { tenantId } });
          const sub = existing
            ? await tx.tenantSubscription.update({
                where: { tenantId },
                data: {
                  planId: nextPlan.id,
                  billingPeriod,
                  currentPeriodStart: new Date(),
                  currentPeriodEnd,
                  status: 'ACTIVE',
                  cancelAt: null,
                  cancelledAt: null,
                },
                include: { plan: true },
              })
            : await tx.tenantSubscription.create({
                data: {
                  tenantId,
                  planId: nextPlan.id,
                  billingPeriod,
                  status: 'ACTIVE',
                  currentPeriodStart: new Date(),
                  currentPeriodEnd,
                  paymentMethod: 'manual',
                },
                include: { plan: true },
              });
          const tenantName =
            existing?.tenant.tradeName ??
            (await tx.tenant.findUnique({ where: { id: tenantId }, select: { tradeName: true } }))?.tradeName ??
            null;
          await tx.platformAuditLog.create({
            data: {
              actorId: auth.userId!,
              actorEmail: auth.userEmail!,
              action: 'subscription.change_plan',
              targetType: 'tenant',
              targetId: tenantId,
              targetName: tenantName,
              beforeState: { plan: existing?.plan.slug ?? null },
              afterState: { plan: nextPlan.slug, billingPeriod },
              ipAddress: clientIp(request),
            },
          });
          return sub;
        });
        break;
      }
      case 'extend_trial': {
        const base = existing!.trialEndsAt && existing!.trialEndsAt > new Date() ? existing!.trialEndsAt : new Date();
        const newTrialEnd = new Date(base);
        newTrialEnd.setDate(newTrialEnd.getDate() + parsed.data.days);

        result = await prisma.$transaction(async (tx) => {
          const sub = await tx.tenantSubscription.update({
            where: { tenantId },
            data: {
              trialEndsAt: newTrialEnd,
              status: 'TRIAL',
              cancelAt: null,
              cancelledAt: null,
            },
            include: { plan: true },
          });
          await tx.platformAuditLog.create({
            data: {
              actorId: auth.userId!,
              actorEmail: auth.userEmail!,
              action: 'subscription.extend_trial',
              targetType: 'tenant',
              targetId: tenantId,
              targetName: existing!.tenant.tradeName,
              beforeState: { trialEndsAt: existing!.trialEndsAt },
              afterState: { trialEndsAt: newTrialEnd },
              ipAddress: clientIp(request),
            },
          });
          return sub;
        });
        break;
      }
      case 'cancel': {
        const cancelReason = parsed.data.reason;
        result = await prisma.$transaction(async (tx) => {
          const sub = await tx.tenantSubscription.update({
            where: { tenantId },
            data: {
              status: 'CANCELLED',
              cancelAt: new Date(),
              cancelledAt: new Date(),
            },
            include: { plan: true },
          });
          await tx.platformAuditLog.create({
            data: {
              actorId: auth.userId!,
              actorEmail: auth.userEmail!,
              action: 'subscription.cancel',
              targetType: 'tenant',
              targetId: tenantId,
              targetName: existing!.tenant.tradeName,
              beforeState: { status: existing!.status },
              afterState: { status: 'CANCELLED' },
              details: cancelReason ? { reason: cancelReason } : undefined,
              ipAddress: clientIp(request),
            },
          });
          return sub;
        });
        break;
      }
      case 'reactivate': {
        const now = new Date();
        const currentPeriodEnd = new Date(now.setMonth(now.getMonth() + 1));

        result = await prisma.$transaction(async (tx) => {
          const sub = await tx.tenantSubscription.update({
            where: { tenantId },
            data: {
              status: 'ACTIVE',
              currentPeriodStart: new Date(),
              currentPeriodEnd,
              cancelAt: null,
              cancelledAt: null,
            },
            include: { plan: true },
          });
          await tx.platformAuditLog.create({
            data: {
              actorId: auth.userId!,
              actorEmail: auth.userEmail!,
              action: 'subscription.reactivate',
              targetType: 'tenant',
              targetId: tenantId,
              targetName: existing!.tenant.tradeName,
              beforeState: { status: existing!.status },
              afterState: { status: 'ACTIVE' },
              ipAddress: clientIp(request),
            },
          });
          return sub;
        });
        break;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        status: result.status,
        planName: result.plan.name,
        planSlug: result.plan.slug,
        trialEndsAt: result.trialEndsAt,
        currentPeriodEnd: result.currentPeriodEnd,
        cancelAt: result.cancelAt,
      },
    });
  } catch (error: any) {
    console.error('Super admin subscription update error:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}