'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface HeroEditorialSectionProps {
  config: {
    seasonTag?: string;
    headline?: string;
    subheadline?: string;
    imageUrl?: string;
    ctaText?: string;
    ctaLink?: string;
    accentText?: string;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  slug: string;
}

export function HeroEditorialSection({ config, slug }: HeroEditorialSectionProps) {
  const imgUrl = config.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80';

  return (
    <section className="py-16 md:py-24 bg-stone-100 text-stone-900 overflow-hidden border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <AnimationWrapper animation={config.animation || 'fade-up'}>
          <div className="space-y-3">
            <span className="text-3xs uppercase tracking-[0.3em] text-amber-800 font-extrabold block">
              {config.seasonTag || 'Autumn / Winter 2026'}
            </span>
            <h1 className="text-4xl sm:text-7xl font-serif tracking-tight text-stone-900 leading-tight max-w-4xl mx-auto">
              {config.headline || 'The Heritage Edit'}
            </h1>
            <p className="text-sm sm:text-base font-sans text-stone-600 max-w-xl mx-auto italic">
              {config.subheadline || 'Handwoven textiles & modern Indian craftsmanship, thoughtfully assembled.'}
            </p>
          </div>

          <div className="mt-6 sm:mt-8 relative aspect-4/5 sm:aspect-16/9 md:aspect-21/9 max-w-5xl mx-auto rounded-none overflow-hidden shadow-2xl bg-stone-200">
            <img src={imgUrl} alt={config.headline || 'Editorial'} className="w-full h-full object-cover" />
            {config.accentText && (
              <div className="absolute bottom-4 right-4 bg-stone-900/90 text-stone-100 text-3xs font-mono px-3 py-1.5 uppercase tracking-widest">
                {config.accentText}
              </div>
            )}
          </div>

          <div className="pt-8">
            <Link
              href={config.ctaLink || `/store/${slug}/products`}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-stone-900 text-stone-100 text-xs uppercase tracking-widest font-bold hover:bg-amber-800 transition"
            >
              <span>{config.ctaText || 'View Lookbook'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
