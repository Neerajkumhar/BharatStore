'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Printer,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  Landmark,
  BadgeIndianRupee,
  Banknote,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { KpiCard } from '@/components/analytics/kpi-card';
import { FeatureGate } from '@/components/entitlements/FeatureGate';
import { FEATURE_FLAGS } from '@bharatstore/shared/constants';

const TYPE_TABS = [
  { value: 'ALL', label: 'All Invoices' },
  { value: 'TAX_INVOICE', label: 'Tax Invoices' },
  { value: 'BILL_OF_SUPPLY', label: 'Bills of Supply' },
  { value: 'CREDIT_NOTE', label: 'Credit Notes' },
];

function formatCurrency(value: any) {
  return `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function invoiceTypeLabel(type: string) {
  switch (type) {
    case 'BILL_OF_SUPPLY':
      return 'BILL OF SUPPLY';
    case 'CREDIT_NOTE':
      return 'CREDIT NOTE';
    default:
      return 'TAX INVOICE';
  }
}

function InvoiceTypeBadge({ type }: { type: string }) {
  const variant =
    type === 'BILL_OF_SUPPLY' ? 'info' : type === 'CREDIT_NOTE' ? 'warning' : 'default';
  return <Badge variant={variant} size="sm">{invoiceTypeLabel(type)}</Badge>;
}

function InvoicesPageContent() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeType, setActiveType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (activeType !== 'ALL') params.set('type', activeType);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/invoices?${params.toString()}`);
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.error('Failed to load invoices', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchInvoices, 250);
    return () => clearTimeout(timer);
  }, [activeType, search, page]);

  const summary = data?.summary;
  const totalTax = (summary?.totalCgst || 0) + (summary?.totalSgst || 0) + (summary?.totalIgst || 0);

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ReceiptText className="h-6 w-6 text-amber-600" />
            <span>Invoices & GST Compliance</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registry of GST Tax Invoices, Bills of Supply & Credit Notes with itemized HSN tax breakup.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => window.print()}
          leftIcon={<Printer className="h-4 w-4 text-slate-600" />}
        >
          Print / Export
        </Button>
      </div>

      {/* Invoice Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Invoices"
          value={summary?.totalInvoices || 0}
          format="number"
          icon={FileText}
          accentColor="amber"
          subtitle="Documents in this period"
        />
        <KpiCard
          title="Invoiced Value"
          value={Number(summary?.totalInvoiceValue || 0)}
          format="currency"
          icon={BadgeIndianRupee}
          accentColor="blue"
          subtitle="Sum of all invoice grand totals"
        />
        <KpiCard
          title="Output Tax"
          value={Number(totalTax || 0)}
          format="currency"
          icon={Landmark}
          accentColor="emerald"
          subtitle="CGST + SGST + IGST collected"
        />
        <KpiCard
          title="Avg. Invoice Size"
          value={
            summary?.totalInvoices > 0
              ? Math.round(summary.totalInvoiceValue / summary.totalInvoices)
              : 0
          }
          format="currency"
          icon={Banknote}
          accentColor="purple"
          subtitle="Value per issued invoice"
        />
      </div>

      {/* Invoice Registry */}
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {TYPE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setActiveType(tab.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    activeType === tab.value
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="w-full lg:w-72">
              <Input
                placeholder="Search invoice #, order #, customer..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                prefixSlot={<Search className="h-4 w-4 text-slate-400" />}
              />
            </div>
          </div>

          {/* Invoice Table */}
          <div className="overflow-x-auto -mx-1 px-1">
            {isLoading && !data ? (
              <div className="space-y-3 py-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (data?.data || []).length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-slate-700">No invoices found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Invoices are auto-generated when orders are confirmed.
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-2xs border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Order #</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3 text-right">Tax Breakup (GST)</th>
                    <th className="py-2.5 px-3 text-right">Grand Total</th>
                    <th className="py-2.5 px-3 text-right">Date</th>
                    <th className="py-2.5 px-3 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.data || []).map((inv: any) => {
                    const order = inv.order;
                    const isInterstate = Number(inv.totalIgst || 0) > 0;
                    const taxBreakup = isInterstate
                      ? `IGST ₹${Number(inv.totalIgst || 0).toLocaleString('en-IN')}`
                      : `CGST ₹${Number(inv.totalCgst || 0).toLocaleString('en-IN')} / SGST ₹${Number(
                          inv.totalSgst || 0
                        ).toLocaleString('en-IN')}`;
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="font-mono text-2xs font-bold text-amber-600 hover:underline"
                          >
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-3">
                          <InvoiceTypeBadge type={inv.invoiceType} />
                        </td>
                        <td className="py-3 px-3 font-mono text-2xs text-slate-600">
                          {order?.orderNumber || '—'}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {order?.customer?.name || 'B2C Cash Buyer'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-2xs text-slate-600">
                          {taxBreakup}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                          {formatCurrency(inv.grandTotal)}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-500 whitespace-nowrap">
                          {new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link href={`/invoices/${inv.id}`}>
                            <Button variant="ghost" size="sm" leftIcon={<Printer className="h-3.5 w-3.5" />}>
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {(data?.pagination?.totalPages || 0) > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500">
                Page {data?.pagination?.page} of {data?.pagination?.totalPages} ·{' '}
                {data?.pagination?.total.toLocaleString('en-IN')} invoices
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

export default function InvoicesPage() {
  return (
    <FeatureGate
      feature={FEATURE_FLAGS.GST_INVOICING}
      title="GST Invoicing"
      description="GST-compliant invoices are available on paid plans. Upgrade to create and download tax invoices."
    >
      <InvoicesPageContent />
    </FeatureGate>
  );
}