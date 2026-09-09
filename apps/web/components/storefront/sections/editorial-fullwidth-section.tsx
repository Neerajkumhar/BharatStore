'use client';

import React from 'react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface EditorialFullwidthSectionProps {
  config: {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
}

export function EditorialFullwidthSection({ config }: EditorialFullwidthSectionProps) {
  const imgUrl = config.imageUrl || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80';

  return (
    <section className="relative min-h-[50vh] flex items-center justify-center text-center px-4 overflow-hidden bg-stone-900 border-b border-stone-800">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: `url('${imgUrl}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

      <AnimationWrapper animation={config.animation || 'fade-up'} className="relative z-10 max-w-3xl space-y-4 text-white p-6">
        <h2 className="text-3xl sm:text-5xl font-serif tracking-tight leading-tight">
          {config.title || 'Purity in Every Batch'}
        </h2>
        <p className="text-sm sm:text-base text-stone-200 font-light max-w-xl mx-auto italic">
          {config.subtitle || 'From local Bharatiya farms straight to your home kitchen without chemical intervention.'}
        </p>
      </AnimationWrapper>
    </section>
  );
}
