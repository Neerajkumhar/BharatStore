'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, ArrowRight, X, AlertTriangle } from 'lucide-react';

export const UPGRADE_EVENT = 'bharatstore:upgrade';

export interface UpgradeDetail {
  code: 'PLAN_LIMIT_EXCEEDED' | 'FEATURE_NOT_IN_PLAN';
  resource?: string;
  feature?: string;
  current?: number;
  limit?: number;
  planSlug?: string;
  subscriptionStatus?: string;
}

/** Opens the global upgrade modal from anywhere in the client app. */
export function showUpgradePrompt(detail: UpgradeDetail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<UpgradeDetail>(UPGRADE_EVENT, { detail }));
  }
}

export function UpgradePromptHost() {
  const [detail, setDetail] = useState<UpgradeDetail | null>(null);

  useEffect(() => {
    const handler = (event: Event) => setDetail((event as CustomEvent<UpgradeDetail>).detail);
    window.addEventListener(UPGRADE_EVENT, handler);
    return () => window.removeEventListener(UPGRADE_EVENT, handler);
  }, []);

  if (!detail) return null;

  const isLimit = detail.code === 'PLAN_LIMIT_EXCEEDED';
  const resource = detail.resource ? detail.resource.charAt(0).toUpperCase() + detail.resource.slice(1) : 'Resource';
  const title = isLimit ? `${resource} limit reached` : 'Upgrade to unlock this feature';
  const body = isLimit
    ? `Your current plan allows ${detail.limit === -1 ? 'unlimited' : detail.limit} ${detail.resource}${
        detail.limit === -1 ? '' : 's'
      } and you already have ${detail.current}. Upgrade to add more.`
    : 'This feature is not included in your current plan. Upgrade to get access.';

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => setDetail(null)}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 p-5 border-b border-slate-100">
          <div className="h-10 w-10 shrink-0 rounded-full bg-amber-100 flex items-center justify-center">
            {isLimit ? <AlertTriangle className="h-5 w-5 text-amber-600" /> : <Lock className="h-5 w-5 text-amber-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-slate-900">{title}</h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">{body}</p>
          </div>
          <button
            onClick={() => setDetail(null)}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 flex items-center justify-end gap-2">
          <button
            onClick={() => setDetail(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-100"
          >
            Not now
          </button>
          <Link
            href="/billing"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
          >
            View plans & upgrade
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
