'use client';

import React from 'react';
import { ProductCard, ProductCardVariant } from '../product-card';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface ProductRailSectionProps {
  config: {
    title?: string;
    limit?: number;
    cardVariant?: ProductCardVariant;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  slug: string;
  products?: any[];
}

export function ProductRailSection({ config, slug, products = [] }: ProductRailSectionProps) {
  const displayProducts = products.length ? products.slice(0, config.limit || 10) : [];
  const variant = config.cardVariant || 'compact';

  return (
    <section className="py-8 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">{config.title || 'New Drops'}</h2>

        <AnimationWrapper animation={config.animation || 'slide-up'}>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 pt-1">
            {displayProducts.map((p) => (
              <div key={p.id} className="shrink-0 w-64">
                <ProductCard slug={slug} product={p} variant={variant} />
              </div>
            ))}
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
