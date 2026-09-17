'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Crown, X } from 'lucide-react';
import { useEntitlements } from './EntitlementProvider';

type BannerState = {
  show: boolean;
  tone: 'amber' | 'rose';
  title: string;
  message: string;
};

function getBannerState(status: string, hasFullAccess: boolean, planName: string): BannerState {
  if (status === 'EXPIRED' || (status === 'TRIAL' && !hasFullAccess)) {
    return {
      show: true,
      tone: 'rose',
      title: status === 'TRIAL' && !hasFullAccess ? 'Your free trial has expired' : 'Your plan has expired',
      message: `Premium features are now blocked. Upgrade your plan to unlock ${planName === 'Free' ? 'paid' : 'all'} features and continue selling without interruption.`,
    };
  }
  if (status === 'CANCELLED') {
    return {
      show: true,
      tone: 'amber',
      title: 'Your plan has been cancelled',
      message: 'You are now on the Free plan with limited features. Upgrade to restore premium features.',
    };
  }
  if (status === 'SUSPENDED') {
    return {
      show: true,
      tone: 'rose',
      title: 'Your account is suspended',
      message: 'All premium features are blocked. Please upgrade or contact support to restore access.',
    };
  }
  if (status === 'PAST_DUE') {
    return {
      show: true,
      tone: 'amber',
      title: 'Payment failed — action required',
      message: 'Your last payment did not go through. Please upgrade or retry payment to avoid interruption.',
    };
  }
  return { show: false, tone: 'amber', title: '', message: '' };
}

export function PlanStatusBanner() {
  const { entitlements } = useEntitlements();
  const state = getBannerState(entitlements.status, entitlements.hasFullAccess, entitlements.plan.name);
  const [dismissed, setDismissed] = React.useState(false);

  if (!state.show || dismissed) return null;

  const isRose = state.tone === 'rose';

  return (
    <div
      role="alert"
      aria-live="polite"
      className={
        isRose
          ? 'bg-rose-600 text-white border-b border-rose-700'
          : 'bg-amber-500 text-white border-b border-amber-600'
      }
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            {isRose ? <AlertTriangle className="h-4 w-4 text-white" /> : <Crown className="h-4 w-4 text-white" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black leading-tight">{state.title}</p>
            <p className="text-xs font-medium text-white/90 leading-relaxed">{state.message}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/billing"
            className={
              isRose
                ? 'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white text-rose-700 text-xs font-black hover:bg-rose-50 transition'
                : 'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white text-amber-700 text-xs font-black hover:bg-amber-50 transition'
            }
          >
            <Crown className="h-3.5 w-3.5" />
            Upgrade plan
          </Link>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
