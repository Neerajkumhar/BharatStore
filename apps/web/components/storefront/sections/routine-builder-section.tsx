'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface RoutineBuilderSectionProps {
  config: {
    title?: string;
    steps?: Array<{ step: string; title: string; desc: string }>;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
}

export function RoutineBuilderSection({ config }: RoutineBuilderSectionProps) {
  const steps = config.steps?.length
    ? config.steps
    : [
        { step: '01', title: 'Cleanse', desc: 'Gentle Ayurvedic face cleanser with neem & turmeric' },
        { step: '02', title: 'Tone & Hydrate', desc: 'Pure Steam-Distilled Rose Water Mist' },
        { step: '03', title: 'Nourish', desc: 'Kumkumadi Radiance Night Facial Serum' },
      ];

  return (
    <section className="py-12 bg-pink-50/50 border-b border-pink-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-3xs font-extrabold uppercase tracking-widest text-pink-700 flex items-center justify-center gap-1">
            <Sparkles className="h-3.5 w-3.5" /> Skincare Ritual
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {config.title || '3-Step Daily Glow Routine'}
          </h2>
        </div>

        <AnimationWrapper animation={config.animation || 'fade-up'}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((s, idx) => (
              <div key={idx} className="bg-white border border-pink-200/80 rounded-2xl p-6 shadow-xs relative space-y-3">
                <span className="text-3xl font-black text-pink-500/40 font-mono block">{s.step}</span>
                <h4 className="text-base font-bold text-slate-900">{s.title}</h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
