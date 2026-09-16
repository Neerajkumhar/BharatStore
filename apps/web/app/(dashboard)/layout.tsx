import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ImpersonationBanner } from '@/components/layout/ImpersonationBanner';
import { verifyJWT, SESSION_COOKIE_NAME } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Detect impersonation sessions to show the super admin banner
  let impersonation: { tenantId?: string; impersonatedBy?: string } | null = null;
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
        redirect('/superadmin/overview');
      }
    }
  } catch (e) {
    // Non-blocking: the shell handles its own auth UX
  }

  return (
    <>
      {impersonation && <ImpersonationBanner impersonatedBy={impersonation.impersonatedBy} />}
      <DashboardShell>{children}</DashboardShell>
    </>
  );
}
