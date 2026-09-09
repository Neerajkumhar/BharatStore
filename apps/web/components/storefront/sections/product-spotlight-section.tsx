'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Check, Star, ShieldCheck } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface ProductSpotlightSectionProps {
  config: {
    title?: string;
    subtitle?: string;
    price?: string;
    mrp?: string;
    features?: string[];
    imageUrl?: string;
    ctaText?: string;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  slug: string;
}

export function ProductSpotlightSection({ config, slug }: ProductSpotlightSectionProps) {
  const imgUrl = config.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80';
  const features = config.features?.length
    ? config.features
    : ['100% Authentic Quality', '24-Hour Dispatch Guarantee', 'GST Compliant Invoice Included'];

  return (
    <section className="py-12 bg-amber-500/10 border-y border-amber-200/60 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimationWrapper animation={config.animation || 'scale'}>
          <div className="bg-white rounded-3xl border border-amber-200 p-6 md:p-10 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 relative">
              <img src={imgUrl} alt={config.subtitle || 'Spotlight'} className="w-full h-full object-cover" />
              <span className="absolute top-3 left-3 bg-slate-900 text-amber-400 text-3xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
                {config.title || 'Spotlight Item'}
              </span>
            </div>

            {/* Content */}
            <div className="space-y-5">
              <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                {config.subtitle || 'Pure Cold-Pressed Virgin Coconut Oil'}
              </h3>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-amber-600">
                  ₹{Number(config.price || 349).toLocaleString('en-IN')}
                </span>
                {config.mrp && (
                  <span className="text-base text-slate-400 line-through">
                    ₹{Number(config.mrp).toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <ul className="space-y-2 text-xs font-semibold text-slate-700">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <Link
                  href={`/store/${slug}/products`}
                  className="inline-flex items-center gap-2 py-3.5 px-7 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition shadow-md"
                >
                  <ShoppingBag className="h-4 w-4 text-amber-400" />
                  <span>{config.ctaText || 'Add to Cart'}</span>
                </Link>
              </div>
            </div>
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
