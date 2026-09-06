'use client';

import React, { useEffect, useState } from 'react';
import { History, Search, Filter, ShieldCheck, Eye, ArrowRight, Layers, FileText } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  actorName: string;
  actorEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  beforeState?: any;
  afterState?: any;
  timestamp: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selected Log Drawer Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
      });

      const res = await fetch(`/api/admin/audit?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
        setTotalPages(json.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch audit log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search]);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="h-5 w-5 text-amber-400" />
            <span className="bg-amber-500 text-slate-950 text-2xs font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Immutable Audit Trail
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">System Audit Log</h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Append-only, immutable activity log tracking all business, inventory, staff, and financial events
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs text-emerald-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>Immutable Ledger</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full max-w-md relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search audit logs by actor email, action, resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-2xs border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Resource ID</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-2xs text-slate-500">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{log.actorName}</div>
                      <div className="text-2xs text-slate-500 font-mono">{log.actorEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-mono font-bold text-2xs border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">{log.resourceType}</td>
                    <td className="py-3.5 px-4 font-mono text-2xs text-slate-500 truncate max-w-[120px]">
                      {log.resourceId}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-xs font-bold hover:bg-slate-200 transition inline-flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs italic">
            No audit log entries recorded matching criteria.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold disabled:opacity-30"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect State Details Drawer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Audit State Inspection</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg font-mono">
                <div>
                  <span className="text-slate-400 uppercase text-2xs block font-bold">Action</span>
                  <span className="font-bold text-slate-900">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-2xs block font-bold">Actor</span>
                  <span className="font-bold text-slate-900">{selectedLog.actorEmail}</span>
                </div>
              </div>

              {selectedLog.beforeState && (
                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-2xs mb-1">State Before Change:</h4>
                  <pre className="p-3 bg-slate-900 text-amber-300 font-mono text-2xs rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedLog.beforeState, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.afterState && (
                <div>
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-2xs mb-1">State After Change:</h4>
                  <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-2xs rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedLog.afterState, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
