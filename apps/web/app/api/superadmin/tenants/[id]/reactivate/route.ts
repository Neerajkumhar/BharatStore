import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { authorizeSuperAdmin } from '@/lib/superadmin-auth';
import { logPlatformAction, clientIp } from '@/lib/platform-audit';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const existing = await prisma.tenant.findUnique({
      where: { id },
      select: { id: true, tradeName: true, isActive: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.tenant.update({
        where: { id },
        data: { isActive: true },
      });
      await tx.userTenant.updateMany({
        where: { tenantId: id },
        data: { status: 'ACTIVE' },
      });
      // Re-activate subscription if it was suspended (not cancelled by operator)
      await tx.tenantSubscription.updateMany({
        where: { tenantId: id, status: 'SUSPENDED' },
        data: { status: 'ACTIVE' },
      });
    });

    await logPlatformAction({
      actorId: auth.userId!,
      actorEmail: auth.userEmail!,
      action: 'tenant.reactivate',
      targetType: 'tenant',
      targetId: id,
      targetName: existing.tradeName,
      beforeState: { isActive: existing.isActive },
      afterState: { isActive: true },
      ipAddress: clientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Super admin reactivate tenant error:', error);
    return NextResponse.json({ error: 'Failed to reactivate tenant' }, { status: 500 });
  }
}