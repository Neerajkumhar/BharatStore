'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  User,
  BadgeCheck,
  ToggleLeft,
  Package,
  ShoppingCart,
  Users,
  FileText,
  IndianRupee,
  Ban,
  CheckCircle2,
  Play,
  Pencil,
  Crown,
  Activity,
  Database,
  CircleDollarSign,
  Calendar,
  Mail,
  Phone,
} from 'lucide-react';

interface TenantDetail {
  id: string;
  tradeName: string;
  legalName: string;
  slug: string;
  gstin: string | null;
  pan: string | null;
  isCompositeScheme: boolean;
  currency: string;
  phone: string;
  email: string | null;
  addressLine1: string;
  city: string;
  stateCode: string;
  pincode: string;
  isActive: boolean;
  createdAt: string;
  owner: { id: string; fullName: string; email: string; phone: string } | null;
  subscription: {
    id: string;
    status: string;
    trialEndsAt: string | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelledAt: string | null;
    monthlyPrice: number;
    planName: string;
    planSlug: string;
    planMeta: { maxProducts: number; maxOrders: number; maxStaff: number; maxStorageMb: number };
  } | null;
  featureOverrides: Array<{ id: string; featureSlug: string; featureName: string; enabled: boolean; reason: string | null; expiresAt: string | null }>;
  enabledFeatures: string[];
  stats: {
    orders: number;
    products: number;
    customers: number;
    variants: number;
    invoices: number;
    grossRevenue: number;
  };
  usage: { period: string; productsCount: number; ordersCount: number; staffCount: number; storageUsedMb: number; apiCalls: number } | null;
}

