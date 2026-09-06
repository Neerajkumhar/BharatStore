'use client';

import React from 'react';
import Link from 'next/link';
import { Store, ShieldCheck, Truck, RefreshCw, CreditCard } from 'lucide-react';

interface StoreFooterProps {
  slug: string;
  tradeName: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  city?: string;
  pincode?: string;
  gstin?: string;
  businessHours?: string;
}

export function StoreFooter({
  slug,
  tradeName,
  phone,
  email,
  addressLine1,
  city,
  pincode,
  gstin,
  businessHours,
}: StoreFooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 border-b border-slate-800 text-center">
          <div className="p-3 rounded-xl bg-slate-800/60 flex flex-col items-center space-y-1">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
            <span className="text-xs font-bold text-white">100% Genuine Products</span>
            <span className="text-2xs text-slate-400">Direct store inventory</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 flex flex-col items-center space-y-1">
            <Truck className="h-5 w-5 text-amber-400" />
            <span className="text-xs font-bold text-white">Fast Local Dispatch</span>
            <span className="text-2xs text-slate-400">Direct fulfillment</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 flex flex-col items-center space-y-1">
            <CreditCard className="h-5 w-5 text-amber-400" />
            <span className="text-xs font-bold text-white">UPI & Cash Payments</span>
            <span className="text-2xs text-slate-400">Flexible options</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 flex flex-col items-center space-y-1">
            <RefreshCw className="h-5 w-5 text-amber-400" />
            <span className="text-xs font-bold text-white">GST Tax Invoice</span>
            <span className="text-2xs text-slate-400">B2B & B2C compliant</span>
          </div>
        </div>

        {/* Footer Main Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center rounded-lg text-sm">
                {tradeName.slice(0, 1).toUpperCase()}
              </div>
              <span className="text-base font-bold text-white">{tradeName}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Official online catalog and direct ordering system for {tradeName}.
            </p>
            {gstin && <p className="text-2xs text-slate-500 font-mono">GSTIN: {gstin}</p>}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Customer Care</h4>
            {phone && <p className="text-xs text-slate-300">Phone: {phone}</p>}
            {email && <p className="text-xs text-slate-300">Email: {email}</p>}
            {businessHours && <p className="text-xs text-slate-400 mt-1">Hours: {businessHours}</p>}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Store Address</h4>
            {addressLine1 && (
              <p className="text-xs text-slate-300">
                {addressLine1}, {city} - {pincode}
              </p>
            )}
            <div className="pt-2">
              <Link
                href={`/store/${slug}/products`}
                className="text-xs font-bold text-amber-400 hover:underline"
              >
                Browse Catalog &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-2xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} {tradeName}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="font-bold text-amber-400">BharatStore D2C Platform</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
