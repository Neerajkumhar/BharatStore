import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@bharatstore/database';
import { authorizeSuperAdmin } from '@/lib/superadmin-auth';
import { logPlatformAction, clientIp } from '@/lib/platform-audit';

const planSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional().nullable(),
  monthlyPrice: z.number().min(0),
  annualPrice: z.number().min(0),
  currency: z.string().default('INR'),
  maxProducts: z.number().int().min(-1),
  maxOrders: z.number().int().min(-1),
  maxStaff: z.number().int().min(-1),
  maxStorageMb: z.number().int().min(-1),
  features: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export async function GET(request: Request) {
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        planFeatures: { include: { feature: true } },
        _count: { select: { subscriptions: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: plans.map((p) => ({
        ...p,
        monthlyPrice: Number(p.monthlyPrice),
        annualPrice: Number(p.annualPrice),
        featureSlugs: p.planFeatures.map((pf) => pf.feature.slug),
        activeSubscriptions: p._count.subscriptions,
      })),
    });
  } catch (error: any) {
    console.error('Super admin plans list error:', error);
    return NextResponse.json({ error: 'Failed to load plans' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const parsed = planSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const slugExists = await prisma.subscriptionPlan.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true },
    });
    if (slugExists) {
      return NextResponse.json({ error: 'A plan with this slug already exists' }, { status: 409 });
    }

    const { features, ...planData } = parsed.data;

    // Resolve features by slug to create PlanFeature links
    const featureFlags = await prisma.featureFlag.findMany({
      where: { slug: { in: features } },
    });

    const plan = await prisma.subscriptionPlan.create({
      data: {
        ...planData,
        features,
        planFeatures: {
          create: featureFlags.map((f) => ({ featureId: f.id })),
        },
      },
    });

    await logPlatformAction({
      actorId: auth.userId!,
      actorEmail: auth.userEmail!,
      action: 'plan.create',
      targetType: 'plan',
      targetId: plan.id,
      targetName: plan.name,
      afterState: { slug: plan.slug, monthlyPrice: Number(plan.monthlyPrice) },
      ipAddress: clientIp(request),
    });

    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error: any) {
    console.error('Super admin create plan error:', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}