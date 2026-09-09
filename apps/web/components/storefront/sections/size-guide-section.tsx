'use client';

import React from 'react';
import { Ruler } from 'lucide-react';
import { AnimationWrapper, type AnimationType } from '../primitives/animation-wrapper';

export interface SizeGuideSectionProps {
  config: {
    title?: string;
    subtitle?: string | null;
    columns?: string[];
    rows?: Array<{ label: string; values: string[] }>;
    animation?: AnimationType;
  };
}

export function SizeGuideSection({ config }: SizeGuideSectionProps) {
  const columns = config.columns?.length ? config.columns : ['Size', 'Chest', 'Length'];
  const rows = config.rows?.length
    ? config.rows
    : [
        { label: 'S', values: ['38"', '28"'] },
        { label: 'M', values: ['40"', '29"'] },
        { label: 'L', values: ['42"', '30"'] },
        { label: 'XL', values: ['44"', '31"'] },
      ];

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1.5">
          <span className="inline-flex items-center gap-1.5 text-2xs font-extrabold uppercase tracking-widest text-amber-600">
            <Ruler className="h-3.5 w-3.5" />
            Fit Guide
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {config.title || 'Size Guide'}
          </h2>
          {config.subtitle && (
            <p className="text-xs text-slate-500 font-medium">{config.subtitle}</p>
          )}
        </div>

        <AnimationWrapper animation={config.animation || 'none'}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xs">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      className={`px-4 py-3 text-left text-xs font-black uppercase tracking-widest ${
                        idx === 0 ? 'w-24' : ''
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className={idx % 2 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="px-4 py-3 font-extrabold text-slate-900 border-t border-slate-100">
                      {row.label}
                    </td>
                    {row.values.map((value, vIdx) => (
                      <td key={vIdx} className="px-4 py-3 text-slate-600 font-medium border-t border-slate-100">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-2xs text-slate-400 text-center mt-3">
            Measurements are in inches. For custom sizing, message the store directly.
          </p>
        </AnimationWrapper>
      </div>
    </section>
  );
}