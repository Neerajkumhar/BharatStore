'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Lock,
  ShieldAlert,
  Key,
  Server,
  Users,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Cpu,
} from 'lucide-react';

interface SecurityData {
  securityHealth: {
    score: number;
    status: string;
    mfaEnforced: boolean;
    bcryptHashing: boolean;
    jwtHS256: boolean;
    tenantIsolation: string;
    ownerProtection: boolean;
  };
  rbacStatus: {
    activeStaffMembers: number;
    ownerProtected: boolean;
  };
  telemetry: {
    totalAuditEntries: number;
    recentSecurityEventsCount: number;
    criticalEventsCount: number;
  };
  securityEvents: Array<{
    id: string;
    eventType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    ipAddress: string;
    timestamp: string;
    details?: any;
  }>;
}

export default function SecurityCenterPage() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSecurity = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/security');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to load security center telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurity();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-72 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  const { securityHealth, rbacStatus, telemetry, securityEvents } = data;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
            <span className="bg-amber-500 text-white text-2xs font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Security Telemetry & Health
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Security Center</h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Real-time audit trail, authentication state, and multi-tenant isolation verification
          </p>
        </div>

        <button
          onClick={fetchSecurity}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition"
        >
          <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Security Health Score Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className={`h-16 w-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-sm ${
              securityHealth.score >= 90
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            {securityHealth.score}%
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">Security Health Index</h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase ${
                  securityHealth.status === 'OPTIMAL'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {securityHealth.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculated from active MFA, password hashing, tenant boundaries, and access logs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center sm:text-right text-xs">
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase block">Active Staff</span>
            <span className="text-base font-bold text-slate-900 block">{rbacStatus.activeStaffMembers} Members</span>
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase block">Audit Records</span>
            <span className="text-base font-bold text-slate-900 block">{telemetry.totalAuditEntries} Logs</span>
          </div>
        </div>
      </div>

      {/* Core Defense Modules */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <Lock className="h-4 w-4" />
            <span className="text-xs font-bold">Password Hashing</span>
          </div>
          <p className="text-xs font-bold text-slate-900">bcryptjs (Salt 10)</p>
          <p className="text-2xs text-slate-500">Cryptographically salted & hashed credentials</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <Key className="h-4 w-4" />
            <span className="text-xs font-bold">JWT Sessions</span>
          </div>
          <p className="text-xs font-bold text-slate-900">HS256 Jose Signatures</p>
          <p className="text-2xs text-slate-500">Signed HTTP-only cookie tokens</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <Server className="h-4 w-4" />
            <span className="text-xs font-bold">Tenant Isolation</span>
          </div>
          <p className="text-xs font-bold text-slate-900">Injected Query Scope</p>
          <p className="text-2xs text-slate-500">Automatic tenantId condition injection</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-bold">Owner Protection</span>
          </div>
          <p className="text-xs font-bold text-slate-900">Privilege Lock Active</p>
          <p className="text-2xs text-slate-500">Immutable owner role protection</p>
        </div>
      </div>

      {/* Real-Time Security Event Monitoring Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-4">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Application Security Event Log
            </h3>
            <p className="text-xs text-slate-500">Monitored authorization attempts, blocked requests, and staff joins</p>
          </div>
          <span className="px-2.5 py-0.5 text-2xs font-bold rounded-full bg-slate-100 text-slate-700">
            {securityEvents.length} Recent Events
          </span>
        </div>

        {securityEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-2xs border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Event Type</th>
                  <th className="py-2.5 px-4">Severity</th>
                  <th className="py-2.5 px-4">IP Address</th>
                  <th className="py-2.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {securityEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-2xs text-slate-500">
                      {new Date(event.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{event.eventType}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-2xs font-bold uppercase ${
                          event.severity === 'CRITICAL' || event.severity === 'HIGH'
                            ? 'bg-rose-100 text-rose-900'
                            : event.severity === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {event.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-2xs text-slate-600">{event.ipAddress}</td>
                    <td className="py-3 px-4 text-2xs text-slate-600 max-w-xs truncate">
                      {JSON.stringify(event.details || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs italic">
            No security alert events recorded. All tenant boundary checks are normal.
          </div>
        )}
      </div>
    </div>
  );
}
