'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Boxes,
  Users,
  PackageCheck,
  CreditCard,
  Building2,
  Store,
  MessageSquare,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { KpiCard } from '@/components/analytics/kpi-card';
import { BusinessAlerts, BusinessAlertItem } from '@/components/analytics/business-alerts';

interface OverviewData {
  periodLabel: string;
  dateRange: { currentStart: string; currentEnd: string };
  kpis: {
    revenue: { value: number; previousValue: number; changePercent: number | null };
    orders: { value: number; previousValue: number; changePercent: number | null };
    aov: { value: number; previousValue: number; changePercent: number | null };
    customers: { value: number; totalRegistered: number };
    outstandingKhata: { value: number };
    itemsSold: { value: number; previousValue: number; changePercent: number | null };
  };
}

interface SalesData {
  dailySales?: Array<{ date: string; revenue: number; orders: number }>;
  salesTrend?: Array<{ date: string; revenue: number; orders: number }>;
  channelBreakdown?: Record<string, { revenue: number; orders: number }>;
  salesByChannel?: Array<{ channel: string; revenue: number; orders: number }>;
  paymentMethodBreakdown?: Record<string, { revenue: number; orders: number }>;
  salesByPaymentMethod?: Array<{ method: string; revenue: number; orders: number }>;
}

interface ProductData {
  topByRevenue: Array<{ variantId: string; productName: string; variantName: string; revenue: number; unitsSold: number }>;
}

