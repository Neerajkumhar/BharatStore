'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingCart,
  Boxes,
  Users,
  Plus,
  FileText,
  ChevronRight,
  Clock,
  Circle,
  CircleCheck,
  CircleDashed,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { BusinessAlerts } from '@/components/analytics/business-alerts';

interface DashKpis {
  todayRevenue: number;
  todayOrderCount: number;
  activeOrders: number;
  lowStockCount: number;
  outOfStockCount: number;
  khataReceivable: number;
  khataDebtors: number;
}

interface DashOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  itemSummary: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

interface DashboardData {
  periodLabel: string;
  generatedAt: string;
  kpis: DashKpis;
  recentOrders: DashOrder[];
  alerts: Array<{
    id: string;
    type: string;
    severity: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    count?: number;
    actionUrl?: string;
  }>;
}

const currency = (v: number) =>
  `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const compactCurrency = (v: number) =>
  `₹${Math.round(Number(v || 0)).toLocaleString('en-IN')}`;

const orderStatusMeta: Record<string, { label: string; badge: 'success' | 'warning' | 'info' | 'error'; Icon: any }> = {
  PENDING: { label: 'Pending', badge: 'warning', Icon: Clock },
  CONFIRMED: { label: 'Confirmed', badge: 'info', Icon: CircleDashed },
  PACKED: { label: 'Packed', badge: 'info', Icon: Boxes },
  DISPATCHED: { label: 'Dispatched', badge: 'info', Icon: Clock },
  DELIVERED: { label: 'Delivered', badge: 'success', Icon: CircleCheck },
  CANCELLED: { label: 'Cancelled', badge: 'error', Icon: AlertTriangle },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Failed to load dashboard');
        setData(json.data);
      } catch (err: any) {
        console.error('Dashboard load error:', err);
        setError(err.message || 'Error loading dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-72 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-6 text-center">
        <p className="font-semibold">{error || 'Failed to load dashboard.'}</p>
      </div>
    );
  }

  const kpis = data.kpis;
  const totalStockAlerts = kpis.lowStockCount + kpis.outOfStockCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Namaste, Rajesh Saree Emporium <span aria-hidden="true">🙏</span>
          </>
        }
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <Circle className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" aria-hidden="true" />
              Varanasi storefront · Live & synced
            </span>
            {data.periodLabel}
          </span>
        }
        actions={
          <Link href="/orders?action=pos">
            <Button variant="accent" size="lg" leftIcon={<Plus className="h-4 w-4 stroke-[2.5]" />}>
              New Walk-in Sale (POS)
            </Button>
          </Link>
        }
      />

      {/* Actionable Alerts */}
      <BusinessAlerts alerts={data.alerts} loading={loading} />

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's Revenue"
          value={compactCurrency(kpis.todayRevenue)}
          icon={TrendingUp}
          iconTone="amber"
          hint={`${kpis.todayOrderCount} order${kpis.todayOrderCount === 1 ? '' : 's'} today`}
        />
        <StatCard
          label="Active Orders"
          value={String(kpis.activeOrders)}
          unit="Orders"
          icon={ShoppingCart}
          iconTone="blue"
          hint="Awaiting fulfillment"
        />
        <StatCard
          label="Inventory Alerts"
          value={String(totalStockAlerts)}
          unit={kpis.lowStockCount > 0 ? 'SKUs low' : 'SKUs out'}
          icon={Boxes}
          iconTone={totalStockAlerts > 0 ? 'rose' : 'emerald'}
          hint={kpis.outOfStockCount > 0 ? `${kpis.outOfStockCount} out of stock` : 'Stock levels healthy'}
        />
        <StatCard
          label="Khata Receivable"
          value={compactCurrency(kpis.khataReceivable)}
          icon={Users}
          iconTone="purple"
          hint={`${kpis.khataDebtors} customers on ledger`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders &amp; Invoices</CardTitle>
              <CardDescription>
                Omnichannel sales from POS and online store · live from ledger
              </CardDescription>
            </div>
            <Link href="/orders">
              <Button variant="outline" size="sm" rightIcon={<ChevronRight className="h-3.5 w-3.5" />}>
                View All Orders
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No orders recorded yet. Create your first walk-in sale from the POS.
              </div>
            ) : (
              <div className="overflow-x-auto" tabIndex={0} aria-label="Recent orders table (scrollable horizontally)">
                <table className="w-full text-left text-xs sm:text-sm">
                  <caption className="sr-only">
                    Recent orders with customer, items, total, status and payment method
                  </caption>
                  <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider text-2xs font-semibold">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Items
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Payment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recentOrders.map((order) => {
                      const meta = orderStatusMeta[order.status] || {
                        label: order.status,
                        badge: 'info' as const,
                        Icon: Clock,
                      };
                      const StatusIcon = meta.Icon;
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                            {order.orderNumber}
                            <div className="text-2xs text-slate-500 font-sans font-normal">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{order.customerName}</div>
                            <div className="text-2xs text-slate-500">{order.phone}</div>
                          </td>
                          <td className="max-w-[200px] truncate px-6 py-4 text-slate-600">{order.itemSummary}</td>
                          <td className="px-6 py-4 font-bold text-slate-900 tabular-nums">
                            {currency(order.total)}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={meta.badge} className="gap-1">
                              <StatusIcon className="h-3 w-3" aria-hidden="true" />
                              {meta.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right text-xs font-medium text-slate-600">
                            {order.paymentMethod || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Operations</CardTitle>
              <CardDescription>Instant creation and ledger tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/products?action=new" className="block">
                <Button variant="secondary" className="h-11 w-full justify-start gap-2.5 text-sm font-semibold">
                  <Plus className="h-4 w-4 text-amber-600" />
                  <span>Add New Product SKU</span>
                </Button>
              </Link>
              <Link href="/invoices?action=create" className="block">
                <Button variant="secondary" className="h-11 w-full justify-start gap-2.5 text-sm font-semibold">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Generate B2B GST Invoice</span>
                </Button>
              </Link>
              <Link href="/customers?action=khata" className="block">
                <Button variant="secondary" className="h-11 w-full justify-start gap-2.5 text-sm font-semibold">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>Log Customer Khata Credit</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-mono text-sm font-bold text-amber-700">
                Business Health
              </CardTitle>
              <CardDescription className="text-xs">
                Live operational summary scoped to this tenant.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <span className="text-slate-600">Active Orders</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
                  <Clock className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                  {kpis.activeOrders} in pipeline
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <span className="text-slate-600">Inventory Health</span>
                <span className="font-semibold text-slate-800">
                  {totalStockAlerts > 0 ? `${totalStockAlerts} alerts` : 'All healthy'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <span className="text-slate-600">Khata Exposure</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-purple-700">
                  <Users className="h-3.5 w-3.5 text-purple-600" aria-hidden="true" />
                  {compactCurrency(kpis.khataReceivable)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}