const statusBadge: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  TRIAL: 'bg-blue-50 text-blue-700 border-blue-200',
  SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-200',
  PAST_DUE: 'bg-amber-50 text-amber-700 border-amber-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
  EXPIRED: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function SuperAdminTenantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = typeof params.tenantId === 'string' ? params.tenantId : '';
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/superadmin/tenants/${tenantId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTenant(d.data);
        else setMessage({ type: 'error', text: d.error || 'Failed to load tenant' });
      })
      .catch(() => setMessage({ type: 'error', text: 'Network error' }))
      .finally(() => setLoading(false));
  }, [tenantId]);

  useEffect(load, [load]);

  const act = async (action: string, method: string, url: string, successMsg: string) => {
    setActing(action);
    setMessage(null);
    try {
      const res = await fetch(url, { method });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      setMessage({ type: 'success', text: successMsg });
      if (action !== 'impersonate') load();
      if (action === 'impersonate' && data.tenant) {
        window.location.href = '/dashboard';
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setActing(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-8 space-y-5 animate-pulse">
        <div className="h-8 w-56 bg-slate-200 rounded-lg" />
        <div className="grid md:grid-cols-3 gap-5">
          <div className="h-64 bg-slate-200 rounded-xl" />
          <div className="h-64 bg-slate-200 rounded-xl" />
          <div className="h-64 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-6 sm:p-8">
        <p className="text-sm text-slate-500">Tenant not found.</p>
        <Link href="/superadmin/tenants" className="text-xs text-amber-600 font-semibold mt-2 inline-block">← Back to all businesses</Link>
      </div>
    );
  }

  const usageRatio = (used: number, limit: number) => (limit === -1 ? 0 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100)));

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{tenant.tradeName}</h1>
              <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${tenant.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                {tenant.isActive ? 'Active' : 'Suspended'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{tenant.slug} · {tenant.gstin ?? 'No GSTIN'} · since {new Date(tenant.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => act('impersonate', 'POST', `/api/superadmin/tenants/${tenant.id}/impersonate`, 'Impersonation started')}
            disabled={acting !== null || !tenant.isActive}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            {acting === 'impersonate' ? 'Starting...' : 'Login as Owner'}
          </button>
          {tenant.isActive ? (
            <button
              onClick={() => act('suspend', 'POST', `/api/superadmin/tenants/${tenant.id}/suspend`, 'Business suspended')}
              disabled={acting !== null}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg disabled:opacity-50"
            >
              <Ban className="h-3.5 w-3.5" />
              {acting === 'suspend' ? 'Suspending...' : 'Suspend'}
            </button>
          ) : (
            <button
              onClick={() => act('reactivate', 'POST', `/api/superadmin/tenants/${tenant.id}/reactivate`, 'Business reactivated')}
              disabled={acting !== null}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {acting === 'reactivate' ? 'Reactivating...' : 'Reactivate'}
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}>
          {message.text}
        </div>
      )}

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Orders', value: tenant.stats.orders.toLocaleString('en-IN'), icon: ShoppingCart, color: 'bg-indigo-100 text-indigo-600' },
          { label: 'Products', value: tenant.stats.products.toLocaleString('en-IN'), icon: Package, color: 'bg-amber-100 text-amber-600' },
          { label: 'Customers', value: tenant.stats.customers.toLocaleString('en-IN'), icon: Users, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Variants', value: tenant.stats.variants.toLocaleString('en-IN'), icon: Database, color: 'bg-blue-100 text-blue-600' },
          { label: 'Invoices', value: tenant.stats.invoices.toLocaleString('en-IN'), icon: FileText, color: 'bg-purple-100 text-purple-600' },
          { label: 'Gross Revenue', value: `₹${tenant.stats.grossRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-green-100 text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="h-3.5 w-3.5" />
              </div>
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
            </div>
            <p className="text-lg font-black text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Business Info */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" /> Business Profile
            </h2>
            <Link href={`/superadmin/tenants/${tenant.id}/edit`} className="text-xs font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1">
              <Pencil className="h-3 w-3" /> Edit
            </Link>
          </div>
          <div className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
              <div>
                <p className="text-2xs text-slate-400 font-medium uppercase tracking-wide">Legal Name</p>
                <p className="text-slate-800 font-semibold mt-0.5">{tenant.legalName}</p>
              </div>
              <div>
                <p className="text-2xs text-slate-400 font-medium uppercase tracking-wide">Trade Name</p>
                <p className="text-slate-800 font-semibold mt-0.5">{tenant.tradeName}</p>
              </div>
              <div>
                <p className="text-2xs text-slate-400 font-medium uppercase tracking-wide">GSTIN</p>
                <p className="font-mono text-slate-700 mt-0.5">{tenant.gstin ?? '—'}</p>
              </div>
              <div>
                <p className="text-2xs text-slate-400 font-medium uppercase tracking-wide">PAN</p>
                <p className="font-mono text-slate-700 mt-0.5">{tenant.pan ?? '—'}</p>
              </div>
              <div>
                <p className="text-2xs text-slate-400 font-medium uppercase tracking-wide">Scheme</p>
                <p className="text-slate-700 mt-0.5">{tenant.isCompositeScheme ? 'Composite' : 'Regular'}</p>
              </div>
              <div>
                <p className="text-2xs text-slate-400 font-medium uppercase tracking-wide">Currency</p>
                <p className="text-slate-700 mt-0.5">{tenant.currency}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <p className="text-slate-600 flex items-start gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                {tenant.phone}
              </p>
              {tenant.email && (
                <p className="text-slate-600 flex items-start gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                  {tenant.email}
                </p>
              )}
              <p className="text-slate-600 flex items-start gap-2">
                <CircleDollarSign className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                {tenant.addressLine1}, {tenant.city} {tenant.pincode} ({tenant.stateCode})
              </p>
            </div>
          </div>
        </div>

        {/* Owner */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" /> Business Owner
            </h2>
            {tenant.owner && (
              <Link href={`/superadmin/owners/${tenant.owner.id}`} className="text-xs font-semibold text-amber-600 hover:text-amber-700">
                View Profile
              </Link>
            )}
          </div>
          <div className="p-4">
            {tenant.owner ? (
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center shrink-0">
                  {tenant.owner.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {tenant.owner.fullName}
                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{tenant.owner.email}</p>
                  <p className="text-xs text-slate-500">{tenant.owner.phone}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No active owner membership found for this tenant.</p>
            )}
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-slate-400" /> Subscription
            </h2>
            <Link href={`/superadmin/subscriptions?tenant=${tenant.id}`} className="text-xs font-semibold text-amber-600 hover:text-amber-700">
              Change Plan
            </Link>
          </div>
          {tenant.subscription ? (
            <div className="p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-slate-900">{tenant.subscription.planName}</span>
                <span className={`text-2xs font-bold px-2 py-1 rounded-full border ${statusBadge[tenant.subscription.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  {tenant.subscription.status}
                </span>
              </div>
              <p className="text-slate-500">₹{tenant.subscription.monthlyPrice.toLocaleString('en-IN')}/month</p>
              {tenant.subscription.trialEndsAt && (
                <p className="text-2xs text-blue-600 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Trial ends {new Date(tenant.subscription.trialEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
              {tenant.subscription.cancelledAt && (
                <p className="text-2xs text-rose-600">Cancelled on {new Date(tenant.subscription.cancelledAt).toLocaleDateString('en-IN')}</p>
              )}
              {tenant.subscription.currentPeriodEnd && (
                <p className="text-2xs text-slate-500">Period ends {new Date(tenant.subscription.currentPeriodEnd).toLocaleDateString('en-IN')}</p>
              )}
            </div>
          ) : (
            <div className="p-4">
              <p className="text-xs text-slate-400">No active subscription. Tenant defaults to the Free plan.</p>
              <Link href={`/superadmin/subscriptions?tenant=${tenant.id}`} className="text-xs font-semibold text-amber-600 mt-2 inline-block">
                Assign a plan →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Plan usage + Features */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Plan usage */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-400" /> Plan Usage {tenant.usage ? `(${tenant.usage.period})` : ''}
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {[
              { label: 'Products', current: tenant.stats.products, limit: tenant.subscription?.planMeta.maxProducts ?? 50 },
              { label: 'Orders', current: tenant.stats.orders, limit: tenant.subscription?.planMeta.maxOrders ?? 500 },
              { label: 'Staff', current: tenant.usage?.staffCount ?? 0, limit: tenant.subscription?.planMeta.maxStaff ?? 3 },
              { label: 'Storage', current: Math.round(tenant.usage?.storageUsedMb ?? 0), limit: tenant.subscription?.planMeta.maxStorageMb ?? 500 },
            ].map((row) => {
              const pct = usageRatio(row.current, row.limit);
              const unlimited = row.limit === -1;
              const over = !unlimited && row.current > row.limit;
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">{row.label}</span>
                    <span className={`font-mono ${over ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                      {unlimited ? '∞' : `${row.current.toLocaleString('en-IN')} / ${row.limit.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${over ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${unlimited ? 100 : pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {tenant.usage && tenant.usage.apiCalls > 0 && (
              <p className="text-2xs text-slate-400">API calls this period: {tenant.usage.apiCalls.toLocaleString('en-IN')}</p>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ToggleLeft className="h-4 w-4 text-slate-400" /> Feature Access
            </h2>
            <span className="text-2xs font-bold text-slate-500">{tenant.enabledFeatures.length} enabled</span>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {tenant.enabledFeatures.map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5 text-2xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  {f.replace(/_/g, ' ')}
                </span>
              ))}
              {tenant.enabledFeatures.length === 0 && (
                <p className="text-xs text-slate-400">No features enabled.</p>
              )}
            </div>

            {tenant.featureOverrides.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-2">Custom Overrides</p>
                <div className="space-y-2">
                  {tenant.featureOverrides.map((o) => (
                    <div key={o.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{o.featureName}</p>
                        <p className="text-2xs text-slate-400">{o.featureSlug}{o.reason ? ` · ${o.reason}` : ''}</p>
                      </div>
                      <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${o.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {o.enabled ? 'Granted' : 'Revoked'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back */}
      <div className="pt-2">
        <Link href="/superadmin/tenants" className="text-xs font-semibold text-slate-500 hover:text-slate-700 inline-flex items-center gap-1">
          ← Back to all businesses
        </Link>
      </div>
    </div>
  );
}