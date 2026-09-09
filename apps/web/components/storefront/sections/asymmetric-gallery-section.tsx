'use client';

import React from 'react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface AsymmetricGallerySectionProps {
  config: {
    title?: string;
    subtitle?: string;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
}

export function AsymmetricGallerySection({ config }: AsymmetricGallerySectionProps) {
  const images = [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
  ];

  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{config.title || 'Design Gallery'}</h2>
          {config.subtitle && <p className="text-xs text-slate-500">{config.subtitle}</p>}
        </div>

        <AnimationWrapper animation={config.animation || 'fade-up'}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="aspect-3/4 rounded-3xl overflow-hidden shadow-lg bg-slate-200">
              <img src={images[0]} alt="Gallery 1" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square rounded-3xl overflow-hidden shadow-xl bg-slate-200 md:scale-105 border-4 border-white">
              <img src={images[1]} alt="Gallery 2" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-3/4 rounded-3xl overflow-hidden shadow-lg bg-slate-200">
              <img src={images[2]} alt="Gallery 3" className="w-full h-full object-cover" />
            </div>
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
