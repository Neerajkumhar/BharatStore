'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DollarSign, ShoppingCart, TrendingUp, Tag, Store, Building2, MessageSquare, CreditCard } from 'lucide-react';
import { KpiCard } from '@/components/analytics/kpi-card';
import { SalesTrendChart } from '@/components/analytics/sales-charts';

function SalesContent() {
  const searchParams = useSearchParams();
  const range = searchParams.get('range') || '30d';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSales() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/sales?range=${range}`);
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error('Failed to load sales analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSales();
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

  const { totals, dailySales, channelBreakdown, paymentMethodBreakdown, periodLabel } = data;

  const channelIcons: Record<string, { name: string; icon: any }> = {
    POS_COUNTER: { name: 'Counter POS', icon: Store },
    STOREFRONT: { name: 'Online Storefront', icon: Building2 },
    WHATSAPP: { name: 'WhatsApp Commerce', icon: MessageSquare },
  };

  return (
    <div className="space-y-6">
      {/* Top Sales KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Gross Sales Revenue"
          value={totals.grossRevenue}
          format="currency"
          icon={DollarSign}
          accentColor="amber"
          subtitle={periodLabel}
        />
        <KpiCard
          title="Total Orders"
          value={totals.orderCount}
          format="number"
          icon={ShoppingCart}
          accentColor="blue"
          subtitle={periodLabel}
        />
        <KpiCard
          title="Average Order Value"
          value={totals.avgOrderValue}
          format="currency"
          icon={TrendingUp}
          accentColor="emerald"
          subtitle={periodLabel}
        />
        <KpiCard
          title="Total Items Sold"
          value={totals.itemsSold}
          format="number"
          icon={Tag}
          accentColor="purple"
          subtitle={periodLabel}
        />
      </div>

      {/* Daily Sales & Revenue Trend */}
      <SalesTrendChart data={dailySales} title="Daily Revenue Trend" subtitle={`Breakdown for ${periodLabel}`} />

      {/* Channel & Payment Method Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Channel Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Channel Performance</h3>
            <p className="text-xs text-slate-500">Revenue split across POS, Web Store, and WhatsApp</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-2xs border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Sales Channel</th>
                  <th className="py-2.5 px-3 text-right">Orders</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(channelBreakdown || {}).map(([channel, chData]: [string, any]) => {
                  const info = channelIcons[channel] || { name: channel, icon: Store };
                  const Icon = info.icon;
                  const share = totals.grossRevenue > 0 ? Math.round((chData.revenue / totals.grossRevenue) * 100) : 0;

                  return (
                    <tr key={channel} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span>{info.name}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">{chData.orders}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        ₹{chData.revenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-amber-600">{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Payment Method Split</h3>
            <p className="text-xs text-slate-500">Collected payment modes across all completed orders</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-2xs border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Payment Mode</th>
                  <th className="py-2.5 px-3 text-right">Orders</th>
                  <th className="py-2.5 px-3 text-right">Total Revenue</th>
                  <th className="py-2.5 px-3 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(paymentMethodBreakdown || {}).map(([mode, pData]: [string, any]) => {
                  const share = totals.grossRevenue > 0 ? Math.round((pData.revenue / totals.grossRevenue) * 100) : 0;

                  return (
                    <tr key={mode} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-slate-400" />
                        <span>{mode}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">{pData.orders}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        ₹{pData.revenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600">{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsSalesPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-slate-100 rounded-xl animate-pulse" />}>
      <SalesContent />
    </Suspense>
  );
}
