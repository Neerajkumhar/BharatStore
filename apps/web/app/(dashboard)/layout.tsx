import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@bharatstore/database';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ImpersonationBanner } from '@/components/layout/ImpersonationBanner';
import { verifyJWT, SESSION_COOKIE_NAME } from '@/lib/auth';
import { getTenantEntitlements } from '@/lib/feature-check';
import type { EntitlementSnapshot, SessionSummary } from '@/lib/entitlement-types';

const EMPTY_SESSION: SessionSummary = {
  tenantName: null,
  tenantSlug: null,
  gstin: null,
  location: null,
  userName: null,
  userEmail: null,
  role: null,
};

const EMPTY_ENTITLEMENTS: EntitlementSnapshot = {
  plan: { slug: 'free', name: 'Free', monthlyPrice: 0, annualPrice: 0 },
  status: 'FREE',
  hasFullAccess: false,
  features: [],
  limits: { maxProducts: 5, maxOrders: 10, maxStaff: 1, maxStorageMb: 100 },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let impersonation: { tenantId?: string; impersonatedBy?: string } | null = null;
  let sessionSummary: SessionSummary = EMPTY_SESSION;
  let entitlements: EntitlementSnapshot = EMPTY_ENTITLEMENTS;
  let mustRedirectToSuperadmin = false;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      const session = await verifyJWT(token);
      if (session?.isImpersonation) {
        impersonation = {
          tenantId: session.tenantId,
          impersonatedBy: session.impersonatedBy,
        };
      } else if (!session?.tenantId) {
        // A non-impersonation session without a tenant (e.g. super admin)
        // must not access the merchant dashboard.
        mustRedirectToSuperadmin = true;
      }

      const tenantId = session?.tenantId;
      if (tenantId && !mustRedirectToSuperadmin) {
        const [ent, tenant, user] = await Promise.all([
          getTenantEntitlements(tenantId),
          prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { tradeName: true, slug: true, gstin: true, city: true, stateCode: true },
          }),
          session.userId
            ? prisma.user.findUnique({
                where: { id: session.userId },
                select: { fullName: true, email: true },
              })
            : Promise.resolve(null),
        ]);

        entitlements = {
          plan: ent.plan,
          status: ent.status,
          hasFullAccess: ent.hasFullAccess,
          features: ent.features,
          limits: ent.limits,
        };

        sessionSummary = {
          tenantName: tenant?.tradeName ?? null,
          tenantSlug: tenant?.slug ?? null,
          gstin: tenant?.gstin ?? null,
          location: tenant ? `${tenant.city} (${tenant.stateCode})` : null,
          userName: user?.fullName ?? null,
          userEmail: user?.email ?? null,
          role: session.role ?? null,
        };
      }
    }
  } catch {
    // Non-blocking: the shell handles its own auth UX
  }

  // Must run outside the try/catch — redirect() throws a control-flow signal.
  if (mustRedirectToSuperadmin) {
    redirect('/superadmin/overview');
  }

  return (
    <>
      {impersonation && <ImpersonationBanner impersonatedBy={impersonation.impersonatedBy} />}
      <DashboardShell entitlements={entitlements} session={sessionSummary}>
        {children}
      </DashboardShell>
    </>
  );
}
