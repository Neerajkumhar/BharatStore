'use client';

import React from 'react';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface CategoryCircularSectionProps {
  config: {
    title?: string;
    limit?: number;
    showLabels?: boolean;
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

export function CategoryCircularSection({ config, slug, categories = [] }: CategoryCircularSectionProps) {
  const display = categories.length
    ? categories.slice(0, config.limit || 8)
    : [
        { id: '1', name: 'Sarees', slug: 'sarees' },
        { id: '2', name: 'Kurtas', slug: 'kurtas' },
        { id: '3', name: 'Dupattas', slug: 'dupattas' },
        { id: '4', name: 'Jewelry', slug: 'jewelry' },
        { id: '5', name: 'Footwear', slug: 'footwear' },
        { id: '6', name: 'Handbags', slug: 'handbags' },
      ];

  return (
    <section className="py-8 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {config.title && (
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4 text-center">
            {config.title}
          </h3>
        )}

        <AnimationWrapper animation={config.animation || 'slide-up'}>
          <div className="flex items-center justify-start sm:justify-center gap-4 overflow-x-auto no-scrollbar pb-2">
            {display.map((cat, idx) => (
              <Link
                key={cat.id || idx}
                href={`/store/${slug}/products?category=${cat.id}`}
                className="flex flex-col items-center gap-2 group shrink-0 w-20 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 group-hover:border-amber-500 overflow-hidden flex items-center justify-center transition-all duration-300 shadow-2xs group-hover:scale-105">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <Layers className="h-6 w-6 text-slate-400 group-hover:text-amber-600 transition" />
                  )}
                </div>
                {config.showLabels !== false && (
                  <span className="text-3xs font-extrabold text-slate-800 truncate max-w-full group-hover:text-amber-600 transition">
                    {cat.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
