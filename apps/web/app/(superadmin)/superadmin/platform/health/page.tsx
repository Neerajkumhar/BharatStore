'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  HeartPulse,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Server,
  Database,
  Users,
  Building2,
  Package,
  ShoppingCart,
  CreditCard,
  Flag,
  Timer,
  AlertTriangle,
} from 'lucide-react';

interface HealthData {
  status: string;
  timestamp: string;
  uptimeSec: number;
  checks: Array<{ name: string; ok: boolean; latencyMs: number; error?: string }>;
  counts: {
    tenants: number;
    users: number;
    products: number;
    orders: number;
    plans: number;
    features: number;
    trialing: number;
  };
  migrations: Array<{
    name: string;
    finishedAt: Date | null;
    rolledBackAt: Date | null;
    logs: string | null;
  }>;
  env: { NODE_ENV: string; DATABASE_URL_REACHABLE: string };
}

export default function SuperAdminHealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/superadmin/health', { cache: 'no-store' });
      const d = await res.json();
      if (d.success) setData(d.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = () => {
    setRefreshing(true);
    load(true);
  };

  const counts = data?.counts;
  const statCards = [
    { label: 'Tenants', value: counts?.tenants, icon: Building2, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Users', value: counts?.users, icon: Users, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Products', value: counts?.products, icon: Package, color: 'text-amber-600 bg-amber-50' },
    { label: 'Orders', value: counts?.orders, icon: ShoppingCart, color: 'text-violet-600 bg-violet-50' },
    { label: 'Plans', value: counts?.plans, icon: CreditCard, color: 'text-sky-600 bg-sky-50' },
    { label: 'Features', value: counts?.features, icon: Flag, color: 'text-rose-600 bg-rose-50' },
    { label: 'Trialing', value: counts?.trialing, icon: Timer, color: 'text-blue-600 bg-blue-50' },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-amber-500" />
            Platform Health
          </h1>
          <p className="text-xs text-slate-500 mt-1">Live diagnostics and system counters.</p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Checking...' : 'Run Health Check'}
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-5 animate-pulse">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 bg-slate-200 rounded-xl" />)}
        </div>
      ) : data ? (
        <div className="space-y-5">
          {/* Status banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${data.status === 'healthy' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-center gap-3">
              {data.status === 'healthy' ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-rose-600" />
              )}
              <div>
                <p className="text-lg font-black uppercase tracking-wide text-slate-900">{data.status}</p>
                <p className="text-xs text-slate-500">
                  Checked {new Date(data.timestamp).toLocaleTimeString('en-IN')} · uptime {Math.floor(data.uptimeSec / 60)}m {Math.floor(data.uptimeSec % 60)}s
                </p>
              </div>
            </div>
            <span className={`text-2xs font-bold px-2 py-1 rounded-full border ${data.status === 'healthy' ? 'bg-white text-emerald-700 border-emerald-200' : 'bg-white text-rose-700 border-rose-200'}`}>
              {data.checks.filter((c) => c.ok).length}/{data.checks.length} checks passed
            </span>
          </div>

          {/* System checks */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Server className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-900">System Checks</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {data.checks.map((c) => (
                <div key={c.name} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Database className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                    {c.error && <p className="text-2xs text-rose-500 font-mono">{c.error}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-slate-400 font-mono">{c.latencyMs}ms</span>
                    {c.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Source stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {statCards.map((s) => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-3.5">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
                  <s.icon className="h-3.5 w-3.5" />
                </div>
                <p className="text-lg font-black text-slate-900">{s.value?.toLocaleString('en-IN') ?? '—'}</p>
                <p className="text-2xs text-slate-400 font-semibold">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Migrations */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Recent Migrations</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {data.migrations.map((m) => (
                <div key={m.name} className="px-4 py-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-mono font-semibold text-slate-700">{m.name}</p>
                  <div className="flex items-center gap-2">
                    {m.rolledBackAt ? (
                      <span className="text-2xs font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">ROLLED BACK</span>
                    ) : (
                      <span className="text-2xs font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">APPLIED</span>
                    )}
                    <span className="text-2xs text-slate-400">
                      {m.finishedAt ? new Date(m.finishedAt).toLocaleString('en-IN') : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-sm text-slate-400 bg-white rounded-xl border border-slate-200">
          Health data unavailable. Try running a check.
        </div>
      )}
    </div>
  );
}