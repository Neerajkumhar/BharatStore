'use client';

import React from 'react';
import Link from 'next/link';
import { HeartHandshake, ArrowRight } from 'lucide-react';
import { AnimationWrapper, type AnimationType } from '../primitives/animation-wrapper';

export interface ShopByConcernSectionProps {
  config: {
    title?: string;
    subtitle?: string | null;
    concerns?: string[];
    animation?: AnimationType;
  };
  slug: string;
}

const iconTones = [
  'bg-rose-50 text-rose-600',
  'bg-amber-50 text-amber-600',
  'bg-sky-50 text-sky-600',
  'bg-violet-50 text-violet-600',
  'bg-emerald-50 text-emerald-600',
  'bg-orange-50 text-orange-600',
];

export function ShopByConcernSection({ config, slug }: ShopByConcernSectionProps) {
  const concerns = config.concerns?.length
    ? config.concerns
    : ['Acne & Breakouts', 'Dullness', 'Dryness', 'Fine Lines', 'Sun Damage', 'Hairfall'];

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1.5">
          <span className="inline-flex items-center gap-1.5 text-2xs font-extrabold uppercase tracking-widest text-amber-600">
            <HeartHandshake className="h-3.5 w-3.5" />
            Solution-Led Shopping
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {config.title || 'Shop by Concern'}
          </h2>
          {config.subtitle && (
            <p className="text-xs text-slate-500 font-medium">{config.subtitle}</p>
          )}
        </div>

        <AnimationWrapper animation={config.animation || 'none'}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {concerns.slice(0, 6).map((concern, idx) => (
              <Link
                key={idx}
                href={`/store/${slug}/products`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 text-center hover:shadow-md hover:border-slate-300 transition-all"
              >
                <span className={`p-3 rounded-full ${iconTones[idx % iconTones.length]}`}>
                  <HeartHandshake className="h-5 w-5" />
                </span>
                <span className="text-xs font-bold text-slate-900 leading-snug">{concern}</span>
                <span className="inline-flex items-center gap-1 text-3xs font-black uppercase tracking-widest text-amber-600 opacity-0 group-hover:opacity-100 transition">
                  Solve it <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}