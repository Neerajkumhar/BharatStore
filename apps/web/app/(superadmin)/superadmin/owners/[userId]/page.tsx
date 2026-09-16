'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Crown,
  Building2,
  IndianRupee,
  ShieldAlert,
  Ban,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  Activity,
} from 'lucide-react';

interface OwnerDetail {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  isSuperAdmin: boolean;
  createdAt: string;
  grossRevenue: number;
  memberships: Array<{
    id: string;
    status: string;
    role: string;
    tenant: {
      id: string;
      tradeName: string;
      slug: string;
      isActive: boolean;
      gstin: string | null;
      subscription: { planName: string; status: string } | null;
      stats: { orders: number; products: number; customers: number };
    };
  }>;
  sessions: Array<{ id: string; userAgent: string | null; ipAddress: string | null; createdAt: string; expiresAt: string }>;
  recentActivity: Array<{ id: string; eventType: string; severity: string; timestamp: string; details: any }>;
}

const severityBadge: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600 border-slate-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
};

export default function SuperAdminOwnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = typeof params.userId === 'string' ? params.userId : '';
  const [owner, setOwner] = useState<OwnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/superadmin/owners/${userId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOwner(d.data);
        else setMessage({ type: 'error', text: d.error || 'Failed to load owner' });
      })
      .catch(() => setMessage({ type: 'error', text: 'Network error' }))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(load, [load]);

  const suspendAll = async () => {
    setActing('suspend');
    setMessage(null);
    try {
      const res = await fetch(`/api/superadmin/owners/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessage({ type: 'success', text: 'Owner suspended across all businesses.' });
      load();
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
          <div className="h-48 bg-slate-200 rounded-xl" />
          <div className="h-64 bg-slate-200 rounded-xl" />
          <div className="h-64 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="p-6 sm:p-8">
        <p className="text-sm text-slate-500">Owner not found.</p>
        <Link href="/superadmin/owners" className="text-xs text-amber-600 font-semibold mt-2 inline-block">← Back to owners</Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-lg">
            {owner.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{owner.fullName}</h1>
              <Crown className="h-5 w-5 text-amber-500" />
              {owner.isSuperAdmin && (
                <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">Super Admin</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {owner.email}</span>
              <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {owner.phone}</span>
            </div>
            <p className="text-2xs text-slate-400 mt-0.5">
              Registered {new Date(owner.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <button
          onClick={suspendAll}
          disabled={acting === 'suspend'}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg disabled:opacity-50"
        >
          <Ban className="h-3.5 w-3.5" />
          {acting === 'suspend' ? 'Suspending...' : 'Suspend All Access'}
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {/* Total stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center"><Building2 className="h-3.5 w-3.5 text-indigo-600" /></div>
            <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">Businesses</p>
          </div>
          <p className="text-lg font-black text-slate-900">{owner.memberships.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-lg bg-green-100 flex items-center justify-center"><IndianRupee className="h-3.5 w-3.5 text-green-600" /></div>
            <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">Gross Revenue</p>
          </div>
          <p className="text-lg font-black text-slate-900">₹{owner.grossRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-lg bg-rose-100 flex items-center justify-center"><ShieldAlert className="h-3.5 w-3.5 text-rose-600" /></div>
            <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">Active Sessions</p>
          </div>
          <p className="text-lg font-black text-slate-900">{owner.sessions.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Businesses */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Businesses Owned</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {owner.memberships.map((m) => (
              <Link key={m.id} href={`/superadmin/tenants/${m.tenant.id}`} className="block p-4 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{m.tenant.tradeName}</p>
                  <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${m.tenant.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                    {m.tenant.isActive ? 'ACTIVE' : 'SUSPENDED'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-2xs text-slate-500">
                  <span>{m.role}</span>
                  <span>{m.tenant.subscription?.planName ?? 'Free'}</span>
                  <span>{m.tenant.stats.orders} orders</span>
                  <span>{m.tenant.stats.products} products</span>
                </div>
              </Link>
            ))}
            {owner.memberships.length === 0 && (
              <p className="p-4 text-xs text-slate-400 text-center">No business memberships.</p>
            )}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-400" /> Recent Sessions
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {owner.sessions.slice(0, 8).map((s) => (
              <div key={s.id} className="p-4">
                <p className="text-xs font-semibold text-slate-800">{s.userAgent || 'Unknown device'}</p>
                <p className="text-2xs text-slate-400 mt-0.5">
                  {s.ipAddress || 'IP unknown'} · {new Date(s.createdAt).toLocaleString('en-IN')}
                  {' · expires '} {new Date(s.expiresAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            ))}
            {owner.sessions.length === 0 && (
              <p className="p-4 text-xs text-slate-400 text-center">No active sessions.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Security Activity */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-slate-400" /> Recent Security Activity
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-2xs font-bold text-slate-500 uppercase tracking-wider text-left">
                <th className="px-4 py-2.5">Event</th>
                <th className="px-4 py-2.5 text-center">Severity</th>
                <th className="px-4 py-2.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {owner.recentActivity.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <p className="font-semibold text-slate-800 font-mono text-[11px]">{e.eventType}</p>
                    {e.details?.path && <p className="text-2xs text-slate-400">{e.details.path}</p>}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${severityBadge[e.severity] ?? ''}`}>
                      {e.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-500 whitespace-nowrap">
                    {new Date(e.timestamp).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              {owner.recentActivity.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">No security events.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <button onClick={() => router.push('/superadmin/owners')} className="text-xs font-semibold text-slate-500 hover:text-slate-700 inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Back to all owners
        </button>
      </div>
    </div>
  );
}