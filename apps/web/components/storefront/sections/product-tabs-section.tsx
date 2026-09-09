'use client';

import React from 'react';
import { TabsPrimitive, TabItem } from '../primitives/tabs-primitive';
import { ProductCard, ProductCardVariant } from '../product-card';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface ProductTabsSectionProps {
  config: {
    title?: string;
    tabs?: string[];
    limit?: number;
    columns?: number;
    cardVariant?: ProductCardVariant;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  slug: string;
  products?: any[];
}

export function ProductTabsSection({ config, slug, products = [] }: ProductTabsSectionProps) {
  const tabNames = config.tabs?.length ? config.tabs : ['Bestsellers', 'New Arrivals', 'Special Deals'];
  const displayProducts = products.length ? products.slice(0, config.limit || 8) : [];
  const variant = config.cardVariant || 'classic';
  const cols = config.columns || 4;

  const colClasses: Record<number, string> = {
    2: 'grid-cols-2 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  const tabItems: TabItem[] = tabNames.map((name, idx) => ({
    id: `tab-${idx}`,
    label: name,
    content: (
      <div className={`grid ${colClasses[cols] || colClasses[4]} gap-6 pt-4`}>
        {displayProducts.map((p) => (
          <ProductCard key={p.id} slug={slug} product={p} variant={variant} />
        ))}
      </div>
    ),
  }));

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center">
          {config.title || 'Explore Collections'}
        </h2>
        <AnimationWrapper animation={config.animation || 'fade'}>
          <TabsPrimitive tabs={tabItems} />
        </AnimationWrapper>
      </div>
    </section>
  );
}
