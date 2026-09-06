'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Boxes, DollarSign, AlertTriangle, AlertOctagon } from 'lucide-react';
import { KpiCard } from '@/components/analytics/kpi-card';

function InventoryContent() {
  const searchParams = useSearchParams();
  const range = searchParams.get('range') || '30d';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInventory() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/inventory?range=${range}`);
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error('Failed to load inventory analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInventory();
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

  const { totalUnits, totalValuationCost, totalValuationMrp, lowStockCount, outOfStockCount, movementByEvent, lowStockItems, outOfStockItems, periodLabel } = data;

  const grossProfitMarginValuation = totalValuationMrp - totalValuationCost;

  return (
    <div className="space-y-6">
      {/* Valuation & Stock KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Stock Valuation (At Cost)"
          value={totalValuationCost}
          format="currency"
          icon={DollarSign}
          accentColor="amber"
          subtitle="Purchase cost value of current stock"
        />
        <KpiCard
          title="Stock Valuation (At MRP)"
          value={totalValuationMrp}
          format="currency"
          icon={DollarSign}
          accentColor="emerald"
          subtitle={`Potential retail value (Margin: ₹${grossProfitMarginValuation.toLocaleString('en-IN')})`}
        />
        <KpiCard
          title="Total Stock Units"
          value={totalUnits}
          format="number"
          icon={Boxes}
          accentColor="blue"
          subtitle="Physical units in warehouse/store"
        />
        <KpiCard
          title="Stock Alerts"
          value={lowStockCount + outOfStockCount}
          format="number"
          icon={AlertTriangle}
          accentColor="rose"
          subtitle={`${outOfStockCount} out of stock • ${lowStockCount} low`}
        />
      </div>

      {/* Double-Entry Inventory Movement Ledger Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Inventory Movement Ledger ({periodLabel})
          </h3>
          <p className="text-xs text-slate-500">Aggregated change quantities recorded in immutable audit ledger</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
            <span className="text-2xs font-bold uppercase text-emerald-800 tracking-wider">Inward Received</span>
            <div className="text-xl font-bold text-slate-900 mt-1">+{movementByEvent?.INWARD || 0} Units</div>
            <p className="text-2xs text-slate-500 mt-0.5">PO / Vendor restock inward</p>
          </div>

          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
            <span className="text-2xs font-bold uppercase text-amber-800 tracking-wider">Sale Deductions</span>
            <div className="text-xl font-bold text-slate-900 mt-1">-{movementByEvent?.SALE || 0} Units</div>
            <p className="text-2xs text-slate-500 mt-0.5">Customer order fulfillment</p>
          </div>

          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl">
            <span className="text-2xs font-bold uppercase text-blue-800 tracking-wider">Returns Inward</span>
            <div className="text-xl font-bold text-slate-900 mt-1">+{movementByEvent?.RETURN || 0} Units</div>
            <p className="text-2xs text-slate-500 mt-0.5">Customer return restock</p>
          </div>

          <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl">
            <span className="text-2xs font-bold uppercase text-rose-800 tracking-wider">Damage / Waste</span>
            <div className="text-xl font-bold text-slate-900 mt-1">-{movementByEvent?.DAMAGE || 0} Units</div>
            <p className="text-2xs text-slate-500 mt-0.5">Written-off damaged stock</p>
          </div>

          <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl">
            <span className="text-2xs font-bold uppercase text-purple-800 tracking-wider">Adjustments</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{movementByEvent?.ADJUSTMENT || 0} Units</div>
            <p className="text-2xs text-slate-500 mt-0.5">Stock count reconciliation</p>
          </div>
        </div>
      </div>

      {/* Stock Out & Low Stock Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Out of Stock Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Out of Stock Items</h3>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800">
              {outOfStockItems.length} Critical
            </span>
          </div>

          {outOfStockItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-2xs border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Product / Variant</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-right">Cost Price</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {outOfStockItems.map((item: any) => (
                    <tr key={item.variantId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {item.productName} ({item.variantName})
                      </td>
                      <td className="py-3 px-3 font-mono text-2xs text-slate-500">{item.sku}</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">₹{item.costPrice}</td>
                      <td className="py-3 px-3 text-right font-bold text-rose-600">0 left</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4 text-center">No products are currently out of stock.</p>
          )}
        </div>

        {/* Low Stock Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Low Stock Warnings</h3>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
              {lowStockItems.length} Warnings
            </span>
          </div>

          {lowStockItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-2xs border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Product / Variant</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-right">Current Stock</th>
                    <th className="py-2.5 px-3 text-right">Alert Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockItems.map((item: any) => (
                    <tr key={item.variantId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {item.productName} ({item.variantName})
                      </td>
                      <td className="py-3 px-3 font-mono text-2xs text-slate-500">{item.sku}</td>
                      <td className="py-3 px-3 text-right font-bold text-amber-700">{item.currentStock} units</td>
                      <td className="py-3 px-3 text-right text-slate-500 font-medium">≤ {item.lowStockAlert}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4 text-center">All product stock levels are healthy.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsInventoryPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-slate-100 rounded-xl animate-pulse" />}>
      <InventoryContent />
    </Suspense>
  );
}
