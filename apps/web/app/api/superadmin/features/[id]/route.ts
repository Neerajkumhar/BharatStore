import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@bharatstore/database';
import { authorizeSuperAdmin } from '@/lib/superadmin-auth';
import { logPlatformAction, clientIp } from '@/lib/platform-audit';

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  category: z.string().optional(),
  isPlatformWide: z.boolean().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const [feature, enabledCount] = await Promise.all([
      prisma.featureFlag.findUnique({
        where: { id },
        include: {
          _count: { select: { overrides: true, planFeatures: true } },
        },
      }),
      prisma.tenantFeatureOverride.count({ where: { featureId: id, enabled: true } }),
    ]);

    if (!feature) return NextResponse.json({ error: 'Feature not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: {
        ...feature,
        enabledCount,
        planCount: feature._count.planFeatures,
        tenantCount: feature._count.overrides,
      },
    });
  } catch (error: any) {
    console.error('Super admin feature detail error:', error);
    return NextResponse.json({ error: 'Failed to load feature' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const existing = await prisma.featureFlag.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Feature not found' }, { status: 404 });

    const updated = await prisma.featureFlag.update({
      where: { id },
      data: parsed.data,
    });

    await logPlatformAction({
      actorId: auth.userId!,
      actorEmail: auth.userEmail!,
      action: 'feature.update',
      targetType: 'feature',
      targetId: id,
      targetName: existing.name,
      beforeState: {
        name: existing.name,
        category: existing.category,
        isPlatformWide: existing.isPlatformWide,
        isActive: existing.isActive,
      },
      afterState: {
        name: updated.name,
        category: updated.category,
        isPlatformWide: updated.isPlatformWide,
        isActive: updated.isActive,
      },
      ipAddress: clientIp(request),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Super admin update feature error:', error);
    return NextResponse.json({ error: 'Failed to update feature' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const existing = await prisma.featureFlag.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Feature not found' }, { status: 404 });

    // Soft-archive: keep slug alive in case code references it
    const archived = await prisma.featureFlag.update({
      where: { id },
      data: { isActive: false },
    });

    await logPlatformAction({
      actorId: auth.userId!,
      actorEmail: auth.userEmail!,
      action: 'feature.archive',
      targetType: 'feature',
      targetId: id,
      targetName: existing.name,
      beforeState: { isActive: true },
      afterState: { isActive: false },
      ipAddress: clientIp(request),
    });

    return NextResponse.json({
      success: true,
      archived: true,
      message: 'Feature archived (kept for backward compatibility).',
    });
  } catch (error: any) {
    console.error('Super admin archive feature error:', error);
    return NextResponse.json({ error: 'Failed to archive feature' }, { status: 500 });
  }
}