'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ArrowRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

interface CategoriesSectionProps {
  config: {
    title?: string;
    subtitle?: string;
    layout?: 'grid' | 'carousel';
    columns?: number;
    showProductCount?: boolean;
    limit?: number;
  };
  slug: string;
  categories?: Category[];
  theme?: { accentColor?: string };
}

const colMap: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

export function CategoriesSection({ config, slug, categories = [], theme }: CategoriesSectionProps) {
  const accent = theme?.accentColor || '#d97706';
  const cols = config.columns || 6;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{config.title || 'Shop by Category'}</h2>
          {config.subtitle && <p className="text-xs text-slate-500 mt-0.5">{config.subtitle}</p>}
        </div>
        <Link href={`/store/${slug}/products`} className="text-xs font-bold hover:underline flex items-center gap-1" style={{ color: accent }}>
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {categories.length > 0 ? (
        <div className={`grid ${colMap[cols] || colMap[6]} gap-3`}>
          {categories.slice(0, config.limit || 6).map((cat) => (
            <Link
              key={cat.id}
              href={`/store/${slug}/products?categoryId=${cat.id}`}
              className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:shadow-md transition-all group flex flex-col items-center space-y-2"
              style={{ ['--hover-color' as string]: accent }}
            >
              <div className="p-3 rounded-xl transition group-hover:text-white" style={{ backgroundColor: `${accent}15`, color: accent }}>
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 truncate w-full">{cat.name}</h3>
              {config.showProductCount && cat._count && (
                <span className="text-2xs text-slate-400 font-medium">{cat._count.products} Products</span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
          <Layers className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-medium">No categories available yet.</p>
        </div>
      )}
    </section>
  );
}
