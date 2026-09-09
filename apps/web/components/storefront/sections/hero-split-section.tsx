'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface HeroSplitSectionProps {
  config: {
    badge?: string;
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    ctaText?: string;
    ctaLink?: string;
    layout?: 'left-image' | 'right-image';
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  slug: string;
}

export function HeroSplitSection({ config, slug }: HeroSplitSectionProps) {
  const isRight = config.layout === 'right-image';
  const imgUrl = config.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  return (
    <section className="py-12 md:py-20 bg-slate-50 border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimationWrapper animation={config.animation || 'slide-up'}>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${isRight ? 'md:flex-row-reverse' : ''}`}>
            {/* Image Column */}
            <div className={`relative aspect-4/3 md:aspect-square rounded-3xl overflow-hidden shadow-xl bg-slate-200 ${isRight ? 'md:order-2' : 'md:order-1'}`}>
              <img src={imgUrl} alt={config.title || 'Hero'} className="w-full h-full object-cover" />
            </div>

            {/* Content Column */}
            <div className={`space-y-6 ${isRight ? 'md:order-1' : 'md:order-2'}`}>
              {config.badge && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-2xs font-black uppercase tracking-widest">
                  <Sparkles className="h-3 w-3 text-amber-600" />
                  <span>{config.badge}</span>
                </span>
              )}
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
                {config.title || 'Modern Design for Daily Life'}
              </h2>
              <p className="text-base text-slate-600 leading-relaxed font-medium">
                {config.subtitle || 'Thoughtful materials, clean lines and long-lasting durability for modern homes.'}
              </p>
              <div>
                <Link
                  href={config.ctaLink || `/store/${slug}/products`}
                  className="inline-flex items-center gap-2 py-3.5 px-7 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-amber-500 hover:text-slate-950 transition shadow-md"
                >
                  <span>{config.ctaText || 'Explore Now'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
