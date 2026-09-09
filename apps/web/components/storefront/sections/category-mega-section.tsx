'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ArrowRight } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface CategoryMegaSectionProps {
  config: {
    title?: string;
    subtitle?: string;
    columns?: number;
    limit?: number;
    cardStyle?: 'standard' | 'editorial';
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  slug: string;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
    image?: string | null;
    _count?: { products: number };
  }>;
}

export function CategoryMegaSection({ config, slug, categories = [] }: CategoryMegaSectionProps) {
  const display = categories.length
    ? categories.slice(0, config.limit || 6)
    : [
        { id: '1', name: 'Living Room', slug: 'living-room' },
        { id: '2', name: 'Bedroom Essentials', slug: 'bedroom' },
        { id: '3', name: 'Kitchen & Dining', slug: 'kitchen' },
        { id: '4', name: 'Balcony & Garden', slug: 'balcony' },
        { id: '5', name: 'Lighting & Decor', slug: 'lighting' },
        { id: '6', name: 'Home Office', slug: 'office' },
      ];

  const cols = config.columns || 3;
  const colClasses: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {config.title || 'Shop by Room'}
          </h2>
          {config.subtitle && <p className="text-xs sm:text-sm text-slate-600 font-medium">{config.subtitle}</p>}
        </div>

        <AnimationWrapper animation={config.animation || 'fade-up'}>
          <div className={`grid ${colClasses[cols] || colClasses[3]} gap-6`}>
            {display.map((cat, idx) => (
              <Link
                key={cat.id || idx}
                href={`/store/${slug}/products?category=${cat.id}`}
                className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 shadow-md block"
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-75"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                    <Layers className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-5 flex flex-col justify-end text-white">
                  <h3 className="text-lg font-bold group-hover:text-amber-400 transition">{cat.name}</h3>
                  <div className="flex items-center justify-between mt-1 text-2xs text-slate-300">
                    <span>{cat._count?.products || 0} items</span>
                    <ArrowRight className="h-4 w-4 text-amber-400 transform group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
