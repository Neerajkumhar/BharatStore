'use client';

import React from 'react';
import { Leaf } from 'lucide-react';
import { AnimationWrapper, type AnimationType } from '../primitives/animation-wrapper';

export interface IngredientHighlightsSectionProps {
  config: {
    title?: string;
    subtitle?: string | null;
    ingredients?: Array<{
      name: string;
      benefit: string;
      tag?: string | null;
    }>;
    animation?: AnimationType;
  };
}

export function IngredientHighlightsSection({ config }: IngredientHighlightsSectionProps) {
  const ingredients = config.ingredients?.length
    ? config.ingredients
    : [
        { name: 'Cold-Pressed Virgin Oils', benefit: 'Extracted without heat for maximum nutrition', tag: '100% Pure' },
        { name: 'Single-Origin Spices', benefit: 'Grown without chemical pesticides', tag: 'Organic' },
        { name: 'Traditional Grains', benefit: 'Naturally polished, never bleached', tag: 'House Special' },
      ];

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1.5">
          <span className="inline-flex items-center gap-1.5 text-2xs font-extrabold uppercase tracking-widest text-emerald-600">
            <Leaf className="h-3.5 w-3.5" />
            Clean Label Promise
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {config.title || 'Key Ingredients'}
          </h2>
          {config.subtitle && (
            <p className="text-xs text-slate-500 font-medium">{config.subtitle}</p>
          )}
        </div>

        <AnimationWrapper animation={config.animation || 'none'}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ingredients.slice(0, 6).map((ingredient, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl border border-slate-200 p-5 bg-gradient-to-b from-emerald-50/60 to-white hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <span className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-700">
                    <Leaf className="h-5 w-5" />
                  </span>
                  {ingredient.tag && (
                    <span className="text-3xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                      {ingredient.tag}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-sm font-extrabold text-slate-900">{ingredient.name}</h3>
                <p className="mt-1.5 text-3xs text-slate-500 font-medium leading-relaxed">
                  {ingredient.benefit}
                </p>
              </div>
            ))}
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}