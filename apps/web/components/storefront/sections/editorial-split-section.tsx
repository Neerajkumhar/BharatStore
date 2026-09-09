'use client';

import React from 'react';
import { Quote } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface EditorialSplitSectionProps {
  config: {
    quote?: string;
    author?: string;
    story?: string;
    imageUrl?: string;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
}

export function EditorialSplitSection({ config }: EditorialSplitSectionProps) {
  const imgUrl = config.imageUrl || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80';

  return (
    <section className="py-16 bg-stone-50 border-b border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimationWrapper animation={config.animation || 'fade'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="aspect-4/5 rounded-3xl overflow-hidden shadow-xl bg-stone-200 relative">
              <img src={imgUrl} alt="Editorial Story" className="w-full h-full object-cover" />
            </div>

            {/* Story & Quote */}
            <div className="space-y-6 text-stone-900">
              <Quote className="h-10 w-10 text-amber-700/60" />
              <blockquote className="text-2xl sm:text-3xl font-serif leading-snug tracking-tight text-stone-900">
                "{config.quote || 'Craftsmanship is the bridge between heritage and modern living.'}"
              </blockquote>
              <p className="text-xs uppercase tracking-widest font-mono text-amber-800 font-bold">
                — {config.author || 'Our Founder & Master Craftsman'}
              </p>
              <p className="text-sm font-sans text-stone-600 leading-relaxed max-w-md pt-2">
                {config.story || 'Every thread and ingredient in our store is chosen with reverence for tradition and uncompromising quality.'}
              </p>
            </div>
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
