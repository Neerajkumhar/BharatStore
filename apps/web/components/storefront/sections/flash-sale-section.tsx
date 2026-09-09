'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import { ProductCard, ProductCardVariant } from '../product-card';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface FlashSaleSectionProps {
  config: {
    title?: string;
    subtitle?: string;
    limit?: number;
    cardVariant?: ProductCardVariant;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  slug: string;
  products?: any[];
}

export function FlashSaleSection({ config, slug, products = [] }: FlashSaleSectionProps) {
  const displayProducts = products.length ? products.slice(0, config.limit || 4) : [];
  const variant = config.cardVariant || 'deal';

  return (
    <section className="py-10 bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 text-white border-b border-red-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <Zap className="h-6 w-6 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight">{config.title || 'Flash Deals — Up to 60% Off'}</h2>
              <p className="text-xs text-red-100 font-medium">{config.subtitle || 'Limited quantities available. Orders dispatched in 24 hours.'}</p>
            </div>
          </div>
        </div>

        <AnimationWrapper animation={config.animation || 'fade-up'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((p) => (
              <ProductCard key={p.id} slug={slug} product={p} variant={variant} />
            ))}
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
