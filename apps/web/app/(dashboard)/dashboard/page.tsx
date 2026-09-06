import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingCart,
  Boxes,
  Users,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  AlertTriangle,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const sampleOrders = [
  {
    id: 'ORD-2026-8901',
    customer: 'Ananya Sharma',
    phone: '+91 98765 43210',
    items: 'Kanjeevaram Silk Saree (Red/Gold) x 1',
    total: '₹18,500',
    status: 'COMPLETED',
    paymentMethod: 'UPI (PhonePe)',
    time: '12 mins ago',
  },
  {
    id: 'ORD-2026-8900',
    customer: 'Vikram Malhotra',
    phone: '+91 91234 56789',
    items: 'Banarasi Brocade Dupatta x 2',
    total: '₹6,400',
    status: 'PROCESSING',
    paymentMethod: 'Khata Credit',
    time: '45 mins ago',
  },
  {
    id: 'ORD-2026-8899',
    customer: 'Pooja Verma',
    phone: '+91 99887 76655',
    items: 'Chanderi Zari Suit Set (Mint) x 1',
    total: '₹4,200',
    status: 'PENDING_PAYMENT',
    paymentMethod: 'Cash on Delivery',
    time: '2 hours ago',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-xl shadow-sm border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-400 font-mono">
              Varanasi Storefront ● Terminal #01
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-2xs px-2 py-0.5 rounded font-mono font-medium">
              Live & Synced
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Namaste, Rajesh Saree Emporium 👋
          </h1>
          <p className="text-slate-300 text-sm">
            Here is your real-time commerce & inventory overview for today.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/orders?action=pos">
            <Button variant="accent" size="lg" leftIcon={<Plus className="h-4 w-4 stroke-[2.5]" />}>
              New Walk-in Sale (POS)
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: GMV Today */}
        <Card className="hover:border-slate-300 transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Sales (GMV)
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular text-slate-900 tracking-tight">
              ₹42,850<span className="text-xs font-normal text-slate-400">.00</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+18.4% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Orders Count */}
        <Card className="hover:border-slate-300 transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Orders
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular text-slate-900 tracking-tight">
              14 <span className="text-xs font-normal text-slate-400">Orders</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              <span>3 awaiting dispatch</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Low Stock Alerts */}
        <Card className="hover:border-slate-300 transition border-amber-200 bg-amber-50/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Inventory Alerts
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Boxes className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular text-amber-950 tracking-tight">
              2 <span className="text-xs font-normal text-amber-700">SKUs Low</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>Restock needed within 3 days</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Khata Balance */}
        <Card className="hover:border-slate-300 transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Khata Receivable
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-tabular text-slate-900 tracking-tight">
              ₹12,400<span className="text-xs font-normal text-slate-400">.00</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
              <span>8 customers on ledger</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid: Recent Orders & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Orders Table (Span 2) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders & Invoices</CardTitle>
              <CardDescription>Omnichannel sales from POS and Online Store</CardDescription>
            </div>
            <Link href="/orders">
              <Button variant="outline" size="sm" rightIcon={<ChevronRight className="h-3.5 w-3.5" />}>
                View All Orders
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider text-2xs font-semibold">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Items</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sampleOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                        {order.id}
                        <div className="text-2xs text-slate-400 font-sans font-normal">{order.time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{order.customer}</div>
                        <div className="text-2xs text-slate-400">{order.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">
                        {order.items}
                      </td>
                      <td className="px-6 py-4 font-bold font-tabular text-slate-900">
                        {order.total}
                      </td>
                      <td className="px-6 py-4">
                        {order.status === 'COMPLETED' && <Badge variant="success">Paid & Delivered</Badge>}
                        {order.status === 'PROCESSING' && <Badge variant="warning">Processing</Badge>}
                        {order.status === 'PENDING_PAYMENT' && <Badge variant="info">Pending</Badge>}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600 text-xs">
                        {order.paymentMethod}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Fast Actions & GST Compliance */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Operations</CardTitle>
              <CardDescription>Instant creation and ledger tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/products?action=new" className="block">
                <Button variant="secondary" className="w-full justify-start gap-2.5 h-11 text-sm font-semibold">
                  <Plus className="h-4 w-4 text-amber-600" />
                  <span>Add New Product SKU</span>
                </Button>
              </Link>
              <Link href="/invoices?action=create" className="block">
                <Button variant="secondary" className="w-full justify-start gap-2.5 h-11 text-sm font-semibold">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Generate B2B GST Invoice</span>
                </Button>
              </Link>
              <Link href="/customers?action=khata" className="block">
                <Button variant="secondary" className="w-full justify-start gap-2.5 h-11 text-sm font-semibold">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>Log Customer Khata Credit</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* GST & State Tax Status Card */}
          <Card className="bg-slate-900 text-white border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-amber-400 font-mono">
                  GST Compliance (UP - 09)
                </CardTitle>
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
              <CardDescription className="text-slate-300 text-xs">
                Intrastate (CGST+SGST) and Interstate (IGST) split engine active.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                <span className="text-slate-300">GSTR-1 Status</span>
                <span className="font-semibold text-emerald-400 font-mono">Ready for Filing</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                <span className="text-slate-300">Composite Scheme</span>
                <span className="font-semibold text-slate-200">Regular (18%/12%/5%)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
