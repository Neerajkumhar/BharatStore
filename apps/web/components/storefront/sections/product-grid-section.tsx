'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { ProductCard } from '@/components/storefront/product-card';

interface Product {
  id: string;
  title: string;
  slug: string;
  sellingPrice: number;
  mrp: number;
  images: string[];
  categoryName: string;
  variants: Array<{
    id: string;
    sku: string;
    variantName: string;
    priceOverride: number | null;
    currentStock: number;
  }>;
}

interface ProductGridSectionProps {
  config: {
    title?: string;
    columns?: number;
    showFilters?: boolean;
    showSort?: boolean;
  };
  slug: string;
  products?: Product[];
  theme?: { accentColor?: string };
}

const colMap: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export function ProductGridSection({ config, slug, products = [], theme }: ProductGridSectionProps) {
  const accent = theme?.accentColor || '#d97706';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{config.title || 'All Products'}</h2>
        <Link href={`/store/${slug}/products`} className="text-xs font-bold hover:underline flex items-center gap-1" style={{ color: accent }}>
          <span>Full Catalog</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {products.length > 0 ? (
        <div className={`grid ${colMap[config.columns || 3]} gap-6`}>
          {products.map((product) => (
            <ProductCard key={product.id} slug={slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 space-y-2">
          <ShoppingBag className="h-10 w-10 mx-auto text-slate-300" />
          <p className="text-sm font-medium">No products available yet.</p>
        </div>
      )}
    </section>
  );
}
