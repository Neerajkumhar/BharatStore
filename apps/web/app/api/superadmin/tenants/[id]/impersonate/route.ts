import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { authorizeSuperAdmin } from '@/lib/superadmin-auth';
import { logPlatformAction, clientIp } from '@/lib/platform-audit';
import { signJWT, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      select: { id: true, tradeName: true, slug: true, isActive: true },
    });

    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    if (!tenant.isActive) return NextResponse.json({ error: 'Cannot impersonate a suspended tenant' }, { status: 400 });

    // Find the owner of this tenant
    const ownerMembership = await prisma.userTenant.findFirst({
      where: {
        tenantId: id,
        status: 'ACTIVE',
        role: { name: 'OWNER' },
      },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        role: true,
      },
    });

    if (!ownerMembership) {
      return NextResponse.json({ error: 'No active owner found for this tenant' }, { status: 400 });
    }

    // Mint a short-lived impersonation session (15 minutes)
    const token = await signJWT(
      {
        userId: ownerMembership.user.id,
        email: ownerMembership.user.email,
        name: ownerMembership.user.fullName,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        role: ownerMembership.role.name,
        isSuperAdmin: false,
        isImpersonation: true,
        impersonatedBy: auth.userId,
      },
      '15m'
    );

    await logPlatformAction({
      actorId: auth.userId!,
      actorEmail: auth.userEmail!,
      action: 'tenant.impersonate',
      targetType: 'tenant',
      targetId: tenant.id,
      targetName: tenant.tradeName,
      afterState: { impersonatedUserId: ownerMembership.user.id, impersonatedUserEmail: ownerMembership.user.email },
      ipAddress: clientIp(request),
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: ownerMembership.user.id,
        email: ownerMembership.user.email,
        fullName: ownerMembership.user.fullName,
        isSuperAdmin: false,
        isImpersonation: true,
      },
      tenant: {
        id: tenant.id,
        name: tenant.tradeName,
        slug: tenant.slug,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    return response;
  } catch (error: any) {
    console.error('Super admin impersonate error:', error);
    return NextResponse.json({ error: 'Failed to impersonate tenant' }, { status: 500 });
  }
}