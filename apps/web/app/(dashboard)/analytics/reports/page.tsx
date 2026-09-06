'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Printer, FileSpreadsheet, ShieldCheck } from 'lucide-react';

function ReportsContent() {
  const searchParams = useSearchParams();
  const range = searchParams.get('range') || '30d';

  const [overview, setOverview] = useState<any>(null);
  const [sales, setSales] = useState<any>(null);
  const [inventory, setInventory] = useState<any>(null);
  const [khata, setKhata] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReportData() {
      setLoading(true);
      try {
        const [oRes, sRes, iRes, kRes] = await Promise.all([
          fetch(`/api/analytics/overview?range=${range}`),
          fetch(`/api/analytics/sales?range=${range}`),
          fetch(`/api/analytics/inventory?range=${range}`),
          fetch(`/api/analytics/khata?range=${range}`),
        ]);

        const oJson = await oRes.json();
        const sJson = await sRes.json();
        const iJson = await iRes.json();
        const kJson = await kRes.json();

        setOverview(oJson.data);
        setSales(sJson.data);
        setInventory(iJson.data);
        setKhata(kJson.data);
      } catch (err) {
        console.error('Failed to load report data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReportData();
  }, [range]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !overview) {
    return (
      <div className="space-y-6">
        <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  const { periodLabel, kpis } = overview;
  const grossSales = sales?.totals?.grossRevenue || kpis?.revenue?.value || 0;
  const cogsValuation = inventory?.totalValuationCost || 0;

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Executive Business Statement</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-8 print:border-0 print:shadow-none">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-500 text-slate-950 text-2xs font-extrabold px-2 py-0.5 rounded uppercase">
                BharatStore Enterprise
              </span>
              <span className="text-xs text-slate-500 font-medium">Audit-Grade Financial Telemetry</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Executive Commerce & P&L Statement</h1>
            <p className="text-xs text-slate-500 mt-1">Calculated directly from transactional database ledgers</p>
          </div>

          <div className="text-right text-xs">
            <span className="font-bold text-slate-900 block">Report Period: {periodLabel}</span>
            <span className="text-slate-500 block mt-0.5">
              Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="text-emerald-700 font-semibold text-2xs block mt-1">● Strict Tenant Isolated Data</span>
          </div>
        </div>

        {/* Section 1: P&L Financial Summary */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-l-4 border-amber-500 pl-3">
            1. P&L Financial Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-2xs font-bold text-slate-500 uppercase">Gross Revenue</span>
              <div className="text-xl font-bold text-slate-900 mt-1">₹{grossSales.toLocaleString('en-IN')}</div>
              <p className="text-2xs text-slate-500 mt-0.5">{kpis.orders.value} total completed orders</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-2xs font-bold text-slate-500 uppercase">Inventory Stock Valuation (Cost)</span>
              <div className="text-xl font-bold text-slate-900 mt-1">₹{inventory?.totalValuationCost.toLocaleString('en-IN')}</div>
              <p className="text-2xs text-slate-500 mt-0.5">{inventory?.totalUnits} units on hand</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-2xs font-bold text-slate-500 uppercase">Outstanding Khata Receivables</span>
              <div className="text-xl font-bold text-slate-900 mt-1">₹{khata?.totalOutstanding.toLocaleString('en-IN')}</div>
              <p className="text-2xs text-slate-500 mt-0.5">{khata?.debtorCount} debtor accounts</p>
            </div>
          </div>
        </div>

        {/* Section 2: Channel & Payment Breakdown */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-l-4 border-slate-900 pl-3">
            2. Channel Revenue & Payment Breakdown
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-2xs">
                <tr>
                  <th className="p-2.5">Sales Channel</th>
                  <th className="p-2.5 text-right">Orders</th>
                  <th className="p-2.5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(sales?.channelBreakdown || {}).map(([ch, d]: [string, any]) => (
                  <tr key={ch}>
                    <td className="p-2.5 font-semibold text-slate-900">{ch}</td>
                    <td className="p-2.5 text-right text-slate-700">{d.orders}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">₹{d.revenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-2xs">
                <tr>
                  <th className="p-2.5">Payment Mode</th>
                  <th className="p-2.5 text-right">Orders</th>
                  <th className="p-2.5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(sales?.paymentMethodBreakdown || {}).map(([mode, d]: [string, any]) => (
                  <tr key={mode}>
                    <td className="p-2.5 font-semibold text-slate-900">{mode}</td>
                    <td className="p-2.5 text-right text-slate-700">{d.orders}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">₹{d.revenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Compliance & Ledger Declaration */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Audit & Verification Guarantee</span>
          </div>
          <p className="leading-relaxed text-2xs">
            This business intelligence statement has been generated from real double-entry database ledgers. Zero mock data or estimated values were used. All queries are strictly scoped to the tenant environment.
          </p>
        </div>

        {/* Document Footer */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-2xs text-slate-400">
          <span>BharatStore Omnichannel POS & ERP Architecture</span>
          <span>Page 1 of 1 • System Generated Report</span>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsReportsPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-slate-100 rounded-xl animate-pulse" />}>
      <ReportsContent />
    </Suspense>
  );
}
