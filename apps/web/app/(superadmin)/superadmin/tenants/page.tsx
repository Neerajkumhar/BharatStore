'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Search, ChevronLeft, ChevronRight, Package, ShoppingCart, Users, BadgeCheck, Download } from 'lucide-react';

interface TenantRow {
  id: string;
  tradeName: string;
  legalName: string;
  slug: string;
  gstin: string | null;
  stateCode: string;
  city: string;
  isActive: boolean;
  createdAt: string;
  owner: { id: string; fullName: string; email: string } | null;
  subscription: { plan: string; planSlug: string; status: string; trialEndsAt: string | null } | null;
  stats: { orders: number; products: number; customers: number };
}

interface ListResponse {
  success: boolean;
  data: TenantRow[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

const statusBadge: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  TRIAL: 'bg-blue-50 text-blue-700 border-blue-200',
  SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-200',
  PAST_DUE: 'bg-amber-50 text-amber-700 border-amber-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
  EXPIRED: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function SuperAdminTenantsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading tenants...</div>}>
      <TenantsContent />
    </Suspense>
  );
}

function TenantsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    params.set('page', String(page));
    params.set('limit', '20');

    fetch(`/api/superadmin/tenants?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, status, page]);

  const updateQuery = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    // Reset to page 1 on filter change
    if (updates.search !== undefined || updates.status !== undefined) params.delete('page');
    router.push(`/superadmin/tenants?${params.toString()}`);
  };

  const exportCsv = () => {
    if (!data) return;
    const rows = data.data;
    const csv = [
      ['Business', 'Legal Name', 'Slug', 'GSTIN', 'City', 'State', 'Owner', 'Owner Email', 'Plan', 'Subscription Status', 'Orders', 'Products', 'Customers', 'Created'],
      ...rows.map((t) => [
        t.tradeName,
        t.legalName,
        t.slug,
        t.gstin ?? '',
        t.city,
        t.stateCode,
        t.owner?.fullName ?? '',
        t.owner?.email ?? '',
        t.subscription?.plan ?? 'Free',
        t.subscription?.status ?? 'NONE',
        t.stats.orders,
        t.stats.products,
        t.stats.customers,
        new Date(t.createdAt).toISOString().split('T')[0],
      ]),
    ]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bharatstore-tenants-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-amber-500" />
            All Businesses
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage every tenant on the BharatStore platform.</p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateQuery({ search: searchInput.trim() })}
            placeholder="Search by business, GSTIN, or slug..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => updateQuery({ status: e.target.value })}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <button
            onClick={() => updateQuery({ search: '', status: '' })}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-2xs font-bold text-slate-500 uppercase tracking-wider text-left">
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3 hidden md:table-cell">Owner</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Orders</th>
                  <th className="px-4 py-3 text-right hidden lg:table-cell">Products</th>
                  <th className="px-4 py-3 text-right hidden lg:table-cell">Customers</th>
                  <th className="px-4 py-3 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.data.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <Link href={`/superadmin/tenants/${t.id}`} className="block">
                        <p className="font-bold text-slate-900 hover:text-amber-600 transition">{t.tradeName}</p>
                        <p className="text-2xs text-slate-500 font-mono">{t.slug}</p>
                        {t.gstin && <p className="text-2xs text-slate-400 font-mono mt-0.5">{t.gstin}</p>}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="font-medium text-slate-700">{t.owner?.fullName ?? '—'}</p>
                      <p className="text-2xs text-slate-400">{t.owner?.email ?? ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                          <BadgeCheck className="h-3 w-3 text-amber-500" />
                          {t.subscription?.plan ?? 'Free'}
                        </span>
                        {t.subscription && t.subscription.status === 'TRIAL' && (
                          <span className="text-2xs text-blue-600 font-medium">Trial</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${t.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        />
                        <span className="text-2xs font-semibold text-slate-500">{t.isActive ? 'Active' : 'Suspended'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <ShoppingCart className="h-3 w-3 text-slate-400" />
                        {t.stats.orders.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <Package className="h-3 w-3 text-slate-400" />
                        {t.stats.products.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <Users className="h-3 w-3 text-slate-400" />
                        {t.stats.customers.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                      No businesses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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
              <span className="text-xs font-semibold text-slate-700 px-2">
                Page {data.meta.page} / {data.meta.totalPages}
              </span>
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