'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface HeroFullscreenSectionProps {
  config: {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    ctaText?: string;
    ctaLink?: string;
    overlayOpacity?: number;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  slug: string;
}

export function HeroFullscreenSection({ config, slug }: HeroFullscreenSectionProps) {
  const bgUrl = config.imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80';

  return (
    <section className="relative min-h-[75vh] sm:min-h-[85vh] flex items-center justify-center text-center px-4 overflow-hidden bg-slate-950">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url('${bgUrl}')` }}
      />
      <div
        className="absolute inset-0 bg-slate-950"
        style={{ opacity: (config.overlayOpacity ?? 50) / 100 }}
      />

      <AnimationWrapper animation={config.animation || 'fade'} className="relative z-10 max-w-4xl space-y-4 sm:space-y-6 text-white p-4 sm:p-6">
        <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          {config.title || 'Crafted to Inspire.'}
        </h1>
        <p className="text-base sm:text-xl text-slate-200 max-w-2xl mx-auto font-light leading-relaxed">
          {config.subtitle || 'Explore our latest luxury release with pan-India fulfillment.'}
        </p>
        <div className="pt-4">
          <Link
            href={config.ctaLink || `/store/${slug}/products`}
            className="inline-flex items-center gap-3 py-4 px-8 bg-white text-slate-950 font-black text-sm rounded-full hover:bg-amber-400 hover:text-slate-950 transition shadow-2xl group"
          >
            <span>{config.ctaText || 'Discover Collection'}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </AnimationWrapper>
    </section>
  );
}
