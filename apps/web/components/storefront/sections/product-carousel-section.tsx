'use client';

import React, { useEffect, useState } from 'react';
import { CarouselPrimitive } from '../primitives/carousel-primitive';
import { ProductCard, ProductCardVariant } from '../product-card';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface ProductCarouselSectionProps {
  config: {
    title?: string;
    subtitle?: string;
    limit?: number;
    autoplay?: boolean;
    showArrows?: boolean;
    cardVariant?: ProductCardVariant;
    layout?: 'row' | 'fade' | 'ticker';
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  slug: string;
  products?: any[];
}

export function ProductCarouselSection({ config, slug, products = [] }: ProductCarouselSectionProps) {
  const displayProducts = products.length ? products.slice(0, config.limit || 8) : [];
  const cardVariant = config.cardVariant || 'classic';
  const layout = config.layout || 'row';
  const [fadeIndex, setFadeIndex] = useState(0);

  useEffect(() => {
    if (layout !== 'fade' || config.autoplay === false || displayProducts.length < 2) return;
    const timer = setInterval(() => {
      setFadeIndex((i) => (i + 1) % displayProducts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [layout, config.autoplay, displayProducts.length]);

  const header = (
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{config.title || 'Bestseller Rail'}</h2>
        {config.subtitle && <p className="text-xs text-slate-500 font-medium mt-1">{config.subtitle}</p>}
      </div>
    </div>
  );

  const renderBody = () => {
    if (displayProducts.length === 0) {
      return (
        <div className="p-8 text-center bg-slate-50 rounded-2xl text-xs text-slate-500 font-medium">
          No products found for this section. Add products to catalog.
        </div>
      );
    }

    switch (layout) {
      case 'fade':
        return (
          <div className="relative aspect-[21/6] overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
            {displayProducts.slice(0, 5).map((product, idx) => (
              <div
                key={product.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  idx === fadeIndex % 5 ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <ProductCard slug={slug} product={product} variant={cardVariant} />
              </div>
            ))}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {displayProducts.slice(0, 5).map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setFadeIndex(idx)}
                  aria-label={`Show ${p.title}`}
                  className={`h-1.5 rounded-full transition-all ${idx === fadeIndex % 5 ? 'w-5 bg-slate-900' : 'w-1.5 bg-slate-300'}`}
                />
              ))}
            </div>
          </div>
        );

      case 'ticker':
        return (
          <div className="relative overflow-hidden">
            <style>{`
              @keyframes bharatstore-ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            `}</style>
            <div
              className="flex gap-4 w-max"
              style={{ animation: 'bharatstore-ticker 22s linear infinite' }}
            >
              {[...displayProducts, ...displayProducts].map((product, idx) => (
                <div key={`${product.id}-${idx}`} className="w-52 shrink-0">
                  <ProductCard slug={slug} product={product} variant="compact" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'row':
      default:
        return (
          <CarouselPrimitive
            autoplay={config.autoplay !== false}
            showArrows={config.showArrows !== false}
            itemsPerPage={{ desktop: 4, tablet: 2, mobile: 1 }}
          >
            {displayProducts.map((product) => (
              <ProductCard key={product.id} slug={slug} product={product} variant={cardVariant} />
            ))}
          </CarouselPrimitive>
        );
    }
  };

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {header}

        <AnimationWrapper animation={config.animation || 'fade-up'}>
          {renderBody()}
        </AnimationWrapper>
      </div>
    </section>
  );
}