'use client';

import React from 'react';
import { Truck, PackageCheck, RefreshCw, Clock } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface DeliveryInfoSectionProps {
  config: {
    title?: string;
    items?: Array<{ title: string; desc: string }>;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
}

export function DeliveryInfoSection({ config }: DeliveryInfoSectionProps) {
  const items = config.items?.length
    ? config.items
    : [
        { title: 'Local & Pan-India Dispatch', desc: 'Orders placed before 2 PM dispatched same day from store inventory.' },
        { title: 'Tamper-Evident Packaging', desc: 'Sealed & protective eco-friendly boxes ensure intact arrival.' },
        { title: '7-Day Return Policy', desc: 'Easy replacements or exchanges supported across India.' },
      ];

  const icons = [Truck, PackageCheck, RefreshCw];

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center">
          {config.title || 'Shipping & Delivery Promise'}
        </h2>

        <AnimationWrapper animation={config.animation || 'fade-up'}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {items.map((item, idx) => {
              const IconComp = icons[idx % icons.length] || Truck;
              return (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
                    <IconComp className="h-6 w-6 text-amber-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
