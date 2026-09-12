'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  Package,
  Users,
  Boxes,
  CreditCard,
  FileSpreadsheet,
  Calendar,
  Download,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const analyticsTabs = [
  { id: 'overview', label: 'Overview', href: '/analytics', icon: BarChart3 },
  { id: 'sales', label: 'Sales & Revenue', href: '/analytics/sales', icon: TrendingUp },
  { id: 'products', label: 'Products & Categories', href: '/analytics/products', icon: Package },
  { id: 'customers', label: 'Customer Intelligence', href: '/analytics/customers', icon: Users },
  { id: 'inventory', label: 'Inventory Valuation', href: '/analytics/inventory', icon: Boxes },
  { id: 'khata', label: 'Khata Credit', href: '/analytics/khata', icon: DollarSign },
  { id: 'payments', label: 'Payments', href: '/analytics/payments', icon: CreditCard },
  { id: 'reports', label: 'Business Reports', href: '/analytics/reports', icon: FileSpreadsheet },
];

const dateRanges = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: 'this_year', label: 'This Year' },
];

export function AnalyticsHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRange = searchParams.get('range') || '30d';

  const handleRangeChange = (rangeId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', rangeId);
    // remove custom dates if predefined range picked
    params.delete('startDate');
    params.delete('endDate');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Header Title & Date Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Vedic BI Engine
            </span>
            <span className="text-slate-400 text-xs font-medium">● Real-time Commerce Telemetry</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Business Analytics & Intelligence</h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Single source of truth calculated directly from transactional ledgers
          </p>
        </div>

        {/* Date Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
          <div className="flex items-center gap-1 px-2 text-slate-400 text-xs font-semibold">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span>Period:</span>
          </div>
          {dateRanges.map((r) => {
            const isSelected = currentRange === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleRangeChange(r.id)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  isSelected
                    ? 'bg-amber-500 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                )}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2 flex items-center overflow-x-auto gap-1" tabIndex={0} aria-label="Analytics sections (scrollable horizontally)">
        {analyticsTabs.map((tab) => {
          const isActive =
            tab.href === '/analytics'
              ? pathname === '/analytics'
              : pathname === tab.href || pathname.startsWith(tab.href + '/');

          const Icon = tab.icon;

          // Preserve query parameters when clicking tab links
          const rangeParam = currentRange ? `?range=${currentRange}` : '';

          return (
            <Link
              key={tab.id}
              href={`${tab.href}${rangeParam}`}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all shrink-0',
                isActive
                  ? 'border-amber-500 text-slate-900 font-semibold bg-amber-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive ? 'text-amber-600' : 'text-slate-400')} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
