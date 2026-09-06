'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, TrendingUp, AlertTriangle, Layers, Award } from 'lucide-react';
import { KpiCard } from '@/components/analytics/kpi-card';

function ProductsContent() {
  const searchParams = useSearchParams();
  const range = searchParams.get('range') || '30d';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/products?range=${range}`);
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error('Failed to load product analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [range]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-72 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  const { topByRevenue, topByUnits, lowPerformers, categoryBreakdown, periodLabel } = data;

  return (
    <div className="space-y-6">
      {/* Product Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Top Product Revenue"
          value={topByRevenue[0]?.revenue || 0}
          format="currency"
          icon={Award}
          accentColor="amber"
          subtitle={topByRevenue[0]?.productName || 'N/A'}
          badge="#1 Revenue"
        />
        <KpiCard
          title="Top Volume Leader"
          value={topByUnits[0]?.unitsSold || 0}
          format="number"
          icon={Package}
          accentColor="emerald"
          subtitle={topByUnits[0]?.productName || 'N/A'}
          badge="#1 Units Sold"
        />
        <KpiCard
          title="Low Performing Variants"
          value={lowPerformers.length}
          format="number"
          icon={AlertTriangle}
          accentColor="rose"
          subtitle="Zero or low sales items"
          badge="Clearance Candidate"
        />
      </div>

      {/* Top Products by Revenue & Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top by Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top Products by Revenue</h3>
            <p className="text-xs text-slate-500">Highest gross revenue items during {periodLabel}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-2xs border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Product / Variant</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-right">Units</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topByRevenue.slice(0, 10).map((item: any, idx: number) => (
                  <tr key={item.variantId || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      <div className="text-2xs text-slate-500">{item.variantName} • {item.categoryName}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-2xs">{item.sku}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">{item.unitsSold}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      ₹{item.revenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Category Revenue Distribution</h3>
            <p className="text-xs text-slate-500">Sales aggregated by product category</p>
          </div>

          <div className="space-y-4 pt-2">
            {categoryBreakdown.map((cat: any) => {
              const maxCatRev = Math.max(...categoryBreakdown.map((c: any) => c.revenue), 1);
              const pct = Math.round((cat.revenue / maxCatRev) * 100);

              return (
                <div key={cat.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold text-slate-900">{cat.categoryName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">₹{cat.revenue.toLocaleString('en-IN')}</span>
                      <span className="text-2xs text-slate-500 ml-2">({cat.unitsSold} units)</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Low Performing Products List */}
      {lowPerformers && lowPerformers.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-rose-900">
                Low Performance & Dead Stock Watchlist
              </h3>
              <p className="text-xs text-slate-500">Products with zero or minimal sales during selected timeframe</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800">
              {lowPerformers.length} Items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowPerformers.slice(0, 9).map((item: any, idx: number) => (
              <div key={item.variantId || idx} className="p-3 bg-rose-50/40 border border-rose-100 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 truncate max-w-[180px]">{item.productName}</h4>
                  <p className="text-2xs text-slate-500">{item.variantName} (SKU: {item.sku})</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800">{item.currentStock} in stock</span>
                  <span className="block text-2xs text-rose-600 font-semibold">{item.unitsSold} sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsProductsPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-slate-100 rounded-xl animate-pulse" />}>
      <ProductsContent />
    </Suspense>
  );
}
