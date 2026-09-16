'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  DollarSign,
  AlertOctagon,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Hourglass,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { KpiCard } from '@/components/analytics/kpi-card';

const STATUS_TABS = [
  { value: 'ALL', label: 'All Payments' },
  { value: 'SUCCESS', label: 'Collected' },
  { value: 'INITIATED', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
];

const GATEWAYS = ['ALL', 'CASH', 'UPI_DIRECT', 'RAZORPAY', 'CASHFREE', 'MANUAL'];

function formatCurrency(value: any) {
  return `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: any; label: string }> = {
    SUCCESS: { variant: 'success', label: 'COLLECTED' },
    INITIATED: { variant: 'warning', label: 'PENDING' },
    FAILED: { variant: 'error', label: 'FAILED' },
    REFUNDED: { variant: 'info', label: 'REFUNDED' },
  };
  const { variant, label } = config[status] || { variant: 'outline', label: status };
  return <Badge variant={variant} size="sm">{label}</Badge>;
}

function MethodBadge({ gateway }: { gateway: string }) {
  const config: Record<string, { variant: any; label: string }> = {
    CASH: { variant: 'success', label: 'CASH' },
    UPI_DIRECT: { variant: 'info', label: 'UPI' },
    RAZORPAY: { variant: 'warning', label: 'RAZORPAY' },
    CASHFREE: { variant: 'warning', label: 'CASHFREE' },
    MANUAL: { variant: 'outline', label: 'MANUAL' },
  };
  const { variant, label } = config[gateway] || { variant: 'outline', label: gateway };
  return <Badge variant={variant} size="sm">{label}</Badge>;
}

export default function PaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [activeGateway, setActiveGateway] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (activeStatus !== 'ALL') params.set('status', activeStatus);
      if (activeGateway !== 'ALL') params.set('gateway', activeGateway);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/payments?${params.toString()}`);
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.error('Failed to load payments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchPayments, 250);
    return () => clearTimeout(timer);
  }, [activeStatus, activeGateway, search, page]);

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-amber-600" />
            <span>Payments & Settlements</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time ledger of gateway collections, pending settlements, refunds and COD reconciliation.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => window.print()}
          leftIcon={<Wallet className="h-4 w-4 text-slate-600" />}
        >
          Export Ledger
        </Button>
      </div>

      {/* Payment Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Collected"
          value={Number(summary?.collected || 0)}
          format="currency"
          icon={DollarSign}
          accentColor="emerald"
          badge={summary?.collectedCount ? `${summary.collectedCount} txns` : undefined}
          subtitle="Verified successful collections"
        />
        <KpiCard
          title="Pending Settlements"
          value={Number(summary?.pending || 0)}
          format="currency"
          icon={Hourglass}
          accentColor="amber"
          badge={summary?.pendingCount ? `${summary.pendingCount} txns` : undefined}
          subtitle="Initiated but not yet captured"
        />
        <KpiCard
          title="Failed Payments"
          value={Number(summary?.failed || 0)}
          format="currency"
          icon={AlertOctagon}
          accentColor="rose"
          badge={summary?.failedCount ? `${summary.failedCount} txns` : undefined}
          subtitle="Declined or errored transactions"
        />
        <KpiCard
          title="Refunds Processed"
          value={Number(summary?.refunded || 0)}
          format="currency"
          icon={RefreshCw}
          accentColor="purple"
          badge={summary?.refundedCount ? `${summary.refundedCount} txns` : undefined}
          subtitle="Customer refunds issued"
        />
      </div>

      {/* Payment Ledger */}
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setActiveStatus(tab.value);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      activeStatus === tab.value
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <select
                className="h-8 px-2 border border-slate-200 rounded-lg bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={activeGateway}
                onChange={(e) => {
                  setActiveGateway(e.target.value);
                  setPage(1);
                }}
              >
                {GATEWAYS.map((g) => (
                  <option key={g} value={g}>
                    {g === 'ALL' ? 'All Methods' : g}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full lg:w-72">
              <Input
                placeholder="Search order #, customer, phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                prefixSlot={<Search className="h-4 w-4 text-slate-400" />}
              />
            </div>
          </div>

          {/* Payments Table */}
          <div className="overflow-x-auto -mx-1 px-1">
            {isLoading && !data ? (
              <div className="space-y-3 py-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (data?.data || []).length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <CreditCard className="h-10 w-10 text-slate-300 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-slate-700">No payments found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Payment records are created automatically when orders are placed.
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-2xs border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Payment Ref</th>
                    <th className="py-2.5 px-3">Order #</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                    <th className="py-2.5 px-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.data || []).map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-2xs text-slate-600" title={p.id}>
                        {p.id.slice(0, 8)}…{p.id.slice(-4)}
                      </td>
                      <td className="py-3 px-3">
                        <Link
                          href={`/orders/${p.orderId}`}
                          className="font-mono text-2xs font-bold text-amber-600 hover:underline"
                        >
                          {p.order?.orderNumber || '—'}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {p.order?.customer?.name || 'B2C Cash Buyer'}
                      </td>
                      <td className="py-3 px-3">
                        <MethodBadge gateway={p.gateway} />
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {(data?.pagination?.totalPages || 0) > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500">
                Page {data?.pagination?.page} of {data?.pagination?.totalPages} ·{' '}
                {data?.pagination?.total.toLocaleString('en-IN')} payments
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= (data?.pagination?.totalPages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                  rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}