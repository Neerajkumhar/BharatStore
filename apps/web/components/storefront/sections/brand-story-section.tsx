'use client';

import React from 'react';
import { Award, Flag } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface BrandStorySectionProps {
  config: {
    title?: string;
    story?: string;
    milestones?: Array<{ year: string; event: string }>;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
}

export function BrandStorySection({ config }: BrandStorySectionProps) {
  const milestones = config.milestones?.length
    ? config.milestones
    : [
        { year: '2012', event: 'First storefront store established in Jaipur' },
        { year: '2018', event: 'Transitioned to 100% natural, direct artisan sourcing' },
        { year: '2026', event: 'Digital BharatStore storefront active across India' },
      ];

  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
        <AnimationWrapper animation={config.animation || 'slide-up'}>
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-100 text-amber-900 mb-2">
            <Award className="h-6 w-6 text-amber-600" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {config.title || 'Our Journey Since 2012'}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
            {config.story || 'Started as a small local shop, BharatStore has grown to empower thousands of customers with authentic, GST-compliant local products and direct store delivery.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
            {milestones.map((m, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-1">
                <span className="text-xl font-black text-amber-600 font-mono">{m.year}</span>
                <p className="text-xs font-bold text-slate-800">{m.event}</p>
              </div>
            ))}
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
