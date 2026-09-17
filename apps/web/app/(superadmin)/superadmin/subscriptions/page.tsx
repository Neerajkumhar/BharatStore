'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Calendar,
  Building2,
} from 'lucide-react';

interface SubRow {
  id: string;
  status: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAt: string | null;
  cancelledAt: string | null;
  monthlyPrice: number;
  planName: string;
  planSlug: string;
  tenant: {
    id: string;
    tradeName: string;
    slug: string;
    isActive: boolean;
    orders: number;
  };
  updatedAt: string;
}

interface ListResponse {
  success: boolean;
  data: SubRow[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

const statusConfig: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  ACTIVE: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  TRIAL: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  TRIALING: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  PAST_DUE: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  CANCELLED: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' },
  SUSPENDED: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  EXPIRED: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
  INCOMPLETE: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
};

export default function SuperAdminSubscriptionsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading subscriptions...</div>}>
      <SubscriptionsContent />
    </Suspense>
  );
}

function SubscriptionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const tenantId = searchParams.get('tenant') || '';
  const search = searchParams.get('search') || '';

  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (tenantId) params.set('tenant', tenantId);
    if (search) params.set('search', search);
    params.set('page', String(page));
    params.set('limit', '20');

    fetch(`/api/superadmin/subscriptions?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status, page, tenantId, search]);

  useEffect(load, [load]);

  const updateQuery = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => (v ? params.set(k, v) : params.delete(k)));
    if (updates.search !== undefined) params.delete('page');
    router.push(`/superadmin/subscriptions?${params.toString()}`);
  };

  const exportCsv = () => {
    if (!data) return;
    const csv = [
      ['Tenant', 'Slug', 'Plan', 'Status', 'Monthly Price', 'Period Ends', 'Cancelled'],
      ...data.data.map((s) => [
        s.tenant.tradeName,
        s.tenant.slug,
        s.planName,
        s.status,
        s.monthlyPrice,
        s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toISOString().split('T')[0] : 'N/A',
        s.cancelledAt ? new Date(s.cancelledAt).toISOString().split('T')[0] : '',
      ]),
    ]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bharatstore-subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statuses = ['ACTIVE', 'TRIAL', 'PAST_DUE', 'CANCELLED', 'SUSPENDED'];

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-amber-500" />
            Subscriptions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {data?.meta.total ?? '—'} total subscriptions across the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={exportCsv}
            disabled={!data?.data?.length}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateQuery({ status: '' })}
          className={`px-3 py-1.5 text-2xs font-bold rounded-lg border transition ${!status ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          All
        </button>
        {statuses.map((s) => {
          const cfg = statusConfig[s];
          return (
            <button
              key={s}
              onClick={() => updateQuery({ status: status === s ? '' : s })}
              className={`px-3 py-1.5 text-2xs font-bold rounded-lg border transition ${status === s ? `${cfg.bg} ${cfg.border} ${cfg.text}` : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              {s.replace('_', ' ')}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateQuery({ search: searchInput.trim() })}
            placeholder="Search by tenant name or slug..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 bg-slate-100 rounded-lg" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-2xs font-bold text-slate-500 uppercase tracking-wider text-left">
                  <th className="px-4 py-3">Tenant</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Price/mo</th>
                  <th className="px-4 py-3 text-right hidden md:table-cell">Period Ends</th>
                  <th className="px-4 py-3 text-right hidden md:table-cell">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.data.map((s) => {
                  const cfg = statusConfig[s.status] || statusConfig.SUSPENDED;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <Link href={`/superadmin/tenants/${s.tenant.id}`} className="block">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white">
                              <Building2 className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 hover:text-amber-600 transition text-sm">{s.tenant.tradeName}</p>
                              <p className="text-2xs text-slate-400 font-mono">{s.tenant.slug}</p>
                            </div>
                            {!s.tenant.isActive && <span className="ml-2 text-2xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">SUSPENDED</span>}
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-slate-800">{s.planName}</p>
                        <p className="text-2xs text-slate-400 font-mono">{s.planSlug}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-2xs font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {s.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800 whitespace-nowrap hidden sm:table-cell">
                        ₹{s.monthlyPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-500 whitespace-nowrap hidden md:table-cell">
                        {s.currentPeriodEnd ? (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {new Date(s.currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-mono text-slate-600 hidden md:table-cell">
                        {s.tenant.orders}
                      </td>
                    </tr>
                  );
                })}
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                      No subscriptions found with current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-2xs text-slate-500">
              Showing {data.meta.total === 0 ? 0 : (data.meta.page - 1) * data.meta.limit + 1}–
              {Math.min(data.meta.page * data.meta.limit, data.meta.total)} of {data.meta.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateQuery({ page: String(page - 1) })}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold text-slate-700 px-2">Page {data.meta.page} / {data.meta.totalPages}</span>
              <button
                onClick={() => updateQuery({ page: String(page + 1) })}
                disabled={page >= data.meta.totalPages}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}