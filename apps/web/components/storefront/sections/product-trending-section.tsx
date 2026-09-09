'use client';

import React from 'react';
import { ProductCard, ProductCardVariant } from '../product-card';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface ProductTrendingSectionProps {
  config: {
    title?: string;
    subtitle?: string;
    limit?: number;
    columns?: number;
    cardVariant?: ProductCardVariant;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  slug: string;
  products?: any[];
}

export function ProductTrendingSection({ config, slug, products = [] }: ProductTrendingSectionProps) {
  const displayProducts = products.length ? products.slice(0, config.limit || 6) : [];
  const variant = config.cardVariant || 'deal';
  const cols = config.columns || 3;
  const colClasses: Record<number, string> = {
    2: 'grid-cols-2 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{config.title || 'Trending Now'}</h2>
          {config.subtitle && <p className="text-xs text-slate-500 font-medium">{config.subtitle}</p>}
        </div>

        <AnimationWrapper animation={config.animation || 'fade-up'}>
          <div className={`grid ${colClasses[cols] || colClasses[3]} gap-6`}>
            {displayProducts.map((p) => (
              <ProductCard key={p.id} slug={slug} product={p} variant={variant} />
            ))}
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
