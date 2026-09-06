'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Users, Award, Repeat, UserCheck } from 'lucide-react';
import { KpiCard } from '@/components/analytics/kpi-card';

function CustomersContent() {
  const searchParams = useSearchParams();
  const range = searchParams.get('range') || '30d';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/customers?range=${range}`);
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error('Failed to load customer analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
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

  const { totalCustomers, newCustomers, returningCustomers, repeatPurchaseRate, avgLtv, ltvDistribution, topSpenders, segments, periodLabel } = data;

  return (
    <div className="space-y-6">
      {/* Customer KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Registered Buyers"
          value={totalCustomers}
          format="number"
          icon={Users}
          accentColor="amber"
          subtitle={`Across all time`}
        />
        <KpiCard
          title="Repeat Purchase Rate"
          value={repeatPurchaseRate}
          format="percent"
          icon={Repeat}
          accentColor="emerald"
          subtitle={`${returningCustomers} returning buyers`}
        />
        <KpiCard
          title="Average Customer LTV"
          value={avgLtv}
          format="currency"
          icon={Award}
          accentColor="purple"
          subtitle="Lifetime Value per buyer"
        />
        <KpiCard
          title="New Buyers Acquired"
          value={newCustomers}
          format="number"
          icon={UserCheck}
          accentColor="blue"
          subtitle={`First purchase during ${periodLabel}`}
        />
      </div>

      {/* Dynamic Customer Segmentation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Dynamic Customer Segments</h3>
          <p className="text-xs text-slate-500">RFM-inspired classification based on ordering frequency and spending</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-1">
            <span className="text-2xs font-bold uppercase text-amber-800 tracking-wider">Champions</span>
            <div className="text-xl font-bold text-slate-900">{segments?.champions?.length || 0} Buyers</div>
            <p className="text-xs text-slate-600">Highest order frequency & highest spenders</p>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl space-y-1">
            <span className="text-2xs font-bold uppercase text-blue-800 tracking-wider">Loyal Customers</span>
            <div className="text-xl font-bold text-slate-900">{segments?.loyal?.length || 0} Buyers</div>
            <p className="text-xs text-slate-600">Consistent repeat buyers</p>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl space-y-1">
            <span className="text-2xs font-bold uppercase text-emerald-800 tracking-wider">New Buyers</span>
            <div className="text-xl font-bold text-slate-900">{segments?.newBuyers?.length || 0} Buyers</div>
            <p className="text-xs text-slate-600">Recently made their first order</p>
          </div>

          <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-xl space-y-1">
            <span className="text-2xs font-bold uppercase text-rose-800 tracking-wider">At Risk</span>
            <div className="text-xl font-bold text-slate-900">{segments?.atRisk?.length || 0} Buyers</div>
            <p className="text-xs text-slate-600">Haven't ordered in recent active window</p>
          </div>
        </div>
      </div>

      {/* Top Customer Spenders & LTV Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Spenders Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top Spenders (Highest LTV)</h3>
            <p className="text-xs text-slate-500">Valuable customer accounts sorted by total lifetime spend</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-2xs border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3 text-right">Orders</th>
                  <th className="py-2.5 px-3 text-right">Lifetime Spend</th>
                  <th className="py-2.5 px-3 text-right">Khata Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topSpenders.slice(0, 10).map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-2xs">{c.phone}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">{c.orderCount}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      ₹{c.totalSpend.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-600">
                      {c.currentBalance > 0 ? `₹${c.currentBalance.toLocaleString('en-IN')}` : '₹0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* LTV Distribution Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">LTV Tier Distribution</h3>
            <p className="text-xs text-slate-500">Customer spend distribution across brackets</p>
          </div>

          <div className="space-y-3 pt-2">
            {ltvDistribution.map((tier: any) => {
              const maxCount = Math.max(...ltvDistribution.map((t: any) => t.count), 1);
              const pct = Math.round((tier.count / maxCount) * 100);

              return (
                <div key={tier.range} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{tier.range}</span>
                    <span className="font-bold text-slate-900">{tier.count} Buyers</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsCustomersPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-slate-100 rounded-xl animate-pulse" />}>
      <CustomersContent />
    </Suspense>
  );
}
