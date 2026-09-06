'use client';

import React from 'react';

interface DailySalePoint {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue?: number;
}

interface SalesTrendChartProps {
  data: DailySalePoint[];
  title?: string;
  subtitle?: string;
}

export function SalesTrendChart({ data, title = 'Sales & Revenue Trend', subtitle }: SalesTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm">
        No sales data available for this range
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="pt-2">
        <div className="h-64 flex items-end gap-2 pb-6 border-b border-slate-200">
          {data.map((point, i) => {
            const heightPct = Math.max((point.revenue / maxRevenue) * 100, 3);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                  <div className="bg-slate-900 text-white text-2xs rounded px-2.5 py-1.5 shadow-xl whitespace-nowrap">
                    <p className="font-bold text-amber-400">{point.date}</p>
                    <p className="text-white font-semibold">Revenue: ₹{point.revenue.toLocaleString('en-IN')}</p>
                    <p className="text-slate-300">Orders: {point.orders}</p>
                  </div>
                  <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                </div>

                {/* Bar */}
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full bg-slate-900 group-hover:bg-amber-500 rounded-t transition-all"
                />
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-2xs text-slate-400 pt-2 px-1">
          <span>{data[0]?.date}</span>
          <span>{data[Math.floor(data.length / 2)]?.date}</span>
          <span>{data[data.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  );
}
