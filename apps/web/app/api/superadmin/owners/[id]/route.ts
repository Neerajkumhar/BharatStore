import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@bharatstore/database';
import { authorizeSuperAdmin } from '@/lib/superadmin-auth';
import { logPlatformAction, clientIp } from '@/lib/platform-audit';

const ownerUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional(),
  isSuperAdmin: z.boolean().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        isSuperAdmin: true,
        createdAt: true,
        updatedAt: true,
        memberships: {
          include: {
            tenant: {
              include: {
                subscription: { include: { plan: { select: { name: true, slug: true } } } },
                _count: { select: { orders: true, products: true, customers: true } },
              },
            },
            role: { select: { name: true } },
          },
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, userAgent: true, ipAddress: true, createdAt: true, expiresAt: true },
        },
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Aggregate revenue + recent orders
    let grossRevenue = 0;
    const tenants = user.memberships.map((m) => m.tenant);
    for (const t of tenants) {
      const agg = await prisma.order.aggregate({
        where: { tenantId: t.id },
        _sum: { grandTotal: true },
        _count: true,
      });
      grossRevenue += Number(agg._sum.grandTotal ?? 0);
    }

    // Recent platform activity (audit logs for this user's tenants is heavy; use security events + orders)
    const recentActivity = await prisma.securityEvent.findMany({
      where: { tenantId: { in: tenants.map((t) => t.id) } },
      orderBy: { timestamp: 'desc' },
      take: 20,
      select: { id: true, eventType: true, severity: true, timestamp: true, details: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        grossRevenue,
        memberships: user.memberships.map((m) => ({
          id: m.id,
          status: m.status,
          role: m.role.name,
          tenant: {
            ...m.tenant,
            subscription: m.tenant.subscription && { planName: m.tenant.subscription.plan.name, status: m.tenant.subscription.status },
            stats: {
              orders: m.tenant._count.orders,
              products: m.tenant._count.products,
              customers: m.tenant._count.customers,
            },
          },
        })),
        recentActivity,
      },
    });
  } catch (error: any) {
    console.error('Super admin owner detail error:', error);
    return NextResponse.json({ error: 'Failed to load owner' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const parsed = ownerUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, fullName: true, isSuperAdmin: true },
    });
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Guard: cannot strip super admin privileges from another super admin via this route
    if (existing.isSuperAdmin && parsed.data.isSuperAdmin === false) {
      const superAdminCount = await prisma.user.count({ where: { isSuperAdmin: true } });
      if (superAdminCount <= 1) {
        return NextResponse.json({ error: 'Cannot revoke the last super admin' }, { status: 400 });
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
    });

    await logPlatformAction({
      actorId: auth.userId!,
      actorEmail: auth.userEmail!,
      action: 'owner.update',
      targetType: 'user',
      targetId: id,
      targetName: existing.fullName,
      beforeState: {
        fullName: existing.fullName,
        email: existing.email,
        isSuperAdmin: existing.isSuperAdmin,
      },
      afterState: {
        fullName: updated.fullName,
        email: updated.email,
        isSuperAdmin: updated.isSuperAdmin,
      },
      ipAddress: clientIp(request),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Super admin owner update error:', error);
    return NextResponse.json({ error: 'Failed to update owner' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, fullName: true, isSuperAdmin: true },
    });
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (existing.isSuperAdmin) {
      return NextResponse.json({ error: 'Cannot delete a super admin via this route' }, { status: 400 });
    }

    // Suspend all memberships and revoke sessions instead of hard delete (keep audit trail)
    await prisma.$transaction(async (tx) => {
      await tx.userTenant.updateMany({
        where: { userId: id },
        data: { status: 'SUSPENDED' },
      });
      await tx.session.deleteMany({ where: { userId: id } });
    });

    await logPlatformAction({
      actorId: auth.userId!,
      actorEmail: auth.userEmail!,
      action: 'owner.suspend_all',
      targetType: 'user',
      targetId: id,
      targetName: existing.fullName,
      beforeState: { email: existing.email, status: 'ACTIVE' },
      afterState: { email: existing.email, status: 'SUSPENDED' },
      ipAddress: clientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Super admin owner suspend error:', error);
    return NextResponse.json({ error: 'Failed to suspend owner' }, { status: 500 });
  }
}