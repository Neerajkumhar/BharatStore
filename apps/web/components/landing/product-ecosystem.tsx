'use client';

import React from 'react';
import Link from 'next/link';
import {
  Store,
  ShoppingCart,
  Boxes,
  Receipt,
  Users,
  Tag,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Wallet,
  ScanLine,
  Star,
  ChevronRight,
} from 'lucide-react';
import { AnimationWrapper } from '@/components/storefront/primitives/animation-wrapper';
import { SectionHeading } from './section-heading';
import { cn } from '@/lib/utils';

/* ─── Compact per-feature previews (1:1 readable, no scaling) ─── */

function MiniStorefront() {
  const products = [
    { img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=120&q=60', price: '₹1,299' },
    { img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=120&q=60', price: '₹3,499' },
    { img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=120&q=60', price: '₹899' },
  ];
  return (
    <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white">
        <span className="h-4 w-4 rounded bg-amber-500 flex items-center justify-center text-slate-950 text-[8px] font-black">R</span>
        <span className="text-2xs font-bold">Ramesh Fashions</span>
        <ShoppingCart className="h-3 w-3 text-slate-400 ml-auto" />
      </div>
      <div className="p-2.5 bg-slate-50">
        <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-center mb-2">
          <p className="text-2xs font-black text-white">Festive Sale · 40% Off</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {products.map((p, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <img src={p.img} alt="" className="w-full h-10 object-cover" loading="lazy" />
              <p className="px-1 py-0.5 text-2xs font-bold text-slate-900 truncate">{p.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniPos() {
  const rows = [
    { name: 'Cotton Kurta', line: '×2 · 5% GST', amt: '₹1,798' },
    { name: 'Silk Dupatta', line: '×1 · 5% GST', amt: '₹473' },
  ];
  return (
    <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white">
        <ScanLine className="h-3 w-3 text-amber-400" />
        <span className="text-2xs font-bold">POS Counter</span>
        <span className="ml-auto text-2xs bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full">Live</span>
      </div>
      <div className="p-2.5 bg-slate-50 space-y-1.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-2xs">
            <div>
              <p className="font-bold text-slate-800">{r.name}</p>
              <p className="text-slate-400">{r.line}</p>
            </div>
            <span className="font-bold text-slate-900 tabular-nums">{r.amt}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-2 py-1.5 text-2xs">
          <span className="text-slate-500">Total (incl. GST)</span>
          <span className="font-black text-slate-900 tabular-nums">₹2,271</span>
        </div>
        <button className="w-full py-1.5 rounded-lg bg-amber-500 text-slate-950 text-2xs font-black">Charge ₹2,271</button>
      </div>
    </div>
  );
}

function MiniInventory() {
  const rows = [
    { name: 'Cotton Kurta', qty: 45, pct: 90, tone: 'bg-emerald-500', status: 'In Stock', sTone: 'text-emerald-700 bg-emerald-50' },
    { name: 'Silk Dupatta', qty: 8, pct: 16, tone: 'bg-amber-500', status: 'Low', sTone: 'text-amber-700 bg-amber-50' },
    { name: 'Brass Bangle', qty: 0, pct: 0, tone: 'bg-red-500', status: 'Out', sTone: 'text-red-700 bg-red-50' },
  ];
  return (
    <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200">
        <Boxes className="h-3 w-3 text-amber-600" />
        <span className="text-2xs font-bold text-slate-900">Stock Ledger</span>
        <span className="ml-auto text-2xs text-slate-400">₹4.2L value</span>
      </div>
      <div className="p-2.5 bg-slate-50 space-y-1.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-2xs">
            <span className="font-semibold text-slate-800 flex-1 truncate">{r.name}</span>
            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full', r.tone)} style={{ width: `${r.pct}%` }} />
            </div>
            <span className="font-bold text-slate-900 tabular-nums">{r.qty}</span>
            <span className={cn('px-1.5 py-0.5 rounded-full font-bold', r.sTone)}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniGst() {
  return (
    <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200">
        <Receipt className="h-3 w-3 text-amber-600" />
        <span className="text-2xs font-bold text-slate-900">Tax Invoice</span>
        <span className="ml-auto text-2xs font-mono text-slate-500">INV-142</span>
      </div>
      <div className="p-2.5 bg-slate-50 space-y-1 text-2xs">
        <div className="flex justify-between text-slate-500">
          <span>Taxable amount</span>
          <span className="tabular-nums">₹2,148.00</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>CGST (2.5%)</span>
          <span className="tabular-nums">₹53.70</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>SGST (2.5%)</span>
          <span className="tabular-nums">₹53.70</span>
        </div>
        <div className="flex justify-between font-black text-slate-900 pt-1.5 border-t border-slate-200">
          <span>Grand total</span>
          <span className="text-amber-600 tabular-nums">₹2,255.40</span>
        </div>
      </div>
    </div>
  );
}

function MiniCustomer() {
  return (
    <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white">
        <span className="h-5 w-5 rounded-full bg-amber-500/20 border border-amber-500 text-amber-400 flex items-center justify-center text-2xs font-black">PS</span>
        <span className="text-2xs font-bold">Priya Sharma</span>
        <span className="ml-auto text-2xs text-slate-400">+91 98••• •••0</span>
      </div>
      <div className="p-2.5 bg-slate-50 grid grid-cols-2 gap-1.5 text-2xs">
        <div className="bg-white border border-slate-200 rounded-lg p-1.5">
          <p className="text-slate-400">Purchases</p>
          <p className="font-black text-slate-900 tabular-nums">₹24,580</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-1.5">
          <p className="text-amber-600">Khata due</p>
          <p className="font-black text-amber-900 tabular-nums">₹3,200</p>
        </div>
        <div className="col-span-2 flex items-center gap-1.5 px-1.5 text-amber-700 font-bold">
          <Wallet className="h-3 w-3" /> Record payment
        </div>
      </div>
    </div>
  );
}

function MiniMarketing() {
  return (
    <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200">
        <Tag className="h-3 w-3 text-amber-600" />
        <span className="text-2xs font-bold text-slate-900">Coupon</span>
        <span className="ml-auto text-2xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5">Active</span>
      </div>
      <div className="p-2.5 bg-slate-50 flex items-center gap-2">
        <div className="flex-1 border-2 border-dashed border-amber-300 rounded-lg bg-amber-50 py-1.5 text-center">
          <span className="font-mono font-black text-amber-700 text-xs">SUMMER20</span>
          <span className="block text-2xs text-amber-600 font-bold">20% OFF · min ₹999</span>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-2xs">
            <span className="text-slate-500">Used</span>
            <span className="font-bold text-slate-900">128</span>
          </div>
          <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full w-[64%] bg-amber-500 rounded-full" />
          </div>
          <p className="text-2xs text-slate-400">+₹45.2K revenue</p>
        </div>
      </div>
    </div>
  );
}

function MiniAnalytics() {
  const bars = [35, 48, 40, 62, 55, 84];
  return (
    <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200">
        <BarChart3 className="h-3 w-3 text-amber-600" />
        <span className="text-2xs font-bold text-slate-900">Revenue trend</span>
        <span className="ml-auto text-2xs font-bold text-emerald-700">↑ 18.4%</span>
      </div>
      <div className="p-2.5 bg-slate-50">
        <div className="flex items-end gap-1.5 h-12">
          {bars.map((b, i) => (
            <div
              key={i}
              className={cn('flex-1 rounded-t', i === bars.length - 1 ? 'bg-gradient-to-t from-amber-600 to-amber-400' : 'bg-slate-300')}
              style={{ height: `${b}%` }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-2xs text-slate-400 font-mono">
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
          <span>Sep</span>
        </div>
      </div>
    </div>
  );
}

function MiniSecurity() {
  const rows = ['Multi-tenant isolation', 'Role-based access', 'Audit logs', 'Secure auth'];
  return (
    <div className="rounded-xl bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        <ShieldCheck className="h-3 w-3 text-amber-400" />
        <span className="text-2xs font-bold text-white">Security Center</span>
      </div>
      <div className="p-2.5 bg-slate-950/60 space-y-1">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 text-2xs text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="flex-1">{r}</span>
            <span className="text-emerald-400 font-bold">●</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Feature data ───────────────────────────────────────── */

const features = [
  {
    icon: Store,
    title: 'Online Storefront',
    description: 'Mobile-first web store with product catalog, categories, and secure checkout.',
    preview: 'storefront',
    href: '/dashboard/storefront',
  },
  {
    icon: ShoppingCart,
    title: 'POS Billing',
    description: 'Sub-10s counter billing with UPI, CASH, and Khata payment modes.',
    preview: 'pos',
    href: '/dashboard/pos',
  },
  {
    icon: Boxes,
    title: 'Inventory',
    description: 'Double-entry stock ledger shared across POS and online orders in real time.',
    preview: 'inventory',
    href: '/dashboard/inventory',
  },
  {
    icon: Receipt,
    title: 'GST Invoicing',
    description: 'Auto HSN codes, CGST/SGST/IGST split, A4 and 80mm thermal receipts.',
    preview: 'gst',
    href: '/dashboard/inventory',
  },
  {
    icon: Users,
    title: 'Customer Khata',
    description: 'Track profiles, purchase history, and outstanding credit balances.',
    preview: 'customer',
    href: '/dashboard/customers',
  },
  {
    icon: Tag,
    title: 'Marketing & Coupons',
    description: 'Create coupons, promotions, and campaigns to drive repeat purchases.',
    preview: 'marketing',
    href: '/dashboard/marketing',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Revenue trends, top products, customer growth, and payment insights.',
    preview: 'analytics',
    href: '/dashboard/analytics',
  },
  {
    icon: ShieldCheck,
    title: 'Staff & Security',
    description: 'Role-based access, audit logs, and multi-tenant data isolation.',
    preview: 'security',
    href: '/dashboard/security',
  },
];

const previews: Record<string, React.ReactNode> = {
  storefront: <MiniStorefront />,
  pos: <MiniPos />,
  inventory: <MiniInventory />,
  gst: <MiniGst />,
  customer: <MiniCustomer />,
  marketing: <MiniMarketing />,
  analytics: <MiniAnalytics />,
  security: <MiniSecurity />,
};

export function ProductEcosystem() {
  return (
    <section className="py-20 sm:py-28 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Platform"
          title={
            <>
              Everything your business needs.
              <br />
              <span className="text-amber-600">In one platform.</span>
            </>
          }
          subtitle="From your first sale to your next growth milestone."
          variant="light"
          className="mb-14"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <AnimationWrapper key={i} animation="fade-up" className="min-w-0">
              <Link
                href={feature.href}
                className="group block min-w-0 bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Preview area */}
                <div className="p-3 pb-0 min-w-0 overflow-hidden">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 ring-1 ring-slate-900/[0.02]">
                    {previews[feature.preview]}
                  </div>
                </div>
                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center ring-1 ring-amber-200/60 group-hover:bg-amber-100 transition">
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{feature.title}</h3>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 ml-auto group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{feature.description}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:gap-2 transition-all">
                    View feature <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </AnimationWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}