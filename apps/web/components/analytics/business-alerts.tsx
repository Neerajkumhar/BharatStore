'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, AlertOctagon, Info, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BusinessAlertItem {
  id: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  count?: number;
  actionUrl?: string;
}

interface BusinessAlertsProps {
  alerts: BusinessAlertItem[];
  loading?: boolean;
}

export function BusinessAlerts({ alerts, loading }: BusinessAlertsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs animate-pulse">
        <div className="h-4 w-40 bg-slate-200 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-slate-100 rounded-lg" />
          <div className="h-16 bg-slate-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-5 flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
          <Info className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-emerald-900">All Systems Normal</h4>
          <p className="text-xs text-emerald-700">No stock shortages, high credit risks, or delayed orders detected.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Actionable Alerts</h3>
          <span className="px-2 py-0.5 text-2xs font-bold rounded-full bg-rose-100 text-rose-800">
            {alerts.length} Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isWarning = alert.severity === 'warning';

          return (
            <div
              key={alert.id}
              className={cn(
                'p-4 rounded-xl border flex items-start justify-between gap-3 transition-all',
                isCritical
                  ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                  : isWarning
                  ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                  : 'bg-blue-50/60 border-blue-200 text-blue-950'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'p-2 rounded-lg shrink-0 mt-0.5',
                    isCritical
                      ? 'bg-rose-100 text-rose-700'
                      : isWarning
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  )}
                >
                  {isCritical ? (
                    <AlertOctagon className="h-4 w-4" />
                  ) : isWarning ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold">{alert.title}</h4>
                    <span
                      className={cn(
                        'text-2xs font-semibold px-2 py-0.5 rounded-full uppercase',
                        isCritical
                          ? 'bg-rose-200 text-rose-900'
                          : isWarning
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-blue-200 text-blue-900'
                      )}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{alert.message}</p>
                </div>
              </div>

              {alert.actionUrl && (
                <Link
                  href={alert.actionUrl}
                  className={cn(
                    'shrink-0 p-2 rounded-lg hover:bg-white/80 transition-colors flex items-center gap-1 text-xs font-semibold',
                    isCritical
                      ? 'text-rose-800'
                      : isWarning
                      ? 'text-amber-800'
                      : 'text-blue-800'
                  )}
                  title="Resolve Alert"
                >
                  <span>Resolve</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
