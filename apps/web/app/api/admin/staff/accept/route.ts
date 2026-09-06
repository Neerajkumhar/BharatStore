import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@bharatstore/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password, fullName, phone } = body;

    if (!token) {
      return NextResponse.json({ error: 'Invitation token is required' }, { status: 400 });
    }

    // 1. Hash raw token and find pending invitation
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const invitation = await prisma.staffInvitation.findUnique({
      where: { tokenHash },
      include: { tenant: true, role: true },
    });

    if (!invitation || invitation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invalid or already used invitation token' }, { status: 400 });
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.staffInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json({ error: 'Invitation token has expired' }, { status: 400 });
    }

    // 2. Resolve or create user account
    let user = await prisma.user.findUnique({ where: { email: invitation.email } });

    if (!user) {
      if (!password || !fullName || !phone) {
        return NextResponse.json(
          { error: 'New account setup requires fullName, phone, and password' },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          email: invitation.email,
          fullName,
          phone,
          passwordHash,
        },
      });
    }

    // 3. Create UserTenant membership
    const membership = await prisma.userTenant.create({
      data: {
        userId: user.id,
        tenantId: invitation.tenantId,
        roleId: invitation.roleId,
        status: 'ACTIVE',
      },
    });

    // 4. Mark invitation ACCEPTED
    await prisma.staffInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' },
    });

    // 5. Log SecurityEvent
    await prisma.securityEvent.create({
      data: {
        tenantId: invitation.tenantId,
        eventType: 'STAFF_INVITATION_ACCEPTED',
        severity: 'LOW',
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        details: {
          email: invitation.email,
          roleName: invitation.role.name,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        membershipId: membership.id,
        tenantName: invitation.tenant.tradeName,
        tenantSlug: invitation.tenant.slug,
        roleName: invitation.role.name,
      },
    });
  } catch (error: any) {
    console.error('Accept invitation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to accept invitation' }, { status: 500 });
  }
}
