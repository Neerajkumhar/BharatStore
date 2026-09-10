'use client';

import Link from 'next/link';
import { ShieldCheck, Zap, IndianRupee } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Online Storefront', href: '/dashboard/storefront' },
    { label: 'POS Billing', href: '/dashboard/pos' },
    { label: 'Inventory', href: '/dashboard/inventory' },
    { label: 'GST Invoicing', href: '/dashboard/inventory' },
    { label: 'Analytics', href: '/dashboard/analytics' },
  ],
  Solutions: [
    { label: 'Retail Stores', href: '#use-cases' },
    { label: 'Wholesalers', href: '#use-cases' },
    { label: 'Fashion', href: '#use-cases' },
    { label: 'Grocery', href: '#use-cases' },
    { label: 'Artisans', href: '#use-cases' },
  ],
  Company: [
    { label: 'About', href: '/' },
    { label: 'Blog', href: '/' },
    { label: 'Careers', href: '/' },
    { label: 'Contact', href: '/' },
  ],
  Resources: [
    { label: 'Documentation', href: '/' },
    { label: 'API Reference', href: '/' },
    { label: 'Support', href: '/' },
    { label: 'Status', href: '/' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/' },
    { label: 'Terms of Service', href: '/' },
    { label: 'Refund Policy', href: '/' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-landing-dots opacity-20 mask-fade-b pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div id="resources" className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-amber-500/30">
                भा
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  Bharat<span className="text-amber-500">Store</span>
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Unified digital commerce, inventory, GST invoicing, and POS engine for Indian small businesses.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { icon: Zap, label: 'Instant billing' },
                { icon: ShieldCheck, label: 'Tenant-isolated' },
                { icon: IndianRupee, label: 'INR native' },
              ].map((b, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-2xs font-semibold text-slate-300"
                >
                  <b.icon className="h-3 w-3 text-amber-400" />
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2026 BharatStore Technologies. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Secure Indian Cloud Infrastructure
          </p>
        </div>
      </div>
    </footer>
  );
}