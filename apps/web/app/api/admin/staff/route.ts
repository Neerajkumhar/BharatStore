import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS, SYSTEM_ROLES } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.STAFF_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response!;
    }

    const memberships = await prisma.userTenant.findMany({
      where: { tenantId: auth.tenantId },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true, createdAt: true },
        },
        role: {
          select: { id: true, name: true, description: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const pendingInvitations = await prisma.staffInvitation.findMany({
      where: { tenantId: auth.tenantId, status: 'PENDING', expiresAt: { gt: new Date() } },
      include: { role: { select: { name: true } } },
    });

    return NextResponse.json({
      success: true,
      data: {
        staff: memberships.map((m) => ({
          membershipId: m.id,
          userId: m.user.id,
          name: m.user.fullName,
          email: m.user.email,
          phone: m.user.phone,
          role: m.role.name,
          roleId: m.role.id,
          status: m.status,
          isOwner: m.role.name === SYSTEM_ROLES.OWNER,
          joinedAt: m.createdAt,
        })),
        pendingInvitations: pendingInvitations.map((inv) => ({
          id: inv.id,
          email: inv.email,
          role: inv.role.name,
          expiresAt: inv.expiresAt,
          createdAt: inv.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Fetch staff error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch staff members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.STAFF_MANAGE);
    if (!auth.authorized || !auth.tenantId || !auth.userId) {
      return auth.response!;
    }

    const body = await request.json();
    const { email, roleName } = body;

    if (!email || !roleName) {
      return NextResponse.json({ error: 'Email and roleName are required' }, { status: 400 });
    }

    // Owner protection: cannot invite someone as OWNER
    if (roleName === SYSTEM_ROLES.OWNER && auth.roleName !== SYSTEM_ROLES.OWNER) {
      return NextResponse.json({ error: 'Privilege Escalation Blocked: Only an Owner can assign Owner role' }, { status: 403 });
    }

    // Find role ID
    const role = await prisma.role.findFirst({
      where: {
        name: roleName,
        OR: [{ tenantId: auth.tenantId }, { isSystemRole: true }],
      },
    });

    if (!role) {
      return NextResponse.json({ error: `Role "${roleName}" not found` }, { status: 404 });
    }

    // Check if already a member
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const existingMembership = await prisma.userTenant.findFirst({
        where: { userId: existingUser.id, tenantId: auth.tenantId },
      });

      if (existingMembership) {
        return NextResponse.json({ error: 'User is already a staff member of this business' }, { status: 400 });
      }
    }

    // Generate secure invitation token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.staffInvitation.create({
      data: {
        tenantId: auth.tenantId,
        email,
        roleId: role.id,
        tokenHash,
        expiresAt,
        invitedById: auth.userId,
      },
    });

    // Write immutable AuditLog entry
    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail,
        action: 'staff:invite',
        resourceType: 'staff_invitation',
        resourceId: invitation.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        afterState: { email, roleName, expiresAt },
      },
    });

    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const inviteUrl = `${origin}/accept-invite?token=${rawToken}`;

    return NextResponse.json({
      success: true,
      data: {
        invitationId: invitation.id,
        email: invitation.email,
        roleName: role.name,
        expiresAt: invitation.expiresAt,
        inviteUrl,
      },
    });
  } catch (error: any) {
    console.error('Invite staff error:', error);
    return NextResponse.json({ error: error.message || 'Failed to invite staff member' }, { status: 500 });
  }
}
