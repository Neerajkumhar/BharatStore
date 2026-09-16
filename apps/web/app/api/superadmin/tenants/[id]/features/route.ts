import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@bharatstore/database';
import { authorizeSuperAdmin } from '@/lib/superadmin-auth';
import { logPlatformAction, clientIp } from '@/lib/platform-audit';

const grantSchema = z.object({
  featureId: z.string().min(1),
  enabled: z.boolean().default(true),
  reason: z.string().optional(),
  expiresAt: z.string().optional().nullable(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const [overrides, allFeatures] = await Promise.all([
      prisma.tenantFeatureOverride.findMany({
        where: { tenantId: id },
        include: { feature: true },
      }),
      prisma.featureFlag.findMany({ orderBy: { category: 'asc' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overrides: overrides.map((o) => ({
          id: o.id,
          feature: o.feature,
          enabled: o.enabled,
          reason: o.reason,
          expiresAt: o.expiresAt,
        })),
        allFeatures,
      },
    });
  } catch (error: any) {
    console.error('Super admin tenant features error:', error);
    return NextResponse.json({ error: 'Failed to load tenant features' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const parsed = grantSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      select: { id: true, tradeName: true },
    });
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const feature = await prisma.featureFlag.findUnique({
      where: { id: parsed.data.featureId },
    });
    if (!feature) return NextResponse.json({ error: 'Feature not found' }, { status: 404 });

    const override = await prisma.tenantFeatureOverride.upsert({
      where: { tenantId_featureId: { tenantId: id, featureId: parsed.data.featureId } },
      update: {
        enabled: parsed.data.enabled,
        reason: parsed.data.reason,
        grantedById: auth.userId,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
      create: {
        tenantId: id,
        featureId: parsed.data.featureId,
        enabled: parsed.data.enabled,
        reason: parsed.data.reason,
        grantedById: auth.userId,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
      include: { feature: true },
    });

    await logPlatformAction({
      actorId: auth.userId!,
      actorEmail: auth.userEmail!,
      action: parsed.data.enabled ? 'feature.grant' : 'feature.revoke',
      targetType: 'tenant',
      targetId: id,
      targetName: tenant.tradeName,
      afterState: { feature: feature.slug, enabled: parsed.data.enabled, reason: parsed.data.reason },
      ipAddress: clientIp(request),
    });

    return NextResponse.json({ success: true, data: override });
  } catch (error: any) {
    console.error('Super admin grant feature error:', error);
    return NextResponse.json({ error: 'Failed to grant feature' }, { status: 500 });
  }
}