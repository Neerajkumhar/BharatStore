'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';
import { KpiCard } from '@/components/analytics/kpi-card';

function KhataContent() {
  const searchParams = useSearchParams();
  const range = searchParams.get('range') || '30d';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadKhata() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/khata?range=${range}`);
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error('Failed to load Khata analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadKhata();
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

  const { totalOutstanding, debtorCount, totalCreditLimit, creditUtilizationPct, totalCreditSalesPeriod, totalCollectionsPeriod, topDebtors, recentLedgerEntries, periodLabel } = data;

  return (
    <div className="space-y-6">
      {/* Khata Credit KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Outstanding Credit Balance"
          value={totalOutstanding}
          format="currency"
          icon={DollarSign}
          accentColor="rose"
          subtitle={`${debtorCount} buyers with open credit`}
          badge="Khata Ledger"
        />
        <KpiCard
          title="Period Credit Sales Given"
          value={totalCreditSalesPeriod}
          format="currency"
          icon={ArrowUpRight}
          accentColor="amber"
          subtitle={`Goods sold on credit in ${periodLabel}`}
        />
        <KpiCard
          title="Period Cash/UPI Collections"
          value={totalCollectionsPeriod}
          format="currency"
          icon={ArrowDownRight}
          accentColor="emerald"
          subtitle={`Credit debt collected in ${periodLabel}`}
        />
        <KpiCard
          title="Credit Limit Utilization"
          value={creditUtilizationPct}
          format="percent"
          icon={CreditCard}
          accentColor="purple"
          subtitle={`Out of ₹${totalCreditLimit.toLocaleString('en-IN')} total sanctioned credit limit`}
        />
      </div>

      {/* Top Credit Debtors Watchlist */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Top Khata Debtors (Highest Credit Balances)
            </h3>
            <p className="text-xs text-slate-500">Customer credit exposure sorted by current outstanding balance</p>
          </div>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800">
            ₹{totalOutstanding.toLocaleString('en-IN')} Total Outstanding
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-2xs border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 px-3 text-right">Credit Limit</th>
                <th className="py-2.5 px-3 text-right">Outstanding Balance</th>
                <th className="py-2.5 px-3 text-right">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topDebtors.map((debtor: any) => (
                <tr key={debtor.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">{debtor.name}</td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-2xs">{debtor.phone}</td>
                  <td className="py-3 px-3 text-right font-medium text-slate-700">
                    ₹{debtor.creditLimit.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-rose-600">
                    ₹{debtor.balance.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                        debtor.utilPct >= 100
                          ? 'bg-rose-100 text-rose-900'
                          : debtor.utilPct >= 80
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {debtor.utilPct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Khata Transactions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Recent Khata Ledger Transactions ({periodLabel})
          </h3>
          <p className="text-xs text-slate-500">Immutable ledger log of credit given vs debt collected</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-2xs border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Entry Type</th>
                <th className="py-2.5 px-3">Payment Mode</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLedgerEntries.map((entry: any) => {
                const isDebit = entry.type === 'DEBIT_CREDIT_GIVEN';

                return (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-slate-600 font-mono text-2xs">
                      {new Date(entry.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{entry.customerName}</td>
                    <td className="py-3 px-3 font-medium">
                      {isDebit ? (
                        <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-semibold text-2xs">
                          Credit Given (+)
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-2xs">
                          Debt Collected (-)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{entry.paymentMode || '-'}</td>
                    <td className={`py-3 px-3 text-right font-bold ${isDebit ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isDebit ? '+' : '-'}₹{entry.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">
                      ₹{entry.balanceAfter.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsKhataPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-slate-100 rounded-xl animate-pulse" />}>
      <KhataContent />
    </Suspense>
  );
}
