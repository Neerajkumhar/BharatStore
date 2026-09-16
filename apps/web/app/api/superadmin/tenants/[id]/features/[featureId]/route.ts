import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { authorizeSuperAdmin } from '@/lib/superadmin-auth';
import { logPlatformAction, clientIp } from '@/lib/platform-audit';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; featureId: string }> }) {
  const { id, featureId } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const override = await prisma.tenantFeatureOverride.findFirst({
      where: { tenantId: id, featureId },
      include: { feature: true },
    });

    if (!override) {
      return NextResponse.json({ error: 'Override not found' }, { status: 404 });
    }

    await prisma.tenantFeatureOverride.delete({ where: { id: override.id } });

    await logPlatformAction({
      actorId: auth.userId!,
      actorEmail: auth.userEmail!,
      action: 'feature.override_removed',
      targetType: 'tenant',
      targetId: id,
      afterState: { feature: override.feature.slug },
      ipAddress: clientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Super admin remove feature override error:', error);
    return NextResponse.json({ error: 'Failed to remove feature override' }, { status: 500 });
  }
}