import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS, SYSTEM_ROLES } from '@bharatstore/shared/constants';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.STAFF_MANAGE);
    if (!auth.authorized || !auth.tenantId || !auth.userId) {
      return auth.response!;
    }

    const { id: membershipId } = await params;
    const body = await request.json();
    const { roleName, status } = body;

    const targetMembership = await prisma.userTenant.findFirst({
      where: { id: membershipId, tenantId: auth.tenantId },
      include: { role: true, user: true },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: 'Staff membership record not found' }, { status: 404 });
    }

    // Owner Protection 1: Normal staff/admin cannot modify Owner membership
    if (targetMembership.role.name === SYSTEM_ROLES.OWNER) {
      return NextResponse.json({ error: 'Owner Protection: The business Owner account cannot be modified or demoted' }, { status: 403 });
    }

    // Owner Protection 2: Non-Owner cannot promote anyone to OWNER
    if (roleName === SYSTEM_ROLES.OWNER && auth.roleName !== SYSTEM_ROLES.OWNER) {
      return NextResponse.json({ error: 'Privilege Escalation Blocked: Only an Owner can assign the Owner role' }, { status: 403 });
    }

    let updatedRoleId = targetMembership.roleId;
    if (roleName) {
      const newRole = await prisma.role.findFirst({
        where: {
          name: roleName,
          OR: [{ tenantId: auth.tenantId }, { isSystemRole: true }],
        },
      });

      if (!newRole) {
        return NextResponse.json({ error: `Role "${roleName}" not found` }, { status: 404 });
      }
      updatedRoleId = newRole.id;
    }

    const updated = await prisma.userTenant.update({
      where: { id: membershipId },
      data: {
        roleId: updatedRoleId,
        ...(status && { status }),
      },
      include: { role: true, user: true },
    });

    // Write AuditLog entry
    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail,
        action: 'staff:update',
        resourceType: 'user_tenant',
        resourceId: membershipId,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        beforeState: { role: targetMembership.role.name, status: targetMembership.status },
        afterState: { role: updated.role.name, status: updated.status },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        membershipId: updated.id,
        name: updated.user.fullName,
        email: updated.user.email,
        role: updated.role.name,
        status: updated.status,
      },
    });
  } catch (error: any) {
    console.error('Update staff error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update staff member' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.STAFF_MANAGE);
    if (!auth.authorized || !auth.tenantId || !auth.userId) {
      return auth.response!;
    }

    const { id: membershipId } = await params;

    const targetMembership = await prisma.userTenant.findFirst({
      where: { id: membershipId, tenantId: auth.tenantId },
      include: { role: true, user: true },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: 'Staff membership record not found' }, { status: 404 });
    }

    // Owner Protection: cannot delete business Owner
    if (targetMembership.role.name === SYSTEM_ROLES.OWNER) {
      return NextResponse.json({ error: 'Owner Protection: The business Owner account cannot be removed' }, { status: 403 });
    }

    await prisma.userTenant.delete({
      where: { id: membershipId },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail,
        action: 'staff:remove',
        resourceType: 'user_tenant',
        resourceId: membershipId,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        beforeState: { email: targetMembership.user.email, role: targetMembership.role.name },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Staff member removed from business',
    });
  } catch (error: any) {
    console.error('Remove staff error:', error);
    return NextResponse.json({ error: error.message || 'Failed to remove staff member' }, { status: 500 });
  }
}
