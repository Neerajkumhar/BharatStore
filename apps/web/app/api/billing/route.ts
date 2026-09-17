import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { getTenantEntitlements } from '@/lib/feature-check';
import { currentUsagePeriod } from '@/lib/usage';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.SETTINGS_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenantId = auth.tenantId;

    const period = currentUsagePeriod();
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [entitlements, usageRecord, products, staff, orders, catalog, plans] = await Promise.all([
      getTenantEntitlements(tenantId),
      prisma.tenantUsage.findUnique({ where: { tenantId_period: { tenantId, period } } }),
      prisma.product.count({ where: { tenantId } }),
      prisma.userTenant.count({ where: { tenantId } }),
      prisma.order.count({ where: { tenantId, createdAt: { gte: monthStart } } }),
      prisma.featureFlag.findMany({
        where: { isActive: true },
        orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
        select: { slug: true, name: true, description: true, category: true, isPlatformWide: true },
      }),
      prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        select: {
          slug: true,
          name: true,
          description: true,
          monthlyPrice: true,
          annualPrice: true,
          maxProducts: true,
          maxOrders: true,
          maxStaff: true,
          maxStorageMb: true,
        },
      }),
    ]);

    const enabled = new Set(entitlements.features);

    return NextResponse.json({
      success: true,
      data: {
        plan: entitlements.plan,
        status: entitlements.status,
        hasFullAccess: entitlements.hasFullAccess,
        limits: entitlements.limits,
        subscription: entitlements.subscription,
        usage: {
          products,
          orders,
          staff,
          storageMb: usageRecord?.storageUsedMb ?? 0,
          apiCalls: usageRecord?.apiCalls ?? 0,
        },
        features: catalog.map((f) => ({
          ...f,
          included: f.isPlatformWide || enabled.has(f.slug),
        })),
        plans: plans.map((p) => ({
          ...p,
          monthlyPrice: Number(p.monthlyPrice),
          annualPrice: Number(p.annualPrice),
        })),
      },
    });
  } catch (error: any) {
    console.error('Fetch billing info error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch billing information' }, { status: 500 });
  }
}
