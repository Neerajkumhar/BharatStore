'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface HeroMinimalSectionProps {
  config: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    alignment?: 'left' | 'center' | 'right';
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  slug: string;
}

export function HeroMinimalSection({ config, slug }: HeroMinimalSectionProps) {
  const align = config.alignment || 'center';
  const alignClasses =
    align === 'left' ? 'text-left items-start' : align === 'right' ? 'text-right items-end' : 'text-center items-center';

  return (
    <section className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimationWrapper animation={config.animation || 'fade'}>
          <div className={`flex flex-col ${alignClasses} space-y-6`}>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              {config.title || 'Clean. Essential. Honest.'}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
              {config.subtitle || 'Pure organic produce and daily essential staples delivered fresh to your door.'}
            </p>
            <div className="pt-2">
              <Link
                href={config.ctaLink || `/store/${slug}/products`}
                className="inline-flex items-center gap-2 py-3 px-6 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
              >
                <span>{config.ctaText || 'Shop Essentials'}</span>
                <ArrowRight className="h-4 w-4 text-amber-400" />
              </Link>
            </div>
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
