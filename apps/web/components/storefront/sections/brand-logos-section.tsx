'use client';

import React from 'react';
import { Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface BrandLogosSectionProps {
  config: {
    title?: string;
    logos?: string[];
  };
}

export function BrandLogosSection({ config }: BrandLogosSectionProps) {
  const logos = config.logos?.length
    ? config.logos
    : ['FSSAI Certified', '100% Genuine Direct Store', 'Pan-India Express Logistics', 'GST Tax Compliant', 'ISO 9001 Quality Standard'];

  return (
    <section className="py-6 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {config.title && (
          <p className="text-3xs font-extrabold uppercase tracking-widest text-slate-500 text-center mb-4">
            {config.title}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-slate-600">
          {logos.map((logo, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{logo}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
