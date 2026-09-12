import React from 'react';
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
  Sparkles,
  Circle,
  CircleCheck,
  CircleDashed,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';

const sampleOrders = [
  {
    id: 'ORD-2026-8901',
    customer: 'Ananya Sharma',
    phone: '+91 98765 43210',
    items: 'Kanjeevaram Silk Saree (Red/Gold) x 1',
    total: '₹18,500',
    status: 'COMPLETED' as const,
    paymentMethod: 'UPI (PhonePe)',
    time: '12 mins ago',
  },
  {
    id: 'ORD-2026-8900',
    customer: 'Vikram Malhotra',
    phone: '+91 91234 56789',
    items: 'Banarasi Brocade Dupatta x 2',
    total: '₹6,400',
    status: 'PROCESSING' as const,
    paymentMethod: 'Khata Credit',
    time: '45 mins ago',
  },
  {
    id: 'ORD-2026-8899',
    customer: 'Pooja Verma',
    phone: '+91 99887 76655',
    items: 'Chanderi Zari Suit Set (Mint) x 1',
    total: '₹4,200',
    status: 'PENDING_PAYMENT' as const,
    paymentMethod: 'Cash on Delivery',
    time: '2 hours ago',
  },
];

const statusMeta = {
  COMPLETED: { label: 'Paid & Delivered', badge: 'success' as const, Icon: CircleCheck },
  PROCESSING: { label: 'Processing', badge: 'warning' as const, Icon: Clock },
  PENDING_PAYMENT: { label: 'Pending payment', badge: 'info' as const, Icon: CircleDashed },
};

export default function DashboardPage() {
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
            Today&apos;s commerce &amp; inventory overview.
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

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's Sales (GMV)"
          value="₹42,850.00"
          icon={TrendingUp}
          iconTone="amber"
          demo
          trend={{ direction: 'up', label: '+18.4% from yesterday' }}
        />
        <StatCard
          label="Active Orders"
          value="14"
          unit="Orders"
          icon={ShoppingCart}
          iconTone="blue"
          demo
          hint="3 awaiting dispatch"
        />
        <StatCard
          label="Inventory Alerts"
          value="2"
          unit="SKUs low"
          icon={Boxes}
          iconTone="rose"
          demo
          hint="Restock needed within 3 days"
        />
        <StatCard
          label="Khata Receivable"
          value="₹12,400.00"
          icon={Users}
          iconTone="purple"
          demo
          hint="8 customers on ledger"
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
                Omnichannel sales from POS and online store{' '}
                <span className="inline-flex items-center gap-1 font-mono text-2xs text-slate-500">
                  · demo data
                </span>
              </CardDescription>
            </div>
            <Link href="/orders">
              <Button variant="outline" size="sm" rightIcon={<ChevronRight className="h-3.5 w-3.5" />}>
                View All Orders
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
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
                  {sampleOrders.map((order) => {
                    const meta = statusMeta[order.status];
                    const StatusIcon = meta.Icon;
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                          {order.id}
                          <div className="text-2xs text-slate-500 font-sans font-normal">{order.time}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{order.customer}</div>
                          <div className="text-2xs text-slate-500">{order.phone}</div>
                        </td>
                        <td className="max-w-[200px] truncate px-6 py-4 text-slate-600">{order.items}</td>
                        <td className="px-6 py-4 font-bold text-slate-900 tabular-nums">{order.total}</td>
                        <td className="px-6 py-4">
                          <Badge variant={meta.badge} className="gap-1">
                            <span className="inline-flex items-center">
                              <StatusIcon className="h-3 w-3" aria-hidden="true" />
                            </span>
                            {meta.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right text-xs font-medium text-slate-600">
                          {order.paymentMethod}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono text-sm font-bold text-amber-700">
                  GST Compliance (UP - 09)
                </CardTitle>
                <Sparkles className="h-4 w-4 text-amber-600" />
              </div>
              <CardDescription className="text-xs">
                Intrastate (CGST+SGST) and Interstate (IGST) split engine active.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <span className="text-slate-600">GSTR-1 Status</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <CircleCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  Ready for filing
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <span className="text-slate-600">Composite Scheme</span>
                <span className="font-semibold text-slate-800">Regular (18%/12%/5%)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}