'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Tag } from 'lucide-react';

export interface SearchOverlaySectionProps {
  config: {
    placeholder?: string;
    popularSearches?: string[];
    showCategories?: boolean;
  };
  slug: string;
}

export function SearchOverlaySection({ config, slug }: SearchOverlaySectionProps) {
  const [query, setQuery] = useState('');
  const popular = config.popularSearches?.length
    ? config.popularSearches
    : ['Sarees', 'Headphones', 'Spices', 'Organic Oil', 'Kurtas', 'Wallets'];

  return (
    <section className="bg-slate-50 border-b border-slate-200 py-6 px-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) {
              window.location.href = `/store/${slug}/products?search=${encodeURIComponent(query)}`;
            }
          }}
          className="relative flex items-center"
        >
          <Search className="absolute left-4 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={config.placeholder || 'Search products, categories, SKU...'}
            className="w-full pl-12 pr-28 py-3 bg-white border border-slate-300 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-xs"
          />
          <button
            type="submit"
            className="absolute right-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            Search
          </button>
        </form>

        {popular.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-2xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="h-3 w-3" /> Popular:
            </span>
            {popular.map((term, idx) => (
              <Link
                key={idx}
                href={`/store/${slug}/products?search=${encodeURIComponent(term)}`}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-full font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900 transition shadow-2xs"
              >
                {term}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
