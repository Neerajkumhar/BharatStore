'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface PromoSplitSectionProps {
  config: {
    leftHeading?: string;
    leftSub?: string;
    leftCta?: string;
    rightHeading?: string;
    rightSub?: string;
    rightCta?: string;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  slug: string;
}

export function PromoSplitSection({ config, slug }: PromoSplitSectionProps) {
  return (
    <section className="py-8 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimationWrapper animation={config.animation || 'slide-up'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Box */}
            <div className="bg-amber-500/15 border border-amber-300/60 rounded-3xl p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <span className="text-3xs font-extrabold uppercase tracking-widest text-amber-900">Featured Campaign</span>
                <h3 className="text-2xl font-black text-slate-900">{config.leftHeading || 'Women’s Festive Edit'}</h3>
                <p className="text-xs text-slate-700 font-medium">{config.leftSub || 'Flat 30% Off Sarees, Lehengas & Handloom Stoles'}</p>
              </div>
              <div>
                <Link
                  href={`/store/${slug}/products`}
                  className="inline-flex items-center gap-2 py-2.5 px-5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-amber-600 hover:text-white transition"
                >
                  <span>{config.leftCta || 'Shop Women'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Box */}
            <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <span className="text-3xs font-extrabold uppercase tracking-widest text-amber-400">Heritage Drop</span>
                <h3 className="text-2xl font-black text-white">{config.rightHeading || 'Men’s Heritage Kurtas'}</h3>
                <p className="text-xs text-slate-300 font-medium">{config.rightSub || 'Handcrafted raw silk & linen kurtas starting at ₹799'}</p>
              </div>
              <div>
                <Link
                  href={`/store/${slug}/products`}
                  className="inline-flex items-center gap-2 py-2.5 px-5 bg-amber-500 text-white font-bold text-xs rounded-xl hover:bg-amber-600 transition"
                >
                  <span>{config.rightCta || 'Shop Men'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
