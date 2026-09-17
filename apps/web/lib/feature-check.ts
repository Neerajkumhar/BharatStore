import { prisma } from '@bharatstore/database';

export async function getTenantFeatures(tenantId: string): Promise<string[]> {
  const [subscription, overrides] = await Promise.all([
    prisma.tenantSubscription.findUnique({
      where: { tenantId },
      include: {
        plan: {
          include: {
            planFeatures: { include: { feature: true } },
          },
        },
      },
    }),
    prisma.tenantFeatureOverride.findMany({
      where: { tenantId },
      include: { feature: true },
    }),
  ]);

  const enabledFeatures = new Set<string>();

  // Platform-wide features are always enabled
  const platformWide = await prisma.featureFlag.findMany({
    where: { isPlatformWide: true },
    select: { slug: true },
  });
  platformWide.forEach((f) => enabledFeatures.add(f.slug));

  // Features from the tenant's active plan
  if (subscription && subscription.status !== 'CANCELLED' && subscription.status !== 'SUSPENDED') {
    subscription.plan.planFeatures.forEach((pf) => enabledFeatures.add(pf.feature.slug));
  }

  // Per-tenant overrides (grant or revoke)
  for (const override of overrides) {
    if (override.enabled) {
      enabledFeatures.add(override.feature.slug);
    } else {
      enabledFeatures.delete(override.feature.slug);
    }
  }

  return Array.from(enabledFeatures);
}

export async function hasFeatureAccess(tenantId: string, featureSlug: string): Promise<boolean> {
  const features = await getTenantFeatures(tenantId);
  return features.includes(featureSlug);
}

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  resource: string;
  planSlug?: string;
  status: string;
}

export async function checkTenantLimit(
  tenantId: string,
  resource: 'products' | 'orders' | 'staff' | 'storage',
  currentValue: number,
  byOne = false
): Promise<LimitCheckResult> {
  const subscription = await prisma.tenantSubscription.findUnique({
    where: { tenantId },
    include: { plan: true },
  });

  // No subscription yet -> default to FREE plan limits
  const status = subscription?.status ?? 'TRIAL';
  const plan = subscription?.plan ?? null;
  const planSlug = plan?.slug ?? 'free';

  if (status === 'SUSPENDED') {
    return {
      allowed: false,
      current: currentValue,
      limit: 0,
      resource,
      planSlug,
      status,
    };
  }

  const limitMap: Record<string, number> = {
    products: plan?.maxProducts ?? 50,
    orders: plan?.maxOrders ?? 500,
    staff: plan?.maxStaff ?? 3,
    storage: plan?.maxStorageMb ?? 500,
  };

  const limit = limitMap[resource];
  if (limit === -1) {
    // Unlimited
    return { allowed: true, current: currentValue, limit: -1, resource, planSlug, status };
  }

  const valueAfter = byOne ? currentValue + 1 : currentValue;
  return {
    allowed: valueAfter <= limit,
    current: currentValue,
    limit,
    resource,
    planSlug,
    status,
  };
}