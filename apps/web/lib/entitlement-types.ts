export interface EntitlementPlan {
  slug: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
}

export interface EntitlementLimits {
  maxProducts: number;
  maxOrders: number;
  maxStaff: number;
  maxStorageMb: number;
}

export interface EntitlementSnapshot {
  plan: EntitlementPlan;
  status: string;
  hasFullAccess: boolean;
  features: string[];
  limits: EntitlementLimits;
}

export interface SessionSummary {
  tenantName: string | null;
  tenantSlug: string | null;
  gstin: string | null;
  location: string | null;
  userName: string | null;
  userEmail: string | null;
  role: string | null;
}
