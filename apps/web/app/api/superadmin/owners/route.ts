import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { authorizeSuperAdmin } from '@/lib/superadmin-auth';

export async function GET(request: Request) {
  const auth = await authorizeSuperAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const search = url.searchParams.get('search')?.trim() || '';
    const onlyOwners = url.searchParams.get('role') === 'owner';

    // Owners = users who are OWNER members of at least one tenant
    const where: any = {
      isSuperAdmin: false,
      memberships: { some: onlyOwners ? { role: { name: 'OWNER' } } : {} },
    };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          memberships: {
            include: {
              tenant: {
                include: {
                  _count: { select: { orders: true } },
                },
              },
              role: { select: { name: true } },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Aggregate revenue per user across their tenancies
    const rows = await Promise.all(
      users.map(async (u) => {
        const ownedTenants = u.memberships.filter((m) => m.role.name === 'OWNER').map((m) => m.tenant);
        let grossRevenue = 0;
        for (const t of ownedTenants) {
          const agg = await prisma.order.aggregate({
            where: { tenantId: t.id },
            _sum: { grandTotal: true },
          });
          grossRevenue += Number(agg._sum.grandTotal ?? 0);
        }
        return {
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          isSuperAdmin: u.isSuperAdmin,
          createdAt: u.createdAt,
          ownedTenants: ownedTenants.map((t) => ({
            id: t.id,
            tradeName: t.tradeName,
            slug: t.slug,
            isActive: t.isActive,
            orders: t._count.orders,
            role: 'OWNER',
          })),
          allTenants: u.memberships.map((m) => ({
            id: m.tenant.id,
            tradeName: m.tenant.tradeName,
            slug: m.tenant.slug,
            role: m.role.name,
            status: m.status,
          })),
          grossRevenue,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('Super admin owners list error:', error);
    return NextResponse.json({ error: 'Failed to load owners' }, { status: 500 });
  }
}