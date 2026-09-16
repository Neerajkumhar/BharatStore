'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  BadgeCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  IndianRupee,
  Crown,
  Package,
} from 'lucide-react';

interface OverviewData {
  success: boolean;
  data: {
    summary: {
      totalTenants: number;
      activeTenants: number;
      suspendedTenants: number;
      totalOwners: number;
      activeSubscriptions: number;
      monthlyRevenue: number;
      newTenantsThisMonth: number;
    };
    growth: { labels: string[]; counts: number[] };
    recentTenants: Array<{
      id: string;
      tradeName: string;
      slug: string;
      status: string;
      createdAt: string;
      owner: { fullName: string; email: string } | null;
      plan: string;
      ordersCount: number;
      productsCount: number;
    }>;
    recentSubscriptions: Array<{
      id: string;
      tenantId: string;
      status: string;
      planName: string;
      monthlyPrice: number;
      tenant: string;
      updatedAt: string;
    }>;
    trialExpiring: Array<{
      tenantId: string;
      tenant: string;
      trialEndsAt: string;
      planName: string;
    }>;
    topTenants: Array<{
      id: string;
      tradeName: string;
      ordersCount: number;
      plan: string;
    }>;
  };
}

function StatCard({ label, value, icon: Icon, color, suffix }: { label: string; value: string | number; icon: any; color: string; suffix?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{value}</span>
        {suffix && <span className="text-xs font-semibold text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}

const statusBadge: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  TRIAL: 'bg-blue-50 text-blue-700 border-blue-200',
  SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-200',
  PAST_DUE: 'bg-amber-50 text-amber-700 border-amber-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
  EXPIRED: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function SuperAdminOverviewPage() {
  const [data, setData] = useState<OverviewData['data'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/superadmin/overview')
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 sm:p-8 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 sm:p-8 text-center text-sm text-slate-500">Failed to load platform overview.</div>
    );
  }

  const { summary, growth, recentTenants, recentSubscriptions, trialExpiring, topTenants } = data;
  const maxGrowth = Math.max(...growth.counts, 1);

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" />
            Platform Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">BharatStore SaaS platform health and tenant management.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Businesses"
          value={summary.totalTenants}
          icon={Building2}
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          label="Active Owners"
          value={summary.totalOwners}
          icon={Users}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          label="Active Subscriptions"
          value={summary.activeSubscriptions}
          icon={BadgeCheck}
          color="bg-amber-100 text-amber-600"
        />
        <StatCard
          label="MRR"
          value={`₹${summary.monthlyRevenue.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="bg-green-100 text-green-600"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">{summary.newTenantsThisMonth}</p>
            <p className="text-2xs text-slate-500 font-medium">New this month</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">{summary.activeTenants}</p>
            <p className="text-2xs text-slate-500 font-medium">Active tenants</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">{trialExpiring.length}</p>
            <p className="text-2xs text-slate-500 font-medium">Trials expiring (7 days)</p>
          </div>
        </div>
      </div>

      {/* Tenant Growth Chart (simple bar chart) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Tenant Growth (Last 6 Months)</h2>
        <div className="flex items-end gap-3 h-40">
          {growth.labels.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-2xs font-bold text-slate-600">{growth.counts[i]}</span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-amber-500 to-amber-400 transition-all"
                style={{ height: `${(growth.counts[i] / maxGrowth) * 100}%`, minHeight: growth.counts[i] > 0 ? 12 : 2 }}
              />
              <span className="text-2xs text-slate-500 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column: Recent Tenants + Top Tenants */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Tenants */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Recent Businesses</h2>
            <Link href="/superadmin/tenants" className="text-xs font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentTenants.map((t) => (
              <Link key={t.id} href={`/superadmin/tenants/${t.id}`} className="block p-4 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{t.tradeName}</p>
                  <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${statusBadge[t.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {t.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-2xs text-slate-500">
                  <span>{t.owner?.fullName ?? 'No owner'}</span>
                  <span className="inline-flex items-center gap-1"><BadgeCheck className="h-2.5 w-2.5" /> {t.plan}</span>
                  <span>{t.ordersCount} orders</span>
                </div>
              </Link>
            ))}
            {recentTenants.length === 0 && (
              <p className="p-4 text-xs text-slate-400 text-center">No tenants yet.</p>
            )}
          </div>
        </div>

        {/* Top Tenants by Orders */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Top Tenants by Orders</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {topTenants.map((t, i) => (
              <Link key={t.id} href={`/superadmin/tenants/${t.id}`} className="block p-4 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-400 w-5 text-center">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{t.tradeName}</p>
                    <div className="flex items-center gap-3 text-2xs text-slate-500 mt-0.5">
                      <span className="inline-flex items-center gap-1"><Package className="h-2.5 w-2.5" /> {t.ordersCount} orders</span>
                      <span className="inline-flex items-center gap-1"><BadgeCheck className="h-2.5 w-2.5" /> {t.plan}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {topTenants.length === 0 && (
              <p className="p-4 text-xs text-slate-400 text-center">No tenants yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Trial Expiring Alerts */}
      {trialExpiring.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h2 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Trials Expiring Within 7 Days
          </h2>
          <div className="divide-y divide-amber-200">
            {trialExpiring.map((s) => (
              <div key={s.tenantId} className="py-2 flex items-center justify-between text-xs">
                <Link href={`/superadmin/tenants/${s.tenantId}`} className="font-semibold text-amber-900 hover:text-amber-700 underline decoration-dotted underline-offset-2">{s.tenant}</Link>
                <span className="text-amber-700">
                  Expires: {new Date(s.trialEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Subscription Activity */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Recent Subscription Activity</h2>
          <Link href="/superadmin/subscriptions" className="text-xs font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-2xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="text-left px-4 py-2.5">Business</th>
                <th className="text-left px-4 py-2.5">Plan</th>
                <th className="text-right px-4 py-2.5">Monthly</th>
                <th className="text-center px-4 py-2.5">Status</th>
                <th className="text-right px-4 py-2.5">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentSubscriptions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/superadmin/tenants/${s.tenantId}`} className="font-semibold text-slate-900 hover:text-amber-600 transition">
                      {s.tenant}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{s.planName}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-600">₹{s.monthlyPrice.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${statusBadge[s.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-500">
                    {new Date(s.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}