'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Star, Zap, CheckCircle2 } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface HeroProductSectionProps {
  config: {
    badge?: string;
    title?: string;
    subtitle?: string;
    price?: string;
    comparePrice?: string;
    imageUrl?: string;
    ctaText?: string;
    ctaLink?: string;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  slug: string;
}

export function HeroProductSection({ config, slug }: HeroProductSectionProps) {
  const imgUrl = config.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-slate-900 to-slate-950 text-white border-b border-slate-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimationWrapper animation={config.animation || 'scale'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Visual Column */}
            <div className="relative aspect-square max-w-md mx-auto rounded-3xl overflow-hidden bg-slate-800 border border-slate-700 p-6 flex items-center justify-center shadow-2xl">
              <img src={imgUrl} alt={config.title || 'Product'} className="w-full h-full object-contain" />
              {config.badge && (
                <span className="absolute top-4 left-4 bg-amber-500 text-white font-black text-3xs uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                  {config.badge}
                </span>
              )}
            </div>

            {/* Details Column */}
            <div className="space-y-6 text-left">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <div className="flex">
                  {'★'.repeat(5)}
                </div>
                <span>4.9 / 5 Rating (1,200+ Reviews)</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                {config.title || 'Pro Wireless Headphones'}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
                {config.subtitle || 'Active Noise Cancellation • 40-Hour Battery Life • Spatial Audio'}
              </p>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-amber-400">
                  ₹{Number(config.price || 4999).toLocaleString('en-IN')}
                </span>
                {config.comparePrice && (
                  <span className="text-base text-slate-500 line-through">
                    ₹{Number(config.comparePrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <ul className="space-y-2 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Free Pan-India Delivery within 48 Hours</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> 1-Year Brand Replacement Warranty</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> B2B/B2C GST Tax Invoice Provided</li>
              </ul>

              <div className="pt-2">
                <Link
                  href={config.ctaLink || `/store/${slug}/products`}
                  className="inline-flex items-center justify-center gap-2 py-4 px-8 bg-amber-500 text-white font-black text-sm rounded-xl hover:bg-amber-600 transition shadow-xl w-full sm:w-auto"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{config.ctaText || 'Buy Now'}</span>
                </Link>
              </div>
            </div>
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
