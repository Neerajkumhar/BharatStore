'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, CheckCircle2, AlertOctagon, RefreshCw, DollarSign, Wallet } from 'lucide-react';
import { KpiCard } from '@/components/analytics/kpi-card';

function PaymentsContent() {
  const searchParams = useSearchParams();
  const range = searchParams.get('range') || '30d';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/payments?range=${range}`);
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error('Failed to load payment analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, [range]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-72 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  const { totalCollectedRevenue, completedCount, failedCount, refundedCount, methodBreakdown, statusBreakdown, recentPayments, periodLabel } = data;

  return (
    <div className="space-y-6">
      {/* Payment KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Collected Revenue"
          value={totalCollectedRevenue}
          format="currency"
          icon={DollarSign}
          accentColor="amber"
          subtitle={`Verified completed payments (${periodLabel})`}
        />
        <KpiCard
          title="Successful Transactions"
          value={completedCount}
          format="number"
          icon={CheckCircle2}
          accentColor="emerald"
          subtitle="Completed payment records"
        />
        <KpiCard
          title="Failed Payments"
          value={failedCount}
          format="number"
          icon={AlertOctagon}
          accentColor="rose"
          subtitle="Failed or declined transactions"
        />
        <KpiCard
          title="Refunded Payments"
          value={refundedCount}
          format="number"
          icon={RefreshCw}
          accentColor="purple"
          subtitle="Customer refunds processed"
        />
      </div>

      {/* Payment Gateway & Mode Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Payment Method Volume</h3>
            <p className="text-xs text-slate-500">Collected funds split across Cash, UPI, Khata, and Cards</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-2xs border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Transactions</th>
                  <th className="py-2.5 px-3 text-right">Collected Revenue</th>
                  <th className="py-2.5 px-3 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(methodBreakdown || {}).map(([method, mData]: [string, any]) => {
                  const share = totalCollectedRevenue > 0 ? Math.round((mData.revenue / totalCollectedRevenue) * 100) : 0;

                  return (
                    <tr key={method} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-slate-400" />
                        <span>{method}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">{mData.count}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        ₹{mData.revenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-amber-600">{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Payment Status Health</h3>
            <p className="text-xs text-slate-500">Distribution of payment statuses</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-2xs border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Count</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(statusBreakdown || {}).map(([status, sData]: [string, any]) => (
                  <tr key={status} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <span
                        className={`px-2 py-0.5 rounded text-2xs font-bold ${
                          status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">{sData.count}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      ₹{sData.revenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Payments Log */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Recent Payment Ledger ({periodLabel})
          </h3>
          <p className="text-xs text-slate-500">Immutable payment records linked to orders</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-2xs border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Payment #</th>
                <th className="py-2.5 px-3">Order #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPayments.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono text-2xs text-slate-600">{p.paymentNumber}</td>
                  <td className="py-3 px-3 font-mono text-2xs text-amber-600 font-semibold">{p.orderNumber}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{p.customerName}</td>
                  <td className="py-3 px-3 font-medium text-slate-700">{p.method}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-2xs font-bold ${
                        p.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPaymentsPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-slate-100 rounded-xl animate-pulse" />}>
      <PaymentsContent />
    </Suspense>
  );
}
