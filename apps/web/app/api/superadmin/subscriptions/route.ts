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
    const status = url.searchParams.get('status')?.trim() || '';
    const tenantId = url.searchParams.get('tenant')?.trim() || '';
    const search = url.searchParams.get('search')?.trim() || '';

    const where: any = {};
    if (status) where.status = status;
    if (tenantId) where.tenantId = tenantId;

    const tenantWhere: any = {};
    if (search) {
      tenantWhere.OR = [
        { tradeName: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (Object.keys(tenantWhere).length) where.tenant = tenantWhere;

    const [subscriptions, total] = await Promise.all([
      prisma.tenantSubscription.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          tenant: {
            include: { _count: { select: { orders: true } } },
          },
          plan: true,
        },
      }),
      prisma.tenantSubscription.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: subscriptions.map((s) => ({
        id: s.id,
        status: s.status,
        trialEndsAt: s.trialEndsAt,
        currentPeriodStart: s.currentPeriodStart,
        currentPeriodEnd: s.currentPeriodEnd,
        cancelAt: s.cancelAt,
        cancelledAt: s.cancelledAt,
        monthlyPrice: Number(s.plan.monthlyPrice),
        planName: s.plan.name,
        planSlug: s.plan.slug,
        tenant: {
          id: s.tenant.id,
          tradeName: s.tenant.tradeName,
          slug: s.tenant.slug,
          isActive: s.tenant.isActive,
          orders: s.tenant._count.orders,
        },
        updatedAt: s.updatedAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('Super admin subscriptions list error:', error);
    return NextResponse.json({ error: 'Failed to load subscriptions' }, { status: 500 });
  }
}