import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { checkTenantLimit } from '@/lib/feature-check';
import { currentUsagePeriod, trackUsage } from '@/lib/usage';

export type EnforceableResource = 'products' | 'orders' | 'staff' | 'storage';

async function currentCount(tenantId: string, resource: EnforceableResource): Promise<number> {
  switch (resource) {
    case 'products':
      return prisma.product.count({ where: { tenantId } });
    case 'staff':
      return prisma.userTenant.count({ where: { tenantId } });
    case 'orders': {
      const period = currentUsagePeriod();
      const usage = await prisma.tenantUsage.findUnique({
        where: { tenantId_period: { tenantId, period } },
      });
      return usage?.ordersCount ?? 0;
    }
    case 'storage': {
      const period = currentUsagePeriod();
      const usage = await prisma.tenantUsage.findUnique({
        where: { tenantId_period: { tenantId, period } },
      });
      return Number(usage?.storageUsedMb ?? 0);
    }
  }
}

/**
 * Blocks the request when the tenant would exceed its plan limit.
 * Returns null when the request may proceed.
 */
export async function enforcePlanLimit(
  tenantId: string,
  resource: EnforceableResource,
  additionalUnits = 1
): Promise<NextResponse | null> {
  const current = await currentCount(tenantId, resource);
  const check = await checkTenantLimit(tenantId, resource, current, true);

  if (check.allowed) return null;

  return NextResponse.json(
    {
      error: `You have reached the ${resource} limit for your current plan`,
      data: {
        code: 'PLAN_LIMIT_EXCEEDED',
        resource: check.resource,
        current,
        limit: check.limit,
        planSlug: check.planSlug,
        subscriptionStatus: check.status,
      },
    },
    { status: 403 }
  );
}

/**
 * Records resource usage for the current billing period after a successful
 * create operation. Failures to track usage never fail the request itself.
 */
export async function recordUsage(
  tenantId: string,
  increment: Partial<{ productsCount: number; ordersCount: number; staffCount: number; storageUsedMb: number; apiCalls: number }>
): Promise<void> {
  try {
    await trackUsage(tenantId, increment);
  } catch (error) {
    console.error('Usage tracking failed (non-fatal):', error);
  }
}