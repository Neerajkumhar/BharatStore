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
    const status = url.searchParams.get('status')?.trim() || '';
    const planSlug = url.searchParams.get('plan')?.trim() || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { tradeName: { contains: search, mode: 'insensitive' } },
        { legalName: { contains: search, mode: 'insensitive' } },
        { gstin: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'active') where.isActive = true;
    if (status === 'suspended') where.isActive = false;

    if (planSlug) {
      where.subscription = { plan: { slug: planSlug } };
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          memberships: {
            where: { role: { name: 'OWNER' } },
            include: { user: { select: { id: true, fullName: true, email: true } } },
          },
          subscription: { include: { plan: true } },
          _count: {
            select: { orders: true, products: true, customers: true },
          },
        },
      }),
      prisma.tenant.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: tenants.map((t) => ({
        id: t.id,
        tradeName: t.tradeName,
        legalName: t.legalName,
        slug: t.slug,
        gstin: t.gstin,
        stateCode: t.stateCode,
        city: t.city,
        isActive: t.isActive,
        createdAt: t.createdAt,
        owner: t.memberships[0]?.user ?? null,
        subscription: t.subscription
          ? {
              plan: t.subscription.plan.name,
              planSlug: t.subscription.plan.slug,
              status: t.subscription.status,
              trialEndsAt: t.subscription.trialEndsAt,
            }
          : null,
        stats: {
          orders: t._count.orders,
          products: t._count.products,
          customers: t._count.customers,
        },
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('Super admin tenants list error:', error);
    return NextResponse.json({ error: 'Failed to load tenants' }, { status: 500 });
  }
}