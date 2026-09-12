'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User, Menu, X, ChevronRight, Phone } from 'lucide-react';
import { useCart } from '../cart-context';

export interface StickyHeaderSectionProps {
  config: {
    transparent?: boolean;
    showSearch?: boolean;
    showCart?: boolean;
    showAccount?: boolean;
    navLinks?: Array<{ label: string; url: string }>;
    style?: 'classic' | 'minimal' | 'centered' | 'split' | 'searchbar' | 'bordered';
  };
  slug: string;
  storeData?: any;
}

export function StickyHeaderSection({ config, slug, storeData }: StickyHeaderSectionProps) {
  const { totalItems, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const headerStyle = config.style || 'classic';
  const brand = storeData?.tradeName || 'BharatStore';
  const links = config.navLinks?.length
    ? config.navLinks
    : [
        { label: 'Home', url: `/store/${slug}` },
        { label: 'Shop Catalog', url: `/store/${slug}/products` },
        { label: 'Categories', url: `/store/${slug}#categories` },
        { label: 'Deals & Offers', url: `/store/${slug}#deals` },
      ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/store/${slug}/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const renderSearchInput = (placeholder: string) => (
    <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
      />
    </form>
  );

  const renderActions = () => (
    <div className="flex items-center gap-1.5">
      {config.showSearch !== false && headerStyle === 'classic' && (
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          aria-label="Search Store"
          className="p-2 text-slate-700 hover:text-amber-600 rounded-full hover:bg-slate-100/80 transition"
        >
          <Search className="h-5 w-5" />
        </button>
      )}

      {config.showAccount && (
        <Link
          href={`/store/${slug}/account`}
          aria-label="Account"
          className="hidden sm:inline-flex p-2 text-slate-700 hover:text-amber-600 rounded-full hover:bg-slate-100/80 transition"
        >
          <User className="h-5 w-5" />
        </Link>
      )}

      {config.showCart !== false && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="View Shopping Cart"
          className="p-2 text-slate-800 hover:text-amber-600 rounded-full hover:bg-slate-100/80 transition relative"
        >
          <ShoppingBag className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white font-black text-3xs w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {totalItems}
            </span>
          )}
        </button>
      )}
    </div>
  );

  const renderLogo = () => (
    <Link href={`/store/${slug}`} className="flex items-center gap-2">
      <span
        className={`font-black text-lg tracking-tight text-slate-900 truncate max-w-[180px] sm:max-w-none ${
          headerStyle === 'split' ? 'text-xl' : ''
        }`}
      >
        {brand}
      </span>
      {headerStyle === 'split' && (
        <span className="hidden sm:block text-3xs font-bold uppercase tracking-widest text-amber-600 border-l border-slate-200 pl-2">
          {storeData?.city || 'Delhi'} • {storeData?.pincode || '110001'}
        </span>
      )}
    </Link>
  );

  const renderNav = () => (
    <nav
      className={`hidden md:flex items-center gap-8 ${
        headerStyle === 'bordered' ? 'gap-6' : ''
      }`}
    >
      {links.map((link, idx) => (
        <Link
          key={idx}
          href={link.url}
          className={`text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-amber-600 transition ${
            headerStyle === 'bordered' ? 'text-2xs px-3 py-1.5 rounded-full hover:bg-slate-900 hover:text-white' : ''
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );

  const mobileMenuButton = (
    <button
      onClick={() => setMobileMenuOpen(true)}
      aria-label="Open Navigation Drawer"
      className="md:hidden p-2 text-slate-800 hover:text-amber-600 rounded-lg hover:bg-slate-100/80 transition"
    >
      <Menu className="h-5 w-5" />
    </button>
  );

  const renderHeaderInner = () => {
    switch (headerStyle) {
      case 'minimal':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">{mobileMenuButton}{renderLogo()}</div>
            {renderActions()}
          </div>
        );

      case 'centered':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 md:hidden">{mobileMenuButton}</div>
              <div className="flex-1 flex justify-center md:justify-start">{renderLogo()}</div>
              {renderActions()}
            </div>
            <div className="hidden md:flex justify-center border-t border-slate-100 pt-3">{renderNav()}</div>
          </div>
        );

      case 'split':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">{mobileMenuButton}{renderLogo()}</div>
            <div className="flex items-center gap-4">
              {renderNav()}
              <div className="hidden sm:block h-6 w-px bg-slate-200" />
              {renderActions()}
            </div>
          </div>
        );

      case 'searchbar':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 md:gap-8">
            <div className="flex items-center gap-3 shrink-0">{mobileMenuButton}{renderLogo()}</div>
            <div className="hidden md:block flex-1 flex justify-center">{renderSearchInput('Search products...')}</div>
            {renderActions()}
          </div>
        );

      case 'bordered':
        return (
          <div>
            <div className="bg-slate-950 text-center py-2">
              <span className="text-3xs font-extrabold uppercase tracking-widest text-amber-400">
                {storeData?.tradeName ? `${brand} — Pan-India Shipping` : 'BharatStore — Pan-India Shipping'}
              </span>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 border-b-2 border-slate-900">
              <div className="flex items-center gap-3">{mobileMenuButton}{renderLogo()}</div>
              {renderNav()}
              {renderActions()}
            </div>
          </div>
        );

      case 'classic':
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">{mobileMenuButton}{renderLogo()}</div>
            {renderNav()}
            {renderActions()}
          </div>
        );
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all ${
          config.transparent
            ? 'bg-transparent'
            : 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs'
        }`}
      >
        {renderHeaderInner()}

        {config.showSearch !== false && searchOpen && (
          <div className="border-t border-slate-200/80 bg-slate-50/90 px-4 py-2.5 transition-all">
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-amber-600 transition"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Slide-in Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 transition-transform duration-300">
            <div>
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                <span className="font-black text-sm tracking-tight truncate">
                  {storeData?.tradeName || 'BharatStore'}
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1 rounded-md text-slate-300 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Quick Search Input inside Drawer */}
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search catalog..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  />
                </form>
              </div>

              {/* Navigation Links List */}
              <nav className="p-3 space-y-1">
                {links.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Drawer Footer Contact */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-2xs text-slate-500 space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>Need help? Contact Store</span>
              </div>
              <p className="text-3xs text-slate-400">Powered by BharatStore Commerce Engine</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
