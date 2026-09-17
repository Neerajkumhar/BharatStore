'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Search, ChevronLeft, ChevronRight, Building2, Download } from 'lucide-react';

interface OwnerRow {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
  ownedTenants: Array<{ id: string; tradeName: string; slug: string; isActive: boolean; orders: number; role: string }>;
  allTenants: Array<{ id: string; tradeName: string; slug: string; role: string; status: string }>;
  grossRevenue: number;
}

interface ListResponse {
  success: boolean;
  data: OwnerRow[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export default function SuperAdminOwnersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading owners...</div>}>
      <OwnersContent />
    </Suspense>
  );
}

function OwnersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('page', String(page));
    params.set('limit', '20');
    params.set('role', 'owner');

    fetch(`/api/superadmin/owners?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, page]);

  const updateQuery = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => (v ? params.set(k, v) : params.delete(k)));
    if (updates.search !== undefined) params.delete('page');
    router.push(`/superadmin/owners?${params.toString()}`);
  };

  const exportCsv = () => {
    if (!data) return;
    const csv = [
      ['Name', 'Email', 'Phone', 'Businesses', 'Gross Revenue (INR)', 'Registered'],
      ...data.data.map((o) => [
        o.fullName,
        o.email,
        o.phone,
        o.ownedTenants.map((t) => t.tradeName).join(' | '),
        o.grossRevenue,
        new Date(o.createdAt).toISOString().split('T')[0],
      ]),
    ]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bharatstore-owners-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-amber-500" />
            Business Owners
          </h1>
          <p className="text-xs text-slate-500 mt-1">Every business owner account on the platform.</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!data?.data?.length}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateQuery({ search: searchInput.trim() })}
            placeholder="Search by name, email, or phone..."
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
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Businesses</th>
                  <th className="px-4 py-3 text-right">Gross Revenue</th>
                  <th className="px-4 py-3 text-right hidden md:table-cell">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.data.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <Link href={`/superadmin/owners/${o.id}`} className="block">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                            {o.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 hover:text-amber-600 transition truncate">{o.fullName}</p>
                            <p className="text-2xs text-slate-400 truncate">{o.email}</p>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex flex-col gap-1">
                        {o.ownedTenants.slice(0, 2).map((t) => (
                          <Link key={t.id} href={`/superadmin/tenants/${t.id}`} className="flex items-center gap-1.5 text-2xs text-slate-600 hover:text-amber-600 transition">
                            <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{t.tradeName}</span>
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${t.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          </Link>
                        ))}
                        {o.ownedTenants.length > 2 && (
                          <span className="text-2xs text-slate-400">+{o.ownedTenants.length - 2} more</span>
                        )}
                        {o.ownedTenants.length === 0 && <span className="text-2xs text-slate-400">No owned businesses</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">
                      ₹{o.grossRevenue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500 whitespace-nowrap hidden md:table-cell">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-400">
                      No owners found.
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