function OverviewContent() {
  const searchParams = useSearchParams();
  const range = searchParams.get('range') || '30d';

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [sales, setSales] = useState<SalesData | null>(null);
  const [products, setProducts] = useState<ProductData | null>(null);
  const [alerts, setAlerts] = useState<BusinessAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, salesRes, productsRes, alertsRes] = await Promise.all([
        fetch(`/api/analytics/overview?range=${range}`),
        fetch(`/api/analytics/sales?range=${range}`),
        fetch(`/api/analytics/products?range=${range}`),
        fetch(`/api/analytics/alerts`),
      ]);

      if (!overviewRes.ok || !salesRes.ok || !productsRes.ok || !alertsRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const overviewJson = await overviewRes.json();
      const salesJson = await salesRes.json();
      const productsJson = await productsRes.json();
      const alertsJson = await alertsRes.json();

      setOverview(overviewJson.data);
      setSales(salesJson.data);
      setProducts(productsJson.data);
      setAlerts(alertsJson.data?.alerts || []);
    } catch (err: any) {
      console.error('Analytics load error:', err);
      setError(err.message || 'Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-6 text-center space-y-3">
        <p className="font-semibold">{error || 'Failed to display analytics overview.'}</p>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  const { kpis, periodLabel } = overview;
  const dailySales = sales?.dailySales || sales?.salesTrend || [];
  const maxRevenue = dailySales.length > 0
    ? Math.max(...dailySales.map((s) => s.revenue || 0), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Top Operational Alerts */}
      <BusinessAlerts alerts={alerts} loading={loading} />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Gross Revenue"
          value={kpis.revenue.value}
          previousValue={kpis.revenue.previousValue}
          changePercent={kpis.revenue.changePercent}
          periodLabel={periodLabel}
          format="currency"
          icon={DollarSign}
          accentColor="amber"
          badge="Ledger Validated"
        />
        <KpiCard
          title="Total Orders"
          value={kpis.orders.value}
          previousValue={kpis.orders.previousValue}
          changePercent={kpis.orders.changePercent}
          periodLabel={periodLabel}
          format="number"
          icon={ShoppingCart}
          accentColor="blue"
        />
        <KpiCard
          title="Average Order Value"
          value={kpis.aov.value}
          previousValue={kpis.aov.previousValue}
          changePercent={kpis.aov.changePercent}
          periodLabel={periodLabel}
          format="currency"
          icon={TrendingUp}
          accentColor="emerald"
        />
        <KpiCard
          title="Total Units Sold"
          value={kpis.itemsSold.value}
          previousValue={kpis.itemsSold.previousValue}
          changePercent={kpis.itemsSold.changePercent}
          periodLabel={periodLabel}
          format="number"
          icon={PackageCheck}
          accentColor="purple"
        />
        <KpiCard
          title="Outstanding Khata"
          value={kpis.outstandingKhata.value}
          format="currency"
          icon={Users}
          accentColor="rose"
          subtitle={`${kpis.customers.value} active buyers`}
        />
      </div>

      {/* Daily Revenue Trend & Sales Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Sales Bar Chart (SVG) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Daily Revenue Trend ({periodLabel})
              </h3>
              <p className="text-xs text-slate-500">Calculated directly from confirmed order entries</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              Max: ₹{maxRevenue.toLocaleString('en-IN')} / day
            </span>
          </div>

          {dailySales && dailySales.length > 0 ? (
            <div className="pt-4">
              <div className="h-56 flex items-end gap-1.5 sm:gap-2 pb-6 border-b border-slate-200">
                {dailySales.map((day, idx) => {
                  const heightPercent = Math.max((day.revenue / maxRevenue) * 100, 4);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                        <div className="bg-slate-900 text-white text-2xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
                          <p className="font-semibold">{day.date}</p>
                          <p className="text-amber-400">₹{day.revenue.toLocaleString('en-IN')}</p>
                          <p className="text-slate-300">{day.orders} orders</p>
                        </div>
                        <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                      </div>

                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-slate-800 hover:bg-amber-500 rounded-t transition-all group-hover:shadow-md"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-2xs text-slate-400 pt-2 px-1">
                <span>{dailySales[0]?.date}</span>
                <span>{dailySales[Math.floor(dailySales.length / 2)]?.date}</span>
                <span>{dailySales[dailySales.length - 1]?.date}</span>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              No daily revenue recorded for this period
            </div>
          )}
        </div>

        {/* Channel & Payment Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
              Sales by Channel
            </h3>
            <p className="text-xs text-slate-500 mb-3">Omnichannel sales source distribution</p>

            <div className="space-y-3">
              {sales?.channelBreakdown &&
                Object.entries(sales.channelBreakdown).map(([channel, data]) => {
                  const channelLabels: Record<string, { name: string; icon: any; color: string }> = {
                    POS_COUNTER: { name: 'Counter POS', icon: Store, color: 'bg-amber-500' },
                    STOREFRONT: { name: 'Online Store', icon: Building2, color: 'bg-blue-500' },
                    WHATSAPP: { name: 'WhatsApp Commerce', icon: MessageSquare, color: 'bg-emerald-500' },
                  };

                  const info = channelLabels[channel] || { name: channel, icon: Store, color: 'bg-slate-500' };
                  const Icon = info.icon;
                  const totalRev = kpis.revenue.value || 1;
                  const pct = Math.round((data.revenue / totalRev) * 100);

                  return (
                    <div key={channel} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-semibold text-slate-800">{info.name}</span>
                        </div>
                        <span className="font-bold text-slate-900">
                          ₹{data.revenue.toLocaleString('en-IN')} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${info.color} transition-all`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
              Payment Methods
            </h3>

            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              {sales?.paymentMethodBreakdown &&
                Object.entries(sales.paymentMethodBreakdown).map(([mode, data]) => (
                  <div key={mode} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-2xs font-bold text-slate-500 uppercase block">{mode}</span>
                    <span className="text-xs font-bold text-slate-900 block mt-0.5">
                      ₹{data.revenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-2xs text-slate-400">{data.orders} orders</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Highlights & Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Product */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">#1 Top Product</span>
            {products?.topByRevenue && products.topByRevenue.length > 0 ? (
              <div>
                <h4 className="text-sm font-bold text-slate-900 truncate max-w-[200px]">
                  {products.topByRevenue[0].productName}
                </h4>
                <p className="text-xs text-slate-500">
                  ₹{products.topByRevenue[0].revenue.toLocaleString('en-IN')} ({products.topByRevenue[0].unitsSold} sold)
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No sales recorded yet</p>
            )}
          </div>
        </div>

        {/* Customer Base Growth */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Active Customer Base</span>
            <h4 className="text-sm font-bold text-slate-900">
              {kpis.customers.value} Buyers Active
            </h4>
            <p className="text-xs text-slate-500">Out of {kpis.customers.totalRegistered} total registered</p>
          </div>
        </div>

        {/* Khata Credit Exposure */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-100 text-rose-800 rounded-xl">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Khata Credit Risk</span>
            <h4 className="text-sm font-bold text-slate-900">
              ₹{kpis.outstandingKhata.value.toLocaleString('en-IN')}
            </h4>
            <p className="text-xs text-slate-500">Total uncollected credit given to buyers</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsOverviewPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-slate-100 rounded-xl animate-pulse" />}>
      <OverviewContent />
    </Suspense>
  );
}
