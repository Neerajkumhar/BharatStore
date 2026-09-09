'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface ProductComparisonSectionProps {
  config: {
    title?: string;
    features?: string[];
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  slug: string;
}

export function ProductComparisonSection({ config }: ProductComparisonSectionProps) {
  const features = config.features?.length
    ? config.features
    : ['Brand Warranty', 'GST Tax Invoice', 'Same-Day Dispatch', 'Free Pan-India Delivery', 'Khata Credit Support'];

  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center">
          {config.title || 'Why Shop With BharatStore'}
        </h2>

        <AnimationWrapper animation={config.animation || 'fade-up'}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="p-4">Key Standard</th>
                  <th className="p-4 text-center text-amber-400">BharatStore Direct</th>
                  <th className="p-4 text-center text-slate-400">Unverified Sellers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {features.map((feat, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition font-medium">
                    <td className="p-4 text-slate-800 font-bold">{feat}</td>
                    <td className="p-4 text-center text-emerald-600 font-bold">
                      <div className="flex items-center justify-center gap-1">
                        <Check className="h-4 w-4 stroke-[3]" />
                        <span>Included</span>
                      </div>
                    </td>
                    <td className="p-4 text-center text-rose-500 font-bold">
                      <div className="flex items-center justify-center gap-1">
                        <X className="h-4 w-4 stroke-[3]" />
                        <span>Uncertain</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
