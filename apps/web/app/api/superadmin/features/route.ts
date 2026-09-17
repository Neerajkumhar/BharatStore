import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@bharatstore/database';
import { authorizeSuperAdmin } from '@/lib/superadmin-auth';
import { logPlatformAction, clientIp } from '@/lib/platform-audit';

const createSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9_]+$/),
  description: z.string().optional().nullable(),
  category: z.string().min(1),
  isPlatformWide: z.boolean().default(false),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export async function GET(request: Request) {
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const [features, enabledGroups, tenantGroups] = await Promise.all([
      prisma.featureFlag.findMany({
        orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }, { name: 'asc' }],
        include: {
          _count: { select: { overrides: true, planFeatures: true } },
        },
      }),
      prisma.tenantFeatureOverride.groupBy({ by: ['featureId'], where: { enabled: true }, _count: { _all: true } }),
      prisma.tenantFeatureOverride.groupBy({ by: ['featureId'], _count: { _all: true } }),
    ]);

    const enabledMap = new Map(enabledGroups.map((g) => [g.featureId, g._count._all]));
    const tenantMap = new Map(tenantGroups.map((g) => [g.featureId, g._count._all]));

    return NextResponse.json({
      success: true,
      data: features.map((f) => ({
        ...f,
        enabledCount: enabledMap.get(f.id) ?? 0,
        tenantCount: tenantMap.get(f.id) ?? 0,
        planCount: f._count.planFeatures,
      })),
    });
  } catch (error: any) {
    console.error('Super admin features list error:', error);
    return NextResponse.json({ error: 'Failed to load features' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const slugExists = await prisma.featureFlag.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true },
    });
    if (slugExists) {
      return NextResponse.json({ error: 'A feature with this slug already exists' }, { status: 409 });
    }

    const feature = await prisma.featureFlag.create({ data: parsed.data });

    await logPlatformAction({
      actorId: auth.userId!,
      actorEmail: auth.userEmail!,
      action: 'feature.create',
      targetType: 'feature',
      targetId: feature.id,
      targetName: feature.name,
      afterState: { slug: feature.slug, category: feature.category, isPlatformWide: feature.isPlatformWide },
      ipAddress: clientIp(request),
    });

    return NextResponse.json({ success: true, data: feature }, { status: 201 });
  } catch (error: any) {
    console.error('Super admin create feature error:', error);
    return NextResponse.json({ error: 'Failed to create feature' }, { status: 500 });
  }
}