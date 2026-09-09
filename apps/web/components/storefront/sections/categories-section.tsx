'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, LayoutGrid, Rows3 } from 'lucide-react';

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
    layout?: 'grid' | 'carousel' | 'stacked' | 'bento';
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
  const layout = config.layout || 'grid';
  const visible = categories.slice(0, config.limit || 6);

  const iconBox = (large = false) =>
    `p-${large ? 4 : 3} rounded-xl transition group-hover:text-white` as string;

  const categoryCard = (cat: Category, compact = false) => (
    <Link
      key={cat.id}
      href={`/store/${slug}/products?categoryId=${cat.id}`}
      className={`bg-white border border-slate-200 rounded-xl text-center hover:shadow-md transition-all group flex flex-col items-center ${
        compact ? 'p-3 space-y-1.5' : 'p-4 space-y-2'
      }`}
      style={{ ['--hover-color' as string]: accent }}
    >
      <div className={`${iconBox()} ${compact ? '' : ''}`} style={{ backgroundColor: `${accent}15`, color: accent }}>
        <Layers className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
      </div>
      <h3 className="text-xs font-bold text-slate-900 truncate w-full">{cat.name}</h3>
      {config.showProductCount && cat._count && (
        <span className="text-2xs text-slate-400 font-medium">{cat._count.products} Products</span>
      )}
    </Link>
  );

  const renderBody = () => {
    if (categories.length === 0) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
          <Layers className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-medium">No categories available yet.</p>
        </div>
      );
    }

    switch (layout) {
      case 'carousel':
        return (
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visible.map((cat) => (
              <div key={cat.id} className="snap-start shrink-0 basis-1/2 sm:basis-1/3 md:basis-1/5 lg:basis-[calc(100%/6)] min-w-[130px]">
                {categoryCard(cat)}
              </div>
            ))}
          </div>
        );

      case 'stacked':
        return (
          <div className="flex flex-col gap-2.5">
            {visible.slice(0, 6).map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/store/${slug}/products?categoryId=${cat.id}`}
                className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 hover:shadow-md hover:border-slate-300 transition group"
              >
                <span className="text-2xs font-mono font-black text-slate-300 w-6">{String(idx + 1).padStart(2, '0')}</span>
                <div className={`p-2.5 rounded-lg transition group-hover:text-white`} style={{ backgroundColor: `${accent}15`, color: accent }}>
                  <Rows3 className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{cat.name}</h3>
                  {config.showProductCount && cat._count && (
                    <span className="text-2xs text-slate-400 font-medium">{cat._count.products} Products</span>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition" />
              </Link>
            ))}
          </div>
        );

      case 'bento': {
        const [hero, ...rest] = visible;
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {hero && (
              <Link
                key={hero.id}
                href={`/store/${slug}/products?categoryId=${hero.id}`}
                className="md:row-span-2 bg-slate-900 rounded-xl p-5 flex flex-col justify-end text-white hover:shadow-lg transition group"
              >
                <div className="p-3 rounded-xl w-fit mb-3 bg-amber-500/20 text-amber-400">
                  <LayoutGrid className="h-6 w-6" />
                </div>
                <h3 className="text-base font-extrabold">{hero.name}</h3>
                {config.showProductCount && hero._count && (
                  <span className="text-2xs text-slate-400 font-medium mt-1">{hero._count.products} Products</span>
                )}
                <span className="inline-flex items-center gap-1 text-3xs font-bold text-amber-400 uppercase tracking-widest mt-3 group-hover:gap-2 transition-all">
                  Explore <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            )}
            {rest.slice(0, 5).map((cat) => categoryCard(cat, true))}
          </div>
        );
      }

      case 'grid':
      default:
        return (
          <div className={`grid ${colMap[cols] || colMap[6]} gap-3`}>
            {visible.map((cat) => categoryCard(cat))}
          </div>
        );
    }
  };

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

      {renderBody()}
    </section>
  );
}