'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, ArrowRight } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface LookbookSectionProps {
  config: {
    title?: string;
    subtitle?: string;
    columns?: number;
    looks?: Array<{ title: string; image: string; tag: string }>;
    items?: Array<{ title: string; image: string; tag: string }>;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  slug: string;
}

export function LookbookSection({ config, slug }: LookbookSectionProps) {
  const defaultLooks = [
    { title: 'Look 01 — Royal Ivory Saree', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', tag: 'Festive Edit' },
    { title: 'Look 02 — Midnight Linen Kurta', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80', tag: 'Evening Wear' },
    { title: 'Look 03 — Handloom Silk Stole', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80', tag: 'Accessories' },
  ];

  const looks = (config.looks && config.looks.length > 0)
    ? config.looks
    : (config.items && config.items.length > 0 && typeof config.items[0] === 'object')
    ? (config.items as Array<{ title: string; image: string; tag: string }>)
    : defaultLooks;

  const cols = Number(config.columns) || 3;
  const gridColsClass = cols === 2 ? 'grid-cols-2' : cols === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3';

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-3xs font-extrabold uppercase tracking-widest text-amber-600 flex items-center justify-center gap-1.5">
            <Camera className="h-3.5 w-3.5" /> Style Inspo
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif text-slate-900 tracking-tight">
            {config.title || 'Season Lookbook'}
          </h2>
          {config.subtitle && <p className="text-xs text-slate-500">{config.subtitle}</p>}
        </div>

        <AnimationWrapper animation={config.animation || 'fade-up'}>
          <div className={`grid ${gridColsClass} gap-3 sm:gap-6`}>
            {looks.map((look, idx) => (
              <div key={idx} className="group relative aspect-3/4 rounded-2xl overflow-hidden bg-slate-100 shadow-md">
                <img src={look.image} alt={look.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-5 flex flex-col justify-end text-white">
                  <span className="text-3xs font-mono uppercase tracking-widest text-amber-400 font-bold">{look.tag}</span>
                  <h4 className="text-sm font-bold mt-1 group-hover:text-amber-300 transition">{look.title}</h4>
                  <Link
                    href={`/store/${slug}/products`}
                    className="inline-flex items-center gap-1 text-2xs font-extrabold text-white hover:text-amber-400 mt-2"
                  >
                    <span>Shop Look</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}

