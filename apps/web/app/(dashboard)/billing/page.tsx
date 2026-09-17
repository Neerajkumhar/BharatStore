'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Check,
  Lock,
  Package,
  ShoppingCart,
  Users,
  HardDrive,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api-client';
import { useEntitlements } from '@/components/entitlements/EntitlementProvider';
import { openRazorpayCheckout } from '@/lib/razorpay-client';

interface BillingFeature {
  slug: string;
  name: string;
  description: string | null;
  category: string;
  isPlatformWide: boolean;
  included: boolean;
}

interface BillingPlan {
  slug: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  annualPrice: number;
  maxProducts: number;
  maxOrders: number;
  maxStaff: number;
  maxStorageMb: number;
}

interface BillingData {
  plan: { slug: string; name: string; monthlyPrice: number; annualPrice: number };
  status: string;
  hasFullAccess: boolean;
  limits: { maxProducts: number; maxOrders: number; maxStaff: number; maxStorageMb: number };
  subscription: { status: string; planName: string; billingPeriod: string; trialEndsAt: string | null; currentPeriodEnd: string | null } | null;
  usage: { products: number; orders: number; staff: number; storageMb: number; apiCalls: number };
  features: BillingFeature[];
  plans: BillingPlan[];
}

const STATUS_LABELS: Record<string, string> = {
  FREE: 'No plan',
  TRIAL: 'Free trial',
  ACTIVE: 'Active',
  PAST_DUE: 'Payment due',
  CANCELLED: 'Cancelled',
  SUSPENDED: 'Suspended',
  EXPIRED: 'Expired',
};

function formatLimit(value: number): string {
  return value === -1 ? 'Unlimited' : value.toLocaleString('en-IN');
}

function UsageCard({
  icon: Icon,
  label,
  current,
  limit,
  suffix,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  current: number;
  limit: number;
  suffix?: string;
}) {
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : Math.min(100, Math.round((current / Math.max(1, limit)) * 100));
  const near = !unlimited && pct >= 80;
  const full = !unlimited && current >= limit;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500">
          <Icon className="h-4 w-4" />
          <span className="text-2xs font-bold uppercase tracking-wider">{label}</span>
        </div>
        <span
          className={cn(
            'text-xs font-bold',
            full ? 'text-rose-600' : near ? 'text-amber-600' : 'text-slate-700'
          )}
        >
          {current.toLocaleString('en-IN')}
          {suffix ?? ''} / {formatLimit(limit)}
          {suffix ?? ''}
        </span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            full ? 'bg-rose-500' : near ? 'bg-amber-500' : 'bg-emerald-500'
          )}
          style={{ width: unlimited ? '8%' : `${pct}%` }}
        />
      </div>
      {full && <p className="mt-2 text-2xs font-semibold text-rose-600">Limit reached — upgrade to add more.</p>}
    </div>
  );
}

