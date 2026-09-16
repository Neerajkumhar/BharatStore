'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ScrollText,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  severity: string;
  actorId: string;
  actorEmail: string;
  targetType: string;
  targetId: string | null;
  targetName: string | null;
  beforeState: any;
  afterState: any;
  details: any;
  ipAddress: string | null;
  timestamp: string;
}

interface ListResponse {
  success: boolean;
  data: AuditLog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    counts: Array<{ action: string; _count: { _all: number } }>;
  };
}

const severityBadge: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600 border-slate-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
};

const actionLabels: Record<string, string> = {
  'auth.superadmin_login': 'Super admin login',
  'auth.impersonation_start': 'Impersonation started',
  'tenant.create': 'Tenant created',
  'tenant.update': 'Tenant updated',
  'tenant.suspend': 'Tenant suspended',
  'tenant.reactivate': 'Tenant reactivated',
  'tenant.delete': 'Tenant deleted',
  'owner.suspend': 'Owner suspended',
  'plan.create': 'Plan created',
  'plan.update': 'Plan updated',
  'plan.delete': 'Plan deleted',
  'plan.archive': 'Plan archived',
  'subscription.change_plan': 'Plan changed',
  'subscription.extend_trial': 'Trial extended',
  'subscription.cancel': 'Subscription cancelled',
  'subscription.reactivate': 'Subscription reactivated',
  'feature.create': 'Feature created',
  'feature.update': 'Feature updated',
  'feature.archive': 'Feature archived',
  'feature.toggle.isPlatformWide': 'Platform-wide toggled',
  'feature.toggle.isActive': 'Feature toggled',
  'feature.grant': 'Feature granted',
  'feature.revoke': 'Feature revoked',
  'monitor.health_check': 'Health check',
};

const targetTypeIcon: Record<string, React.ElementType> = {
  tenant: User,
  user: User,
  plan: ScrollText,
  feature: ScrollText,
  subscription: ScrollText,
};

export default function SuperAdminAuditPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading audit logs...</div>}>
      <AuditContent />
    </Suspense>
  );
}

function AuditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action') || '';
  const severity = searchParams.get('severity') || '';
  const actor = searchParams.get('actor') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actorInput, setActorInput] = useState(actor);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (action) params.set('action', action);
    if (severity) params.set('severity', severity);
    if (actor) params.set('actor', actor);
    params.set('page', String(page));
    params.set('limit', '25');

    fetch(`/api/superadmin/audit?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [action, severity, actor, page]);

  useEffect(load, [load]);

  const updateQuery = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => (v ? params.set(k, v) : params.delete(k)));
    if (updates.search !== undefined || updates.actor !== undefined) params.delete('page');
    router.push(`/superadmin/platform/audit?${params.toString()}`);
  };

  const sevs = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ScrollText className="h-6 w-6 text-amber-500" />
          Platform Audit Log
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          <ShieldCheck className="h-3 w-3 inline text-emerald-500 mr-0.5" />
          Immutable record of every sensitive action taken by admins on the platform.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <input
              value={actorInput}
              onChange={(e) => setActorInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && updateQuery({ actor: actorInput.trim() })}
              placeholder="Filter by actor email..."
              className="w-full pl-3 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <select
            value={action}
            onChange={(e) => updateQuery({ action: e.target.value })}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All actions</option>
            {data?.meta.counts.map((c) => (
              <option key={c.action} value={c.action}>
                {actionLabels[c.action] ?? c.action} ({c._count._all})
              </option>
            ))}
          </select>
          <select
            value={severity}
            onChange={(e) => updateQuery({ severity: e.target.value })}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {sevs.map((s) => (
              <option key={s} value={s}>{s === '' ? 'All severities' : s}</option>
            ))}
          </select>
        </div>
        {(action || severity || actor) && (
          <button onClick={() => { router.push('/superadmin/platform/audit'); setActorInput(''); }} className="text-2xs font-semibold text-amber-600 hover:text-amber-700">
            Clear filters
          </button>
        )}
      </div>

      {/* Logs */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-slate-100 rounded-lg" />)}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data?.data.map((log) => {
              const Icon = targetTypeIcon[log.targetType] ?? ScrollText;
              const isExpanded = expanded === log.id;
              return (
                <div key={log.id} className="hover:bg-slate-50 transition">
                  <button onClick={() => setExpanded(isExpanded ? null : log.id)} className="w-full text-left px-4 py-3 flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${log.severity === 'CRITICAL' || log.severity === 'HIGH' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 truncate">{actionLabels[log.action] ?? log.action}</p>
                        <span className={`text-2xs font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${severityBadge[log.severity] ?? ''}`}>
                          {log.severity}
                        </span>
                      </div>
                      <p className="text-2xs text-slate-400 mt-0.5 truncate">
                        {log.actorEmail} → {log.targetName ?? log.targetType} · {new Date(log.timestamp).toLocaleString('en-IN')}
                        {log.ipAddress ? ` · ${log.ipAddress}` : ''}
                      </p>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pl-[4.5rem]">
                      <div className="grid sm:grid-cols-2 gap-3">
                        {log.beforeState && (
                          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <p className="text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Before</p>
                            <pre className="text-2xs text-slate-600 font-mono overflow-x-auto whitespace-pre-wrap">{JSON.stringify(log.beforeState, null, 2)}</pre>
                          </div>
                        )}
                        {log.afterState && (
                          <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                            <p className="text-2xs font-bold text-emerald-500 uppercase tracking-wider mb-1.5">After</p>
                            <pre className="text-2xs text-emerald-700 font-mono overflow-x-auto whitespace-pre-wrap">{JSON.stringify(log.afterState, null, 2)}</pre>
                          </div>
                        )}
                        {log.details && (
                          <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 sm:col-span-2">
                            <p className="text-2xs font-bold text-blue-500 uppercase tracking-wider mb-1.5">Details</p>
                            <pre className="text-2xs text-blue-700 font-mono overflow-x-auto whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                          </div>
                        )}
                        <p className="text-2xs text-slate-400 font-mono mt-1">Log ID: {log.id}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {data?.data.length === 0 && (
              <p className="px-4 py-12 text-center text-sm text-slate-400">No audit events matching filters.</p>
            )}
          </div>
        )}

        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-2xs text-slate-500">{data.meta.total} events</p>
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