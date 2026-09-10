'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, ChevronDown, Store, ShoppingCart, Boxes, Receipt, Users, Tag, BarChart3, ShieldCheck, Sparkles, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  {
    label: 'Product',
    items: [
      { label: 'Online Storefront', blurb: 'Mobile-first web store', href: '/dashboard/storefront', icon: Store },
      { label: 'POS Billing', blurb: 'Sub-10s counter billing', href: '/dashboard/pos', icon: ShoppingCart },
      { label: 'Inventory', blurb: 'Real-time stock ledger', href: '/dashboard/inventory', icon: Boxes },
      { label: 'GST Invoicing', blurb: 'Auto HSN + tax split', href: '/dashboard/invoices/142', icon: Receipt },
    ],
    cta: { label: 'Explore the dashboard', href: '/dashboard' },
  },
  {
    label: 'Features',
    items: [
      { label: 'Customer Khata', blurb: 'Credit & purchase history', href: '/dashboard/customers', icon: Users },
      { label: 'Marketing & Coupons', blurb: 'Campaigns that retain', href: '/dashboard/marketing', icon: Tag },
      { label: 'Analytics', blurb: 'Revenue & growth insights', href: '/dashboard/analytics', icon: BarChart3 },
      { label: 'Security', blurb: 'RBAC, audit, isolation', href: '/dashboard/security', icon: ShieldCheck },
    ],
    cta: { label: 'See all capabilities', href: '/dashboard' },
  },
  {
    label: 'Solutions',
    items: [
      { label: 'Retail Stores', blurb: 'Counter + online', href: '#use-cases', icon: Store },
      { label: 'Wholesalers', blurb: 'Bulk & Khata billing', href: '#use-cases', icon: Boxes },
      { label: 'Fashion', blurb: 'Seasonal inventory', href: '#use-cases', icon: Sparkles },
      { label: 'Grocery & More', blurb: 'Everyday essentials', href: '#use-cases', icon: ShoppingCart },
    ],
    cta: { label: 'See who it’s for', href: '#use-cases' },
  },
];

function NavDropdown({
  label,
  items,
  cta,
  open,
  onToggle,
  onClose,
}: {
  label: string;
  items: { label: string; blurb: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
  cta: { label: string; href: string };
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open, onClose]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={onToggle}
      onMouseLeave={onClose}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white transition rounded-lg hover:bg-white/5"
      >
        {label}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      <div
        className={cn(
          'absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[22rem] bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 p-2 origin-top transition-all duration-200',
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        )}
      >
        <div className="grid grid-cols-2 gap-0.5">
          {items.map((item, ii) => (
            <Link
              key={ii}
              href={item.href}
              onClick={onClose}
              className="group flex flex-col gap-0.5 p-3 rounded-xl hover:bg-white/5 transition"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-200 group-hover:text-white">
                <span className="h-6 w-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500/20 transition">
                  <item.icon className="h-3.5 w-3.5" />
                </span>
                {item.label}
              </span>
              <span className="pl-8 text-xs text-slate-500">{item.blurb}</span>
            </Link>
          ))}
        </div>
        <Link
          href={cta.href}
          onClick={onClose}
          className="mt-1 flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition"
        >
          {cta.label}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const closeAll = () => {
    setOpenDropdown(null);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0" onClick={closeAll}>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-amber-500/20">
            भा
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-white leading-none">
              Bharat<span className="text-amber-500">Store</span>
            </span>
            <span className="text-2xs text-slate-400 font-medium tracking-wide hidden sm:block">
              Unified Commerce Engine
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          {navLinks.map((group, gi) => (
            <NavDropdown
              key={gi}
              label={group.label}
              items={group.items}
              cta={group.cta}
              open={openDropdown === gi}
              onToggle={() => setOpenDropdown(openDropdown === gi ? null : gi)}
              onClose={() => setOpenDropdown(null)}
            />
          ))}
          <Link
            href="#resources"
            className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white transition rounded-lg hover:bg-white/5"
          >
            Resources
          </Link>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm font-semibold text-slate-300 hover:text-white transition px-3 py-1.5"
          >
            Sign In
          </Link>
          <Link
            href="/onboarding"
            className="text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg shadow-sm shadow-amber-500/20 transition flex items-center gap-1.5 hover:shadow-amber-500/30"
          >
            <span>Get Started</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            className="lg:hidden p-2 text-slate-300 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-md p-4 space-y-5 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {navLinks.map((group, gi) => (
            <div key={gi}>
              <p className="text-2xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">{group.label}</p>
              <div className="grid grid-cols-1 gap-1">
                {group.items.map((item, ii) => (
                  <Link
                    key={ii}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition"
                    onClick={closeAll}
                  >
                    <span className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-200">{item.label}</span>
                      <span className="block text-xs text-slate-500">{item.blurb}</span>
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-600 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 w-full text-center px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-sm font-bold"
              onClick={closeAll}
            >
              Explore Live Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="block w-full text-center px-4 py-2.5 rounded-lg border border-slate-700 text-sm font-semibold text-white hover:bg-slate-800 transition"
              onClick={closeAll}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}