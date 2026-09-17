'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ArrowRight } from 'lucide-react';
import { useEntitlements } from './EntitlementProvider';

export function LockedFeature({
  title,
  description,
}: {
  feature: string;
  title: string;
  description?: string;
}) {
  const { entitlements } = useEntitlements();
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-8 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
        <Lock className="h-6 w-6 text-amber-600" />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
        {description ?? 'This feature is not included in your current plan.'}
      </p>
      <p className="mt-2 text-2xs font-bold uppercase tracking-wider text-amber-700">
        Current plan: {entitlements.plan.name}
      </p>
      <Link
        href="/billing"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 transition"
      >
        View plans &amp; upgrade
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/**
 * Renders children when the tenant's plan includes `feature`, otherwise a
 * locked state with an upgrade path. UI-only — gated API routes also enforce
 * server-side so this cannot be bypassed.
 */
export function FeatureGate({
  feature,
  title,
  description,
  children,
}: {
  feature: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const { entitlements } = useEntitlements();
  if (entitlements.features.includes(feature)) return <>{children}</>;
  return <LockedFeature feature={feature} title={title} description={description} />;
}
