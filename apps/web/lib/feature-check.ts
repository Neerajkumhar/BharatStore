import { cache } from 'react';
import { prisma } from '@bharatstore/database';
import { PLAN_LIMITS_LOOKUP, PLAN_SLUGS } from '@bharatstore/shared/constants';

const FREE_PLAN_SLUG = PLAN_SLUGS.FREE;
const FREE_LIMITS = PLAN_LIMITS_LOOKUP[FREE_PLAN_SLUG] ?? {
  maxProducts: 5,
  maxOrders: 10,
  maxStaff: 1,
  maxStorageMb: 100,
};

// Statuses that grant the tenant's plan features. TRIAL additionally requires
// an unexpired trialEndsAt. Everything else (CANCELLED, SUSPENDED, EXPIRED, an
// expired TRIAL) falls back to the Free plan's features.
const FULL_ACCESS_STATUSES = new Set(['ACTIVE', 'PAST_DUE']);

export interface TenantPlanSummary {
  slug: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
}

export interface TenantSubscriptionSummary {
  status: string;
  planSlug: string;
  planName: string;
  billingPeriod: string;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  cancelAt: Date | null;
}

export interface TenantEntitlements {
  tenantId: string;
  /** Effective plan — the tenant's plan when it has full access, otherwise Free. */
  plan: TenantPlanSummary;
  /** Raw subscription record (for display), or null when none exists. */
  subscription: TenantSubscriptionSummary | null;
  /** Raw subscription status, or 'FREE' when there is no subscription. */
  status: string;
  /** True when the plan's paid features apply (ACTIVE / PAST_DUE / unexpired TRIAL). */
  hasFullAccess: boolean;
  /** Enabled feature slugs (platform-wide + effective plan + overrides). */
  features: string[];
  limits: { maxProducts: number; maxOrders: number; maxStaff: number; maxStorageMb: number };
}

function planFeatureSlugs(
  plan: { planFeatures: { feature: { slug: string; isActive: boolean } }[] } | null | undefined
): string[] {
  if (!plan) return [];
  return plan.planFeatures.filter((pf) => pf.feature.isActive).map((pf) => pf.feature.slug);
}

async function loadTenantEntitlements(tenantId: string): Promise<TenantEntitlements> {
  const now = new Date();

  const [subscription, overrides, platformWide, freePlan] = await Promise.all([
    prisma.tenantSubscription.findUnique({
      where: { tenantId },
      include: {
        plan: { include: { planFeatures: { include: { feature: true } } } },
      },
    }),
    prisma.tenantFeatureOverride.findMany({
      where: { tenantId },
      include: { feature: true },
    }),
    prisma.featureFlag.findMany({
      where: { isPlatformWide: true, isActive: true },
      select: { slug: true },
    }),
    prisma.subscriptionPlan.findUnique({
      where: { slug: FREE_PLAN_SLUG },
      include: { planFeatures: { include: { feature: true } } },
    }),
  ]);

  const status = subscription?.status ?? 'FREE';
  const hasFullAccess =
    !!subscription &&
    (FULL_ACCESS_STATUSES.has(subscription.status) ||
      (subscription.status === 'TRIAL' &&
        (subscription.trialEndsAt === null || subscription.trialEndsAt > now)));

  const effectivePlan = hasFullAccess ? subscription!.plan : freePlan;

  const enabled = new Set<string>();
  platformWide.forEach((f) => enabled.add(f.slug));
  planFeatureSlugs(effectivePlan).forEach((slug) => enabled.add(slug));

  // Per-tenant overrides grant or revoke on top of the plan. Expired overrides
  // (expiresAt in the past) and inactive flags are ignored.
  for (const override of overrides) {
    if (!override.feature.isActive) continue;
    if (override.expiresAt && override.expiresAt <= now) continue;
    if (override.enabled) {
      enabled.add(override.feature.slug);
    } else {
      enabled.delete(override.feature.slug);
    }
  }

  const limits = effectivePlan
    ? {
        maxProducts: effectivePlan.maxProducts,
        maxOrders: effectivePlan.maxOrders,
        maxStaff: effectivePlan.maxStaff,
        maxStorageMb: effectivePlan.maxStorageMb,
      }
    : { ...FREE_LIMITS };

  const plan: TenantPlanSummary = effectivePlan
    ? {
        slug: effectivePlan.slug,
        name: effectivePlan.name,
        monthlyPrice: Number(effectivePlan.monthlyPrice),
        annualPrice: Number(effectivePlan.annualPrice),
      }
    : {
        slug: FREE_PLAN_SLUG,
        name: 'Free',
        monthlyPrice: 0,
        annualPrice: 0,
      };

  const subscriptionSummary: TenantSubscriptionSummary | null = subscription
    ? {
        status: subscription.status,
        planSlug: subscription.plan.slug,
        planName: subscription.plan.name,
        billingPeriod: subscription.billingPeriod,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAt: subscription.cancelAt,
      }
    : null;

  return {
    tenantId,
    plan,
    subscription: subscriptionSummary,
    status,
    hasFullAccess,
    features: Array.from(enabled),
    limits,
  };
}

/**
 * Resolves a tenant's effective entitlements. Cached per request (React cache)
 * so the layout, pages and API handlers share one set of queries.
 */
export const getTenantEntitlements = cache(loadTenantEntitlements);

export async function getTenantFeatures(tenantId: string): Promise<string[]> {
  const entitlements = await getTenantEntitlements(tenantId);
  return entitlements.features;
}

export async function hasFeatureAccess(tenantId: string, featureSlug: string): Promise<boolean> {
  const entitlements = await getTenantEntitlements(tenantId);
  return entitlements.features.includes(featureSlug);
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
    products: plan?.maxProducts ?? 5,
    orders: plan?.maxOrders ?? 10,
    staff: plan?.maxStaff ?? 1,
    storage: plan?.maxStorageMb ?? 100,
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
