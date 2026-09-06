'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Search, ShoppingBag, Phone, MapPin } from 'lucide-react';
import { useCart } from './cart-context';

interface StoreHeaderProps {
  slug: string;
  tradeName: string;
  logoUrl?: string;
  phone?: string;
  city?: string;
}

export function StoreHeader({ slug, tradeName, logoUrl, phone, city }: StoreHeaderProps) {
  const router = useRouter();
  const { totalItems, setIsOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/store/${slug}/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-slate-300 text-2xs py-1.5 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-amber-400">● Direct Store Commerce</span>
          {city && (
            <span className="hidden sm:inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>Ships from {city}</span>
            </span>
          )}
        </div>
        {phone && (
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3 text-slate-400" />
            <span>Support: {phone}</span>
          </div>
        )}
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo / Name */}
        <Link href={`/store/${slug}`} className="flex items-center gap-3 group shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={tradeName} className="h-9 w-auto object-contain rounded" />
          ) : (
            <div className="h-10 w-10 bg-slate-900 text-amber-400 font-extrabold flex items-center justify-center rounded-xl text-lg shadow-sm group-hover:bg-slate-800 transition">
              {tradeName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <span className="text-base font-extrabold text-slate-900 tracking-tight block leading-tight group-hover:text-amber-600 transition">
              {tradeName}
            </span>
            <span className="text-2xs font-semibold text-slate-500 block">Verified Store</span>
          </div>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:flex items-center relative">
          <input
            type="text"
            placeholder="Search products or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 pointer-events-none" />
        </form>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <Link
            href={`/store/${slug}/products`}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 hidden sm:block px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            All Products
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow-xs flex items-center gap-2"
          >
            <ShoppingBag className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="px-2 py-0.5 text-2xs font-bold bg-amber-500 text-slate-950 rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
