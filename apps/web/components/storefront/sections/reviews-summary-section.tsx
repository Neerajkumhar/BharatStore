'use client';

import React from 'react';
import { Star, ShieldCheck, Heart } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface ReviewsSummarySectionProps {
  config: {
    rating?: string;
    reviewCount?: string;
    headline?: string;
    stats?: Array<{ number: string; label: string }>;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
}

export function ReviewsSummarySection({ config }: ReviewsSummarySectionProps) {
  const stats = config.stats?.length
    ? config.stats
    : [
        { number: '99.4%', label: 'On-Time Dispatch' },
        { number: '15,000+', label: 'Verified Orders Shipped' },
        { number: '4.9 ★', label: 'Customer Rating' },
      ];

  return (
    <section className="py-12 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <AnimationWrapper animation={config.animation || 'scale'}>
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-sm font-black bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
            {'★'.repeat(5)} <span>{config.rating || '4.9'} / 5 ({config.reviewCount || '12,450+'} Reviews)</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {config.headline || 'Loved by Thousands Across India'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
            {stats.map((s, idx) => (
              <div key={idx} className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono block">{s.number}</span>
                <span className="text-3xs uppercase font-extrabold tracking-widest text-slate-300 mt-1 block">{s.label}</span>
              </div>
            ))}
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
