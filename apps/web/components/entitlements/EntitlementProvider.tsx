'use client';

import React, { createContext, useContext } from 'react';
import type { EntitlementSnapshot, SessionSummary } from '@/lib/entitlement-types';

interface EntitlementContextValue {
  entitlements: EntitlementSnapshot;
  session: SessionSummary;
}

const EntitlementContext = createContext<EntitlementContextValue | null>(null);

export function EntitlementProvider({
  entitlements,
  session,
  children,
}: {
  entitlements: EntitlementSnapshot;
  session: SessionSummary;
  children: React.ReactNode;
}) {
  return (
    <EntitlementContext.Provider value={{ entitlements, session }}>{children}</EntitlementContext.Provider>
  );
}

export function useEntitlements(): EntitlementContextValue {
  const ctx = useContext(EntitlementContext);
  if (!ctx) throw new Error('useEntitlements must be used within an EntitlementProvider');
  return ctx;
}

export function useHasFeature(featureSlug: string): boolean {
  return useEntitlements().entitlements.features.includes(featureSlug);
}
