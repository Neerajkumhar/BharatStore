import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { authorizeSuperAdmin } from '@/lib/superadmin-auth';

export async function GET(request: Request) {
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [totalTenants, activeTenants, suspendedTenants, totalOwners, activeSubscriptions, totalRevenue, newTenantsThisMonth, recentTenants, recentSubscriptions, trialExpiring, topTenants] =
      await Promise.all([
        prisma.tenant.count(),
        prisma.tenant.count({ where: { isActive: true } }),
        prisma.tenant.count({ where: { isActive: false } }),
        prisma.userTenant.count({ where: { role: { name: 'OWNER' } } }),
        prisma.tenantSubscription.count({ where: { status: { in: ['TRIAL', 'ACTIVE', 'PAST_DUE'] } } }),
        prisma.tenantSubscription.findMany({
          where: { status: { in: ['TRIAL', 'ACTIVE', 'PAST_DUE'] } },
          include: { plan: true },
        }),
        prisma.tenant.count({ where: { createdAt: { gte: monthStart } } }),
        prisma.tenant.findMany({
          orderBy: { createdAt: 'desc' },
          take: 8,
          include: {
            memberships: { where: { role: { name: 'OWNER' } }, include: { user: { select: { fullName: true, email: true } }, role: true } },
            subscription: { include: { plan: true } },
            _count: { select: { orders: true, products: true } },
          },
        }),
        prisma.tenantSubscription.findMany({
          orderBy: { updatedAt: 'desc' },
          take: 8,
          include: {
            tenant: { select: { id: true, tradeName: true, slug: true } },
            plan: { select: { name: true, slug: true, monthlyPrice: true } },
          },
        }),
        prisma.tenantSubscription.findMany({
          where: { status: 'TRIAL', trialEndsAt: { lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } },
          include: {
            tenant: { select: { id: true, tradeName: true, slug: true } },
            plan: { select: { name: true } },
          },
        }),
        prisma.tenant.findMany({
          orderBy: { orders: { _count: 'desc' } },
          take: 5,
          include: {
            _count: { select: { orders: true } },
            subscription: { include: { plan: { select: { name: true, slug: true } } } },
          },
        }),
      ]);

    const monthlyRevenue = totalRevenue.reduce((sum, sub) => {
      if (sub.status === 'PAST_DUE') return sum;
      const price = Number(sub.plan.monthlyPrice) || 0;
      return sum + price;
    }, 0);

    // Tenant growth: last 6 months
    const growthLabels: string[] = [];
    const growthCounts: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const [count] = await Promise.all([
        prisma.tenant.count({ where: { createdAt: { gte: d, lt: next } } }),
      ]);
      growthLabels.push(d.toLocaleString('en-IN', { month: 'short' }));
      growthCounts.push(count);
    }

    const ownerCount = await prisma.user.count({ where: { isSuperAdmin: false } });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalTenants,
          activeTenants,
          suspendedTenants,
          totalOwners: ownerCount,
          activeSubscriptions,
          monthlyRevenue,
          newTenantsThisMonth,
        },
        growth: { labels: growthLabels, counts: growthCounts },
        recentTenants: recentTenants.map((t) => ({
          id: t.id,
          tradeName: t.tradeName,
          slug: t.slug,
          status: t.isActive ? 'ACTIVE' : 'SUSPENDED',
          createdAt: t.createdAt,
          owner: t.memberships[0]?.user ?? null,
          plan: t.subscription?.plan?.name ?? 'Free',
          ordersCount: t._count.orders,
          productsCount: t._count.products,
        })),
        recentSubscriptions: recentSubscriptions.map((s) => ({
          id: s.id,
          tenantId: s.tenant.id,
          status: s.status,
          planName: s.plan.name,
          monthlyPrice: Number(s.plan.monthlyPrice),
          tenant: s.tenant.tradeName,
          tenantSlug: s.tenant.slug,
          updatedAt: s.updatedAt,
        })),
        trialExpiring: trialExpiring.map((s) => ({
          tenantId: s.tenant.id,
          tenant: s.tenant.tradeName,
          trialEndsAt: s.trialEndsAt,
          planName: s.plan.name,
        })),
        topTenants: topTenants.map((t) => ({
          id: t.id,
          tradeName: t.tradeName,
          slug: t.slug,
          ordersCount: t._count.orders,
          plan: t.subscription?.plan?.name ?? 'Free',
        })),
        usage: { period },
      },
    });
  } catch (error: any) {
    console.error('Super admin overview error:', error);
    return NextResponse.json({ error: 'Failed to load platform overview' }, { status: 500 });
  }
}