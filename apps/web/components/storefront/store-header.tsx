'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Search, ShoppingBag, Phone, MapPin, Menu } from 'lucide-react';
import { useCart } from './cart-context';

interface StoreHeaderProps {
  slug: string;
  tradeName: string;
  logoUrl?: string;
  phone?: string;
  city?: string;
  pages?: Array<{ label: string; slug: string }>;
}

export function StoreHeader({ slug, tradeName, logoUrl, phone, city, pages }: StoreHeaderProps) {
  const router = useRouter();
  const { totalItems, setIsOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const pageLinks = (pages || []).map((p) => ({ label: p.label, slug: p.slug }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/store/${slug}/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-slate-300 text-2xs py-1.5 px-3 sm:px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 truncate">
          <span className="font-semibold text-amber-400 shrink-0">● Direct Store Commerce</span>
          {city && (
            <span className="hidden sm:inline-flex items-center gap-1 shrink-0">
              <MapPin className="h-3 w-3" />
              <span>Ships from {city}</span>
            </span>
          )}
        </div>
        {phone && (
          <div className="flex items-center gap-1 shrink-0">
            <Phone className="h-3 w-3 text-slate-400" />
            <span className="hidden xs:inline">Support: </span>
            <span>{phone}</span>
          </div>
        )}
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo / Name */}
        <Link href={`/store/${slug}`} className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0">
          {logoUrl ? (
            <img src={logoUrl} alt={tradeName} className="h-8 sm:h-9 w-auto object-contain rounded shrink-0" />
          ) : (
            <div className="h-9 w-9 sm:h-10 sm:w-10 bg-slate-900 text-amber-400 font-extrabold flex items-center justify-center rounded-xl text-base sm:text-lg shadow-sm group-hover:bg-slate-800 transition shrink-0">
              {tradeName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block leading-tight group-hover:text-amber-600 transition truncate max-w-[130px] xs:max-w-[180px] sm:max-w-[240px] md:max-w-none">
              {tradeName}
            </span>
            <span className="text-2xs font-semibold text-slate-500 block truncate">Verified Store</span>
          </div>
        </Link>

        {/* Search Bar (Desktop) */}
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

        {/* Store Pages (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 shrink-0" aria-label="Store pages">
          {pageLinks.map((p) => (
            <Link
              key={p.slug}
              href={`/store/${slug}/${p.slug}`}
              className="text-xs font-bold text-slate-700 hover:text-amber-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition whitespace-nowrap"
            >
              {p.label}
            </Link>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile Nav Toggle */}
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg md:hidden transition"
            title="Store Pages"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Mobile Search Icon Toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg md:hidden transition"
            title="Search Products"
          >
            <Search className="h-4 w-4" />
          </button>

          <Link
            href={`/store/${slug}/products`}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 hidden sm:block px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            All Products
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 sm:p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow-xs flex items-center gap-1.5 sm:gap-2"
          >
            <ShoppingBag className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold hidden sm:inline">Cart</span>
            {totalItems > 0 && (
<span className="px-1.5 sm:px-2 py-0.5 text-2xs font-bold bg-amber-500 text-slate-950 rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden px-3 py-2 border-t border-slate-100 bg-slate-50 animate-in slide-in-from-top-1 duration-150">
          <form onSubmit={handleSearch} className="flex items-center relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <Search className="h-4 w-4 text-slate-400 absolute left-3 pointer-events-none" />
          </form>
        </div>
      )}
    {/* Expandable Mobile Nav Panel */}
      {showMobileNav && (
        <nav className="md:hidden px-3 py-2 border-t border-slate-100 bg-slate-50 space-y-1" aria-label="Store pages">
          <Link
            href={`/store/${slug}/products`}
            onClick={() => setShowMobileNav(false)}
            className="block text-xs font-bold text-slate-700 hover:text-amber-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            All Products
          </Link>
          {pageLinks.map((p) => (
            <Link
              key={p.slug}
              href={`/store/${slug}/${p.slug}`}
              onClick={() => setShowMobileNav(false)}
              className="block text-xs font-bold text-slate-700 hover:text-amber-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              {p.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
