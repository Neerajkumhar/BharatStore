'use client';

import React, { useState } from 'react';
import { Ticket, Copy, Check } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface CouponStripSectionProps {
  config: {
    title?: string;
    coupons?: Array<{ code: string; discount: string; detail: string }>;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
}

export function CouponStripSection({ config }: CouponStripSectionProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const coupons = config.coupons?.length
    ? config.coupons
    : [
        { code: 'WELCOME10', discount: '10% OFF', detail: 'On your first storefront order' },
        { code: 'BHARAT500', discount: '₹500 OFF', detail: 'On orders above ₹2,999' },
        { code: 'FREESHIP', discount: 'FREE SHIPPING', detail: 'On orders above ₹999' },
      ];

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <section className="py-8 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {config.title && (
          <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 text-center">
            {config.title}
          </h3>
        )}

        <AnimationWrapper animation={config.animation || 'slide-up'}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.map((c, idx) => (
              <div
                key={idx}
                className="bg-slate-800 border border-dashed border-amber-500/40 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-amber-400 font-black text-sm">
                    <Ticket className="h-4 w-4 shrink-0" />
                    <span>{c.discount}</span>
                  </div>
                  <p className="text-3xs text-slate-300 truncate">{c.detail}</p>
                </div>
                <button
                  onClick={() => handleCopy(c.code)}
                  className="px-3 py-1.5 bg-amber-500 text-white rounded-xl font-mono text-2xs font-extrabold hover:bg-amber-600 transition shrink-0 flex items-center gap-1"
                >
                  {copiedCode === c.code ? <Check className="h-3 w-3 text-emerald-950" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCode === c.code ? 'COPIED' : c.code}</span>
                </button>
              </div>
            ))}
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
