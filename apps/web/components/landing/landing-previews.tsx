'use client';

import React, { useId } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  BarChart3,
  Bell,
  Settings,
  ShieldCheck,
  Search,
  CreditCard,
  QrCode,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Boxes,
  Wallet,
  Star,
  Tag,
  ShoppingBag,
  Store,
  Receipt,
  Megaphone,
  AlertTriangle,
  Banknote,
  BookOpen,
  ScanLine,
  Lock,
  Zap,
  Truck,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CountUp } from './count-up';

/* ─── Shared helpers ─────────────────────────────────────── */

function BrowserChrome({ url = 'bharatstore.app' }: { url?: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border-b border-slate-200/80">
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/90" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
      </div>
      <div className="flex-1 text-center">
        <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-md bg-white border border-slate-200 text-2xs text-slate-400 font-mono max-w-full truncate">
          <Lock className="h-2.5 w-2.5" />
          {url}
        </div>
      </div>
    </div>
  );
}

interface MockFrameProps {
  children: React.ReactNode;
  url?: string;
  className?: string;
}

export function MockFrame({ children, url, className }: MockFrameProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200/90 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)] overflow-hidden',
        className
      )}
    >
      {url && <BrowserChrome url={url} />}
      {children}
    </div>
  );
}

function AreaChart({
  data = [40, 55, 35, 70, 60, 85, 75, 90, 65, 80, 95, 70],
  color = '#f59e0b',
  className,
}: {
  data?: number[];
  color?: string;
  className?: string;
}) {
  const id = useId();
  const w = 300;
  const h = 90;
  const pad = 4;
  const max = Math.max(...data);
  const pts = data.map((v, i) => [
    pad + (i * (w - pad * 2)) / (data.length - 1),
    h - pad - (v / max) * (h - pad * 2),
  ]);
  const line = pts.map((p) => p.join(',')).join(' ');
  const area = `M ${pts[0][0]} ${h} L ${line.replace(/,/g, ' ')} L ${pts[pts.length - 1][0]} ${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn('w-full h-full', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((y) => (
        <line
          key={y}
          x1="0"
          x2={w}
          y1={h * y}
          y2={h * y}
          stroke="#e2e8f0"
          strokeWidth="0.5"
          strokeDasharray="3 3"
        />
      ))}
      <polygon points={area} fill={`url(#${id}-fill)`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={pts[pts.length - 1][0]}
        cy={pts[pts.length - 1][1]}
        r="3"
        fill={color}
        stroke="#fff"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function Sparkline({ data = [2, 4, 3, 6, 5, 8], positive = true }: { data?: number[]; positive?: boolean }) {
  const id = useId();
  const w = 60;
  const h = 20;
  const max = Math.max(...data);
  const pts = data.map((v, i) => [
    (i * (w - 4)) / (data.length - 1) + 2,
    h - 2 - (v / max) * (h - 4),
  ]);
  const line = pts.map((p) => p.join(',')).join(' ');
  const color = positive ? '#059669' : '#dc2626';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-12 h-4" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-sf`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`${pts[0][0]},${h} ${line.replace(/,/g, ' ')} ${pts[pts.length - 1][0]},${h}`}
        fill={`url(#${id}-sf)`}
      />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusPill({ children, tone = 'success' }: { children: React.ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold border whitespace-nowrap',
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

/* ─── Dashboard Mock ─────────────────────────────────────── */

export function DashboardMock({ className }: { className?: string }) {
  return (
    <MockFrame url="dashboard.bharatstore.app" className={className}>
      <div className="flex min-h-[340px]">
        {/* Sidebar */}
        <div className="w-44 bg-slate-900 text-slate-300 p-3 space-y-4 shrink-0 hidden md:block">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="h-6 w-6 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 text-xs font-black">भ</div>
            <span className="text-xs font-bold text-white">BharatStore</span>
          </div>
          <div className="space-y-2.5">
            {[
              { icon: LayoutDashboard, label: 'Dashboard', active: true, badge: '' },
              { icon: ShoppingCart, label: 'Orders', active: false, badge: '3' },
              { icon: Package, label: 'Products', active: false, badge: '' },
              { icon: Boxes, label: 'Inventory', active: false, badge: '2' },
              { icon: Store, label: 'Storefront', active: false, badge: '' },
              { icon: Users, label: 'Customers', active: false, badge: '' },
              { icon: BarChart3, label: 'Analytics', active: false, badge: '' },
              { icon: Receipt, label: 'GST Invoices', active: false, badge: '' },
            ].map((item, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition',
                  item.active
                    ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-2xs bg-amber-500 text-slate-950 font-bold px-1.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-800 space-y-2.5">
            {[
              { icon: Megaphone, label: 'Marketing' },
              { icon: ShieldCheck, label: 'Security' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 transition"
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-500">
              <Settings className="h-3.5 w-3.5" />
              <span>Settings</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 bg-slate-50 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dashboard</h3>
              <p className="text-2xs text-slate-500">Welcome back, Ramesh</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-2xs text-slate-500">
                <Search className="h-3 w-3" />
                <span>Search...</span>
              </div>
              <div className="relative">
                <Bell className="h-4 w-4 text-slate-400" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500" />
              </div>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <KpiMini
              title="Revenue"
              value={
                <CountUp value={84250} prefix="₹" className="tabular-nums" />
              }
              change="+18.4%"
              positive
            />
            <KpiMini
              title="Orders"
              value={<CountUp value={128} className="tabular-nums" />}
              change="+12 today"
              positive
            />
            <KpiMini
              title="Customers"
              value={<CountUp value={342} className="tabular-nums" />}
              change="+8 this week"
              positive
            />
            <KpiMini
              title="Stock Alerts"
              value={<CountUp value={12} className="tabular-nums" />}
              change="Need attention"
              warn
            />
          </div>

          {/* Chart + Recent */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-3 bg-white rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-2xs font-bold text-slate-700 uppercase tracking-wider">Sales Trend</p>
                <span className="text-2xs text-emerald-600 font-semibold">↑ 18.4%</span>
              </div>
              <div className="h-20">
                <AreaChart data={[40, 55, 35, 70, 60, 85, 75, 90, 65, 80, 95, 70]} />
              </div>
              <div className="flex justify-between text-2xs text-slate-400 font-mono mt-1">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
                <span>Sun</span>
              </div>
            </div>
            <div className="sm:col-span-2 bg-white rounded-lg border border-slate-200 p-3">
              <p className="text-2xs font-bold text-slate-700 uppercase tracking-wider mb-2">Recent Orders</p>
              <div className="space-y-2">
                {[
                  { name: 'Priya Sharma', amt: 1240, status: 'Paid', tone: 'success' },
                  { name: 'Amit Patel', amt: 890, status: 'Khata', tone: 'warning' },
                  { name: 'Neha Gupta', amt: 2100, status: 'Paid', tone: 'success' },
                  { name: 'Ravi Kumar', amt: 650, status: 'Pending', tone: 'info' },
                ].map((o, i) => (
                  <div key={i} className="flex items-center justify-between text-2xs">
                    <div>
                      <p className="font-medium text-slate-700">{o.name}</p>
                      <p className="text-slate-400">{o.status}</p>
                    </div>
                    <p className="font-bold text-slate-900 tabular-nums">₹{o.amt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockFrame>
  );
}

function KpiMini({
  title,
  value,
  change,
  positive,
  warn,
}: {
  title: string;
  value: React.ReactNode;
  change: string;
  positive?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-2.5">
      <p className="text-2xs text-slate-500 font-medium uppercase tracking-wider">{title}</p>
      <p className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{value}</p>
      <div className="flex items-center gap-1 mt-0.5">
        {warn ? (
          <AlertTriangle className="h-3 w-3 text-amber-500" />
        ) : positive ? (
          <ArrowUpRight className="h-3 w-3 text-emerald-600" />
        ) : (
          <ArrowDownRight className="h-3 w-3 text-red-600" />
        )}
        <span
          className={cn(
            'text-2xs font-semibold',
            warn ? 'text-amber-600' : positive ? 'text-emerald-600' : 'text-red-600'
          )}
        >
          {change}
        </span>
      </div>
    </div>
  );
}

/* ─── Floating KPI Cards ─────────────────────────────────── */

export function FloatingKpiCards() {
  const cards = [
    {
      icon: TrendingUp,
      tint: 'text-emerald-500 bg-emerald-500/10 ring-emerald-500/20',
      label: 'Revenue',
      value: <CountUp value={84520} prefix="₹" className="tabular-nums" />,
      change: '+18.4%',
      changeClass: 'text-emerald-400',
    },
    {
      icon: ShoppingCart,
      tint: 'text-blue-500 bg-blue-500/10 ring-blue-500/20',
      label: 'Orders',
      value: <CountUp value={128} className="tabular-nums" />,
      change: '+12 today',
      changeClass: 'text-blue-400',
    },
    {
      icon: Boxes,
      tint: 'text-amber-500 bg-amber-500/10 ring-amber-500/20',
      label: 'Low Stock',
      value: <CountUp value={12} className="tabular-nums" />,
      change: 'needs restock',
      changeClass: 'text-amber-400',
    },
  ];

  return (
    <div className="flex gap-3 flex-wrap justify-center lg:justify-start">
      {cards.map((card, i) => (
        <div
          key={i}
          className={cn(
            'bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 min-w-[170px] shadow-xl shadow-black/20',
            i === 1 && 'animate-float',
            i === 2 && 'animate-float-delayed'
          )}
        >
          <div className={cn('p-2 rounded-lg ring-1', card.tint)}>
            <card.icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-2xs text-slate-400 font-medium">{card.label}</p>
            <p className="text-sm font-bold text-white">{card.value}</p>
            <p className={cn('text-2xs font-semibold', card.changeClass)}>{card.change}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── POS Mock ───────────────────────────────────────────── */

export function PosMock({ className }: { className?: string }) {
  const products = [
    { name: 'Cotton Kurta', sku: 'CK-001', price: 899, gst: 5, qty: 2 },
    { name: 'Silk Dupatta', sku: 'SD-042', price: 450, gst: 5, qty: 1 },
    { name: 'Brass Bangle', sku: 'BB-108', price: 320, gst: 12, qty: 3 },
  ];
  const subtotal = products.reduce((a, p) => a + p.price * p.qty, 0);
  const tax = products.reduce((a, p) => a + (p.price * p.qty * p.gst) / 100, 0);
  const total = subtotal + tax;

  return (
    <MockFrame url="dashboard.bharatstore.app/pos" className={className}>
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold">POS Counter</span>
        </div>
        <span className="text-2xs bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">3 SKUs</span>
      </div>

      <div className="p-3 space-y-3">
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-500">
          <Search className="h-3.5 w-3.5" />
          <span>Scan barcode or search product...</span>
          <span className="ml-auto text-2xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">F1</span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {['All', 'Kurtas', 'Dupatta', 'Jewellery'].map((cat, i) => (
            <span
              key={i}
              className={cn(
                'px-2.5 py-1 rounded-full text-2xs font-bold whitespace-nowrap',
                i === 0 ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
              )}
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="space-y-2">
          {products.map((p, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs">
              <div>
                <p className="font-bold text-slate-900">{p.name}</p>
                <p className="text-2xs text-slate-500 font-mono">{p.sku}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-0.5 text-2xs font-bold text-slate-700 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 tabular-nums">
                  − {p.qty} +
                </span>
                <span className="font-bold text-slate-900 tabular-nums">₹{(p.price * p.qty).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Customer</p>
          <div className="flex items-center gap-2 px-2.5 py-2 bg-white rounded-lg border border-slate-200 text-xs">
            <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-2xs font-black">PS</div>
            <span className="font-semibold text-slate-800">Priya Sharma</span>
            <span className="ml-auto text-2xs text-amber-700 font-bold bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">Khata ₹3,200</span>
          </div>
        </div>

        <div>
          <p className="text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Payment</p>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: 'UPI', icon: ScanLine, active: true },
              { label: 'Cash', icon: Banknote, active: false },
              { label: 'Card', icon: CreditCard, active: false },
              { label: 'Khata', icon: BookOpen, active: false },
            ].map((m, i) => (
              <div
                key={i}
                className={cn(
                  'flex flex-col items-center gap-1 py-2 rounded-lg border text-2xs font-bold transition',
                  m.active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-500'
                )}
              >
                <m.icon className="h-3.5 w-3.5" />
                {m.label}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1 text-xs bg-slate-50 rounded-lg border border-slate-100 p-2.5">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>GST (5% / 12%)</span>
            <span className="font-mono tabular-nums">₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
            <span>Total</span>
            <span className="text-amber-600 tabular-nums">₹{total.toFixed(2)}</span>
          </div>
        </div>

        <button className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Complete Sale — ₹{Math.round(total).toLocaleString('en-IN')}
        </button>
      </div>
    </MockFrame>
  );
}

/* ─── Inventory Table Mock ───────────────────────────────── */

export function InventoryMock({ className }: { className?: string }) {
  const items = [
    { product: 'Cotton Kurta', sku: 'CK-001', stock: 45, pct: 90, purchase: 500, selling: 899, status: 'In Stock', tone: 'success' },
    { product: 'Silk Dupatta', sku: 'SD-042', stock: 8, pct: 16, purchase: 280, selling: 450, status: 'Low Stock', tone: 'warning' },
    { product: 'Brass Bangle Set', sku: 'BB-108', stock: 0, pct: 0, purchase: 180, selling: 320, status: 'Out of Stock', tone: 'danger' },
    { product: 'Printed Saree', sku: 'PS-205', stock: 23, pct: 46, purchase: 650, selling: 1200, status: 'In Stock', tone: 'success' },
  ];

  const barTone: Record<string, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  };

  return (
    <MockFrame url="dashboard.bharatstore.app/inventory" className={className}>
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-bold text-slate-900">Inventory</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xs text-slate-500 tabular-nums">{items.length} products</span>
          <span className="text-2xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 font-bold flex items-center gap-1">
            <Zap className="h-2.5 w-2.5" /> Live sync
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider text-2xs">Product</th>
              <th className="text-left px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider text-2xs">SKU</th>
              <th className="text-right px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider text-2xs">Stock</th>
              <th className="text-right px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider text-2xs">Purchase</th>
              <th className="text-right px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider text-2xs">Selling</th>
              <th className="text-center px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider text-2xs">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="px-3 py-2 font-medium text-slate-900">{item.product}</td>
                <td className="px-3 py-2 font-mono text-slate-500 text-2xs">{item.sku}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', barTone[item.tone])} style={{ width: `${item.pct}%` }} />
                    </div>
                    <span className="font-bold font-mono text-slate-900 tabular-nums">{item.stock}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right font-mono text-slate-600 tabular-nums">₹{item.purchase}</td>
                <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 tabular-nums">₹{item.selling}</td>
                <td className="px-3 py-2 text-center">
                  <StatusPill tone={item.tone}>{item.status}</StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MockFrame>
  );
}

/* ─── GST Invoice Mock ───────────────────────────────────── */

export function GstInvoiceMock({ className }: { className?: string }) {
  return (
    <MockFrame url="dashboard.bharatstore.app/invoices/142" className={className}>
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-bold text-slate-900">GST Tax Invoice</span>
        </div>
        <span className="text-2xs font-mono text-slate-500">INV-2026-00142</span>
      </div>
      <div className="p-4 space-y-3 text-xs">
        <div className="flex justify-between">
          <div>
            <p className="font-bold text-slate-900">Ramesh Fashions</p>
            <p className="text-2xs text-slate-400">14 MG Road, Jaipur · GSTIN 08AAACS1234F1Z5</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500">Billed To</p>
            <p className="font-medium text-slate-900">Priya Sharma</p>
            <p className="text-2xs text-slate-400">GSTIN 09AABCS1234F1Z5</p>
          </div>
        </div>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-1.5 text-2xs font-semibold text-slate-500">HSN</th>
                <th className="text-left px-3 py-1.5 text-2xs font-semibold text-slate-500">Item</th>
                <th className="text-right px-3 py-1.5 text-2xs font-semibold text-slate-500">Taxable</th>
                <th className="text-right px-3 py-1.5 text-2xs font-semibold text-slate-500">GST</th>
                <th className="text-right px-3 py-1.5 text-2xs font-semibold text-slate-500">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-3 py-1.5 font-mono text-2xs text-slate-500">6206</td>
                <td className="px-3 py-1.5 text-slate-900">Cotton Kurta ×2</td>
                <td className="px-3 py-1.5 text-right font-mono tabular-nums">₹1,698</td>
                <td className="px-3 py-1.5 text-right font-mono tabular-nums">₹84.90</td>
                <td className="px-3 py-1.5 text-right font-mono font-bold tabular-nums">₹1,783</td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 font-mono text-2xs text-slate-500">6214</td>
                <td className="px-3 py-1.5 text-slate-900">Silk Dupatta ×1</td>
                <td className="px-3 py-1.5 text-right font-mono tabular-nums">₹450</td>
                <td className="px-3 py-1.5 text-right font-mono tabular-nums">₹22.50</td>
                <td className="px-3 py-1.5 text-right font-mono font-bold tabular-nums">₹473</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <div className="space-y-1 bg-slate-50 rounded-lg p-3">
            <div className="flex justify-between text-slate-500">
              <span>Taxable Amount</span>
              <span className="font-mono tabular-nums">₹2,148.00</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>CGST (2.5%)</span>
              <span className="font-mono tabular-nums">₹53.70</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>SGST (2.5%)</span>
              <span className="font-mono tabular-nums">₹53.70</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>Grand Total</span>
              <span className="text-amber-600 tabular-nums">₹2,255.40</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 w-20 h-20 bg-white border border-slate-200 rounded-lg">
            <QrCode className="h-7 w-7 text-slate-700" />
            <span className="text-2xs text-slate-400">QR</span>
          </div>
        </div>
      </div>
    </MockFrame>
  );
}

/* ─── Customer Card Mock ─────────────────────────────────── */

export function CustomerCardMock({ className }: { className?: string }) {
  return (
    <MockFrame url="dashboard.bharatstore.app/customers/PS-01" className={className}>
      <div className="p-4 bg-slate-900 text-white flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 font-bold text-sm">PS</div>
        <div className="flex-1">
          <p className="font-bold text-sm">Priya Sharma</p>
          <p className="text-2xs text-slate-400">+91 98765 43210 · Jaipur</p>
        </div>
        <StatusPill tone="success">Active</StatusPill>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
            <p className="text-2xs text-slate-500 font-medium">Total Purchases</p>
            <p className="text-sm font-bold text-slate-900 tabular-nums">₹24,580</p>
            <Sparkline data={[2, 3, 5, 4, 6, 8]} />
          </div>
          <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-200">
            <p className="text-2xs text-amber-700 font-medium">Khata Balance</p>
            <p className="text-sm font-bold text-amber-900 tabular-nums">₹3,200</p>
            <p className="text-2xs text-amber-600 font-semibold">due in 14 days</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
            <p className="text-2xs text-slate-500 font-medium">Total Orders</p>
            <p className="text-sm font-bold text-slate-900 tabular-nums">18</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
            <p className="text-2xs text-slate-500 font-medium">Last Purchase</p>
            <p className="text-sm font-bold text-slate-900">Today</p>
          </div>
        </div>
        <button className="w-full py-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 hover:bg-amber-400 transition">
          <Wallet className="h-3.5 w-3.5" />
          Record Khata Payment
        </button>
      </div>
    </MockFrame>
  );
}

/* ─── Khata Ledger Mock ──────────────────────────────────── */

export function KhataLedgerMock({ className }: { className?: string }) {
  const entries = [
    { date: '10 Sep', desc: 'Cotton Kurta ×2', debit: 1783, credit: 0, balance: 3200 },
    { date: '08 Sep', desc: 'Payment received (UPI)', debit: 0, credit: 2000, balance: 1417 },
    { date: '05 Sep', desc: 'Silk Dupatta ×1', debit: 450, credit: 0, balance: 3417 },
    { date: '01 Sep', desc: 'Opening Balance', debit: 0, credit: 0, balance: 2967 },
  ];

  return (
    <MockFrame url="dashboard.bharatstore.app/khata/PS-01" className={className}>
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-purple-600" />
          <span className="text-xs font-bold text-slate-900">Khata Ledger</span>
        </div>
        <span className="text-2xs font-mono text-purple-700 font-bold bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5">Balance ₹3,200</span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-3 py-2 text-2xs font-semibold text-slate-500">Date</th>
            <th className="text-left px-3 py-2 text-2xs font-semibold text-slate-500">Description</th>
            <th className="text-right px-3 py-2 text-2xs font-semibold text-slate-500">Debit</th>
            <th className="text-right px-3 py-2 text-2xs font-semibold text-slate-500">Credit</th>
            <th className="text-right px-3 py-2 text-2xs font-semibold text-slate-500">Balance</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition">
              <td className="px-3 py-2 text-slate-500">{e.date}</td>
              <td className="px-3 py-2 text-slate-900 font-medium">{e.desc}</td>
              <td className="px-3 py-2 text-right font-mono text-red-600 tabular-nums">{e.debit > 0 ? `₹${e.debit.toLocaleString('en-IN')}` : '—'}</td>
              <td className="px-3 py-2 text-right font-mono text-emerald-600 tabular-nums">{e.credit > 0 ? `₹${e.credit.toLocaleString('en-IN')}` : '—'}</td>
              <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 tabular-nums">₹{e.balance.toLocaleString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-2xs">
        <span className="text-slate-500">Khata ageing · overdue ₹0</span>
        <span className="text-amber-700 font-bold">View all 14 entries →</span>
      </div>
    </MockFrame>
  );
}

/* ─── Coupon Card Mock ───────────────────────────────────── */

export function CouponCardMock({ className }: { className?: string }) {
  return (
    <MockFrame url="dashboard.bharatstore.app/marketing" className={className}>
      <div className="p-4 flex items-center justify-between border-b border-slate-200">
        <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <Tag className="h-4 w-4 text-amber-600" />
          Coupon
        </span>
        <StatusPill tone="success">Active</StatusPill>
      </div>
      <div className="p-4 space-y-3">
        <div className="border-2 border-dashed border-amber-300 rounded-xl p-4 bg-amber-50 text-center">
          <p className="text-2xl font-black text-amber-700 tracking-wider font-mono">SUMMER20</p>
          <p className="text-xs font-bold text-amber-600 mt-1">20% OFF</p>
          <p className="text-2xs text-amber-600/80 mt-0.5">Minimum order ₹999</p>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Used</span>
          <span className="font-bold text-slate-900 tabular-nums">128 times</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Revenue impact</span>
          <span className="font-bold text-emerald-600 tabular-nums">+₹45,200</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full w-[64%] bg-amber-500 rounded-full" />
        </div>
        <p className="text-2xs text-slate-400">128 of 200 redemptions</p>
      </div>
    </MockFrame>
  );
}

/* ─── Campaigns Mock ─────────────────────────────────────── */

export function CampaignsMock({ className }: { className?: string }) {
  const campaigns = [
    { name: 'Monsoon Sale', status: 'Active', spend: '₹2,400', tone: 'success', pct: 82 },
    { name: 'Diwali Special', status: 'Scheduled', spend: '—', tone: 'info', pct: 30 },
    { name: 'Clearance Week', status: 'Ended', spend: '₹8,100', tone: 'neutral', pct: 100 },
  ];
  return (
    <MockFrame url="dashboard.bharatstore.app/marketing" className={className}>
      <div className="p-4 flex items-center gap-2 border-b border-slate-200">
        <Megaphone className="h-4 w-4 text-amber-600" />
        <span className="text-xs font-bold text-slate-900">Campaigns</span>
      </div>
      <div className="p-4 space-y-3">
        {campaigns.map((c, i) => (
          <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <p className="font-bold text-slate-900">{c.name}</p>
              <StatusPill tone={c.tone}>{c.status}</StatusPill>
            </div>
            <div className="flex items-center justify-between text-2xs text-slate-500 mt-1.5">
              <span>Spend {c.spend}</span>
              <span className="tabular-nums">{c.pct}%</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1.5">
              <div
                className={cn(
                  'h-full rounded-full',
                  c.tone === 'success' ? 'bg-emerald-500' : c.tone === 'info' ? 'bg-blue-500' : 'bg-slate-400'
                )}
                style={{ width: `${c.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

/* ─── Coupon Performance Mock ────────────────────────────── */

export function CouponPerformanceMock({ className }: { className?: string }) {
  const rows = [
    { code: 'SUMMER20', uses: 128, revenue: '₹45.2K' },
    { code: 'WELCOME10', uses: 89, revenue: '₹12.8K' },
    { code: 'BULK15', uses: 34, revenue: '₹8.4K' },
  ];
  return (
    <MockFrame url="dashboard.bharatstore.app/marketing/analytics" className={className}>
      <div className="p-4 flex items-center gap-2 border-b border-slate-200">
        <BarChart3 className="h-4 w-4 text-amber-600" />
        <span className="text-xs font-bold text-slate-900">Coupon Performance</span>
      </div>
      <div className="p-4 space-y-4">
        {rows.map((c, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono font-bold text-slate-700">{c.code}</span>
              <span className="text-slate-500 tabular-nums">{c.uses} uses · {c.revenue}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                style={{ width: `${(c.uses / 128) * 100}%` }}
              />
            </div>
          </div>
        ))}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-2xs">
          <span className="text-slate-500">Total redemptions</span>
          <span className="font-bold text-slate-900 tabular-nums">251</span>
        </div>
      </div>
    </MockFrame>
  );
}

/* ─── Analytics Chart Mock ───────────────────────────────── */

export function AnalyticsChartMock({ className }: { className?: string }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const values = [35, 42, 38, 55, 48, 62, 58, 72, 84];
  const max = Math.max(...values);

  return (
    <MockFrame url="dashboard.bharatstore.app/analytics" className={className}>
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-bold text-slate-900">Revenue Analytics</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xs text-slate-500">Last 9 months</span>
          <span className="text-2xs bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-full px-2 py-0.5">↑ 18.4%</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-end gap-2 h-40">
          {values.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="absolute bottom-full mb-1 hidden group-hover:block z-10">
                <div className="bg-slate-900 text-white text-2xs rounded px-2 py-1 whitespace-nowrap font-bold tabular-nums">₹{v}K</div>
              </div>
              <div
                className={cn(
                  'w-full rounded-t origin-bottom animate-bar-grow transition-colors',
                  i === values.length - 1
                    ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                    : 'bg-slate-200 group-hover:bg-amber-500'
                )}
                style={{ height: `${(v / max) * 100}%`, animationDelay: `${i * 60}ms` }}
              />
              <span className="text-2xs text-slate-400 font-medium">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </MockFrame>
  );
}

/* ─── Storefront Mock ────────────────────────────────────── */

export function StorefrontMock({ className }: { className?: string }) {
  const products = [
    { name: 'Cotton Kurti Set', price: 1299, mrp: 1899, rating: 4.6, off: '32%', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=200&q=80' },
    { name: 'Silk Saree', price: 3499, mrp: 4999, rating: 4.8, off: '30%', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80' },
    { name: 'Brass Jewellery', price: 899, mrp: 1299, rating: 4.4, off: '31%', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=200&q=80' },
  ];

  return (
    <MockFrame url="rameshlifestyle.bharatstore.app" className={className}>
      {/* Announcement bar */}
      <div className="px-4 py-1.5 bg-slate-900 text-white text-2xs font-semibold flex items-center justify-center gap-1.5">
        <Truck className="h-3 w-3 text-amber-400" />
        Free shipping on orders above ₹999
      </div>
      {/* Store header */}
      <div className="px-4 py-2.5 bg-white flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 text-xs font-black">R</div>
          <div>
            <p className="text-xs font-black text-slate-900 leading-none">Ramesh Fashions</p>
            <p className="text-2xs text-slate-400">Ethnic wear · Jaipur</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-2xs text-slate-500 font-medium">
          <span>Home</span>
          <span>Shop</span>
          <span>Sale</span>
        </div>
        <div className="relative">
          <ShoppingBag className="h-4 w-4 text-slate-700" />
          <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-amber-500 text-slate-950 text-2xs font-black flex items-center justify-center">2</span>
        </div>
      </div>
      {/* Hero banner */}
      <div className="h-20 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 flex items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-landing-grid opacity-20" />
        <div className="text-center relative">
          <p className="text-sm font-black tracking-tight">Festive Collection</p>
          <p className="text-2xs opacity-90">Up to 40% off on ethnic wear · COD & UPI</p>
        </div>
      </div>
      {/* Products */}
      <div className="p-3 grid grid-cols-3 gap-2 bg-slate-50">
        {products.map((p, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden text-left group/card">
            <div className="relative aspect-square bg-slate-100 overflow-hidden">
              <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" loading="lazy" />
              <span className="absolute top-1.5 left-1.5 text-2xs font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">-{p.off} OFF</span>
              {i === 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                  <Flame className="h-2.5 w-2.5" />
                </span>
              )}
            </div>
            <div className="p-2">
              <p className="text-2xs font-semibold text-slate-900 truncate">{p.name}</p>
              <div className="flex items-center gap-0.5 mt-0.5">
                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                <span className="text-2xs font-bold text-slate-700">{p.rating}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-2xs font-black text-slate-900 tabular-nums">₹{p.price}</p>
                <p className="text-2xs text-slate-400 line-through tabular-nums">₹{p.mrp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

/* ─── Security Card Mock ─────────────────────────────────── */

export function SecurityCardMock({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-amber-500/40 hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-300">
      <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 ring-1 ring-amber-500/20 group-hover:bg-amber-500/20 transition">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

/* ─── Workflow Step ──────────────────────────────────────── */

export function WorkflowStep({
  icon: Icon,
  label,
  isLast,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isLast?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/20 group-hover:border-amber-500/50 transition">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-2xs font-bold text-slate-700 mt-2 text-center whitespace-nowrap">{label}</span>
      </div>
      {!isLast && (
        <div className="hidden sm:flex items-center" aria-hidden="true">
          <span className="w-7 h-px bg-gradient-to-r from-amber-400 to-slate-300" />
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-slate-400 -ml-1 shrink-0">
            <path d="M2 6h7M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

export function WorkflowStepMobile({
  icon: Icon,
  label,
  isLast,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isLast?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
          <Icon className="h-4 w-4" />
        </div>
        {!isLast && <div className="w-px h-7 bg-gradient-to-b from-amber-400 to-slate-300 my-1" />}
      </div>
      <span className="text-xs font-bold text-slate-700 pt-3">{label}</span>
    </div>
  );
}