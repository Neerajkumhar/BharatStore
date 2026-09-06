'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: number;
  previousValue?: number;
  changePercent?: number | null;
  periodLabel?: string;
  format?: 'currency' | 'number' | 'percent';
  icon?: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  badge?: string;
  accentColor?: 'amber' | 'blue' | 'emerald' | 'purple' | 'rose';
}

export function KpiCard({
  title,
  value,
  previousValue,
  changePercent,
  periodLabel = 'vs prev. period',
  format = 'number',
  icon: Icon,
  subtitle,
  badge,
  accentColor = 'amber',
}: KpiCardProps) {
  const formatValue = (val: number) => {
    if (format === 'currency') {
      return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    if (format === 'percent') {
      return `${val.toFixed(1)}%`;
    }
    return val.toLocaleString('en-IN');
  };

  const isPositive = changePercent !== undefined && changePercent !== null && changePercent > 0;
  const isNegative = changePercent !== undefined && changePercent !== null && changePercent < 0;
  const isZero = changePercent !== undefined && changePercent !== null && changePercent === 0;

  const accentStyles = {
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    rose: 'bg-rose-50 border-rose-200 text-rose-900',
  };

  const iconAccentStyles = {
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    purple: 'bg-purple-100 text-purple-700',
    rose: 'bg-rose-100 text-rose-700',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          {Icon && (
            <div className={cn('p-2 rounded-lg', iconAccentStyles[accentColor])}>
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{formatValue(value)}</span>
          {badge && (
            <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {badge}
            </span>
          )}
        </div>

        {subtitle && <p className="text-xs text-slate-500 mb-2">{subtitle}</p>}
      </div>

      {changePercent !== undefined && changePercent !== null && (
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-2">
          <div className="flex items-center gap-1">
            {isPositive && (
              <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                +{changePercent}%
              </span>
            )}
            {isNegative && (
              <span className="inline-flex items-center text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
                {changePercent}%
              </span>
            )}
            {isZero && (
              <span className="inline-flex items-center text-slate-600 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                <Minus className="h-3.5 w-3.5 mr-0.5" />
                0%
              </span>
            )}
            <span className="text-slate-400 font-normal">{periodLabel}</span>
          </div>

          {previousValue !== undefined && (
            <span className="text-2xs text-slate-400">
              prev: {formatValue(previousValue)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
