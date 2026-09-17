export const PLAN_SLUGS = {
  FREE: 'free',
  STARTER: 'starter',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export type PlanSlug = (typeof PLAN_SLUGS)[keyof typeof PLAN_SLUGS];

export interface PlanDefinition {
  slug: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  maxProducts: number;
  maxOrders: number;
  maxStaff: number;
  maxStorageMb: number;
  description: string;
}

export const DEFAULT_PLANS: PlanDefinition[] = [
  {
    slug: PLAN_SLUGS.FREE,
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    maxProducts: 5,
    maxOrders: 10,
    maxStaff: 1,
    maxStorageMb: 100,
    description: 'For new businesses to get started with BharatStore.',
  },
  {
    slug: PLAN_SLUGS.STARTER,
    name: 'Starter',
    monthlyPrice: 499,
    annualPrice: 4990,
    maxProducts: 500,
    maxOrders: 5000,
    maxStaff: 10,
    maxStorageMb: 5000,
    description: 'For growing retailers with higher catalog and order volumes.',
  },
  {
    slug: PLAN_SLUGS.PRO,
    name: 'Pro',
    monthlyPrice: 1499,
    annualPrice: 14990,
    maxProducts: 5000,
    maxOrders: 50000,
    maxStaff: 50,
    maxStorageMb: 50000,
    description: 'For established businesses and wholesale distributors.',
  },
  {
    slug: PLAN_SLUGS.ENTERPRISE,
    name: 'Enterprise',
    monthlyPrice: 4999,
    annualPrice: 49990,
    maxProducts: -1,
    maxOrders: -1,
    maxStaff: -1,
    maxStorageMb: -1,
    description: 'Unlimited everything for large-scale operations.',
  },
];

export const PLAN_LIMITS_LOOKUP: Record<string, { maxProducts: number; maxOrders: number; maxStaff: number; maxStorageMb: number }> =
  DEFAULT_PLANS.reduce(
    (acc, plan) => {
      acc[plan.slug] = {
        maxProducts: plan.maxProducts,
        maxOrders: plan.maxOrders,
        maxStaff: plan.maxStaff,
        maxStorageMb: plan.maxStorageMb,
      };
      return acc;
    },
    {} as Record<string, { maxProducts: number; maxOrders: number; maxStaff: number; maxStorageMb: number }>
  );