export default function BillingPage() {
  const router = useRouter();
  const { entitlements } = useEntitlements();
  const [data, setData] = useState<BillingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [checkoutFor, setCheckoutFor] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchBilling = async () => {
    try {
      const res = await apiFetch('/api/billing');
      const json = await res.json();
      if (json?.success) {
        setData(json.data);
        setError(null);
      } else {
        setError(json?.error ?? 'Failed to load billing information');
      }
    } catch {
      setError('Failed to load billing information');
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const status = data?.status ?? entitlements.status;
  const planName = data?.plan.name ?? entitlements.plan.name;
  const hasFullAccess = data?.hasFullAccess ?? entitlements.hasFullAccess;

  async function handleCheckout(planSlug: string) {
    setCheckoutError(null);
    setSuccess(null);
    setCheckoutFor(planSlug);
    try {
      const res = await apiFetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug, billingPeriod }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to start checkout');
      }

      const { orderId, amount, currency, keyId, name, description } = json.data;

      const rzpResponse = await openRazorpayCheckout({
        keyId,
        orderId,
        amount,
        currency,
        name,
        description,
        prefill: json.data.prefill,
      });

      const verifyRes = await apiFetch('/api/billing/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rzpResponse),
      });
      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok || !verifyJson?.success) {
        throw new Error(verifyJson?.error || 'Payment verification failed');
      }

      setSuccess(`Upgraded to ${verifyJson.data?.planName ?? planSlug} successfully. Your new features are now active.`);
      await fetchBilling();
      router.refresh();
    } catch (err: any) {
      if (String(err?.message).toLowerCase().includes('cancelled')) {
        setCheckoutError(null);
      } else {
        setCheckoutError(err?.message || 'Checkout failed. Please try again.');
      }
    } finally {
      setCheckoutFor(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="h-6 w-6 text-amber-600" />
            Plan &amp; Billing
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Your current subscription, usage and available features.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}
      {checkoutError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {checkoutError}
        </div>
      )}

      {/* Current plan card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">Current plan</span>
              <span
                className={cn(
                  'text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                  hasFullAccess ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                )}
              >
                {STATUS_LABELS[status] ?? status}
              </span>
            </div>
            <p className="mt-1 text-2xl font-black text-slate-900">{planName}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {hasFullAccess
                ? `₹${(data?.plan.monthlyPrice ?? entitlements.plan.monthlyPrice).toLocaleString('en-IN')} / month`
                : 'Limited feature set — upgrade to unlock everything.'}
            </p>
            {data?.subscription?.currentPeriodEnd && hasFullAccess && (
              <p className="text-2xs text-slate-400 mt-1">
                Renews {new Date(data.subscription.currentPeriodEnd).toLocaleDateString('en-IN')} ·{' '}
                {data.subscription.billingPeriod === 'ANNUAL' ? 'Annual' : 'Monthly'} billing
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="#plans"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold shadow-xs transition"
            >
              <Sparkles className="h-4 w-4" />
              View plans
            </a>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div>
        <h2 className="text-sm font-black text-slate-900 mb-3">This month&apos;s usage</h2>
        {data ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <UsageCard icon={Package} label="Products" current={data.usage.products} limit={data.limits.maxProducts} />
            <UsageCard icon={ShoppingCart} label="Orders" current={data.usage.orders} limit={data.limits.maxOrders} />
            <UsageCard icon={Users} label="Staff" current={data.usage.staff} limit={data.limits.maxStaff} />
            <UsageCard
              icon={HardDrive}
              label="Storage"
              current={data.usage.storageMb}
              limit={data.limits.maxStorageMb}
              suffix=" MB"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl border border-slate-200 bg-white animate-pulse" />
            ))}
          </div>
        )}
      </div>

      {/* Feature catalog */}
      <div>
        <h2 className="text-sm font-black text-slate-900 mb-3">Features in your plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(data?.features ?? []).map((feature) => (
            <div
              key={feature.slug}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-4',
                feature.included ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50'
              )}
            >
              <div
                className={cn(
                  'h-7 w-7 shrink-0 rounded-full flex items-center justify-center',
                  feature.included ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                )}
              >
                {feature.included ? <Check className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">{feature.name}</span>
                  {!feature.included && (
                    <span className="text-2xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                      Locked
                    </span>
                  )}
                  {feature.isPlatformWide && (
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                      Included
                    </span>
                  )}
                </div>
                {feature.description && (
                  <p className="text-xs text-slate-500 mt-0.5">{feature.description}</p>
                )}
              </div>
            </div>
          ))}
          {!data && [0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl border border-slate-200 bg-white animate-pulse" />
          ))}
        </div>
      </div>

      {/* Plans */}
      <div id="plans">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-slate-900">Available plans</h2>
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 text-xs font-bold">
            <button
              onClick={() => setBillingPeriod('MONTHLY')}
              className={cn(
                'px-3 py-1 rounded-full transition',
                billingPeriod === 'MONTHLY' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('ANNUAL')}
              className={cn(
                'px-3 py-1 rounded-full transition',
                billingPeriod === 'ANNUAL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              Annual
              <span className="ml-1 text-2xs font-bold text-emerald-600">Save 17%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(data?.plans ?? []).map((plan) => {
            const current = plan.slug === (data?.plan.slug ?? entitlements.plan.slug);
            const isFree = plan.monthlyPrice === 0 && plan.annualPrice === 0;
            const displayPrice = billingPeriod === 'ANNUAL' ? plan.annualPrice : plan.monthlyPrice;
            const perLabel = billingPeriod === 'ANNUAL' ? ' /yr' : ' /mo';
            const isCheckoutLoading = checkoutFor === plan.slug;

            return (
              <div
                key={plan.slug}
                className={cn(
                  'rounded-xl border p-4 flex flex-col',
                  current ? 'border-amber-400 bg-amber-50/50 ring-1 ring-amber-300' : 'border-slate-200 bg-white'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">{plan.name}</span>
                  {current && (
                    <span className="text-2xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="mt-2 text-lg font-black text-slate-900">
                  {displayPrice === 0 ? 'Free' : `₹${displayPrice.toLocaleString('en-IN')}`}
                  {displayPrice > 0 && <span className="text-xs font-medium text-slate-500">{perLabel}</span>}
                </p>
                {plan.description && <p className="mt-1 text-xs text-slate-500">{plan.description}</p>}
                <ul className="mt-3 space-y-1 text-xs text-slate-600 flex-1">
                  <li>{formatLimit(plan.maxProducts)} products</li>
                  <li>{formatLimit(plan.maxOrders)} orders / mo</li>
                  <li>{formatLimit(plan.maxStaff)} staff</li>
                  <li>{formatLimit(plan.maxStorageMb)} MB storage</li>
                </ul>
                {!current && !isFree && (
                  <button
                    onClick={() => handleCheckout(plan.slug)}
                    disabled={!!checkoutFor}
                    className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white px-3 py-2 text-xs font-bold transition"
                  >
                    {isCheckoutLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>Upgrade to {plan.name}</>
                    )}
                  </button>
                )}
                {!current && isFree && (
                  <span className="mt-3 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
                    Downgrade via support
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-2xs text-slate-400">
          Payments are processed securely by Razorpay. Test mode is enabled — use the Razorpay test cards to try a real checkout.
        </p>
      </div>
    </div>
  );
}
