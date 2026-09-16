import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@bharatstore/database';
import { authorizeSuperAdmin } from '@/lib/superadmin-auth';
import { logPlatformAction, clientIp } from '@/lib/platform-audit';

const planUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  monthlyPrice: z.number().min(0).optional(),
  annualPrice: z.number().min(0).optional(),
  currency: z.string().optional(),
  maxProducts: z.number().int().min(-1).optional(),
  maxOrders: z.number().int().min(-1).optional(),
  maxStaff: z.number().int().min(-1).optional(),
  maxStorageMb: z.number().int().min(-1).optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        planFeatures: { include: { feature: true } },
        _count: { select: { subscriptions: true } },
      },
    });

    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: {
        ...plan,
        monthlyPrice: Number(plan.monthlyPrice),
        annualPrice: Number(plan.annualPrice),
        featureSlugs: plan.planFeatures.map((pf) => pf.feature.slug),
        activeSubscriptions: plan._count.subscriptions,
      },
    });
  } catch (error: any) {
    console.error('Super admin plan detail error:', error);
    return NextResponse.json({ error: 'Failed to load plan' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const parsed = planUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const existing = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: { planFeatures: true },
    });
    if (!existing) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const { features, ...updates } = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      const plan = await tx.subscriptionPlan.update({
        where: { id },
        data: {
          ...updates,
          ...(features ? { features } : {}),
        },
      });

      if (features) {
        const featureFlags = await tx.featureFlag.findMany({
          where: { slug: { in: features } },
          select: { id: true },
        });
        await tx.planFeature.deleteMany({ where: { planId: id } });
        await tx.planFeature.createMany({
          data: featureFlags.map((f) => ({ planId: id, featureId: f.id })),
        });
      }

      return plan;
    });

    await logPlatformAction({
      actorId: auth.userId!,
      actorEmail: auth.userEmail!,
      action: 'plan.update',
      targetType: 'plan',
      targetId: id,
      targetName: existing.name,
      beforeState: {
        name: existing.name,
        monthlyPrice: Number(existing.monthlyPrice),
        maxProducts: existing.maxProducts,
        maxOrders: existing.maxOrders,
        maxStaff: existing.maxStaff,
        maxStorageMb: existing.maxStorageMb,
      },
      afterState: {
        name: updated.name,
        monthlyPrice: Number(updated.monthlyPrice),
        ...(updates as Record<string, unknown>),
      },
      ipAddress: clientIp(request),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Super admin update plan error:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const existing = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: { _count: { select: { subscriptions: true } } },
    });
    if (!existing) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    if (existing._count.subscriptions > 0) {
      // Soft-archive: plans in use cannot be deleted
      const archived = await prisma.subscriptionPlan.update({
        where: { id },
        data: { isActive: false },
      });
      await logPlatformAction({
        actorId: auth.userId!,
        actorEmail: auth.userEmail!,
        action: 'plan.archive',
        targetType: 'plan',
        targetId: id,
        targetName: existing.name,
        beforeState: { isActive: true },
        afterState: { isActive: false },
        ipAddress: clientIp(request),
      });
      return NextResponse.json({ success: true, archived: true, message: 'Plan archived (has active subscriptions)' });
    }

    await prisma.planFeature.deleteMany({ where: { planId: id } });
    await prisma.subscriptionPlan.delete({ where: { id } });

    await logPlatformAction({
      actorId: auth.userId!,
      actorEmail: auth.userEmail!,
      action: 'plan.delete',
      targetType: 'plan',
      targetId: id,
      targetName: existing.name,
      afterState: { deleted: true },
      ipAddress: clientIp(request),
    });

    return NextResponse.json({ success: true, archived: false });
  } catch (error: any) {
    console.error('Super admin delete plan error:', error);
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}