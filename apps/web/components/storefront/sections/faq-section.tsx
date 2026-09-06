'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  config: {
    title?: string;
    items?: FaqItem[];
  };
  theme?: { accentColor?: string };
}

export function FaqSection({ config, theme }: FaqSectionProps) {
  const accent = theme?.accentColor || '#d97706';
  const items = config.items || [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{config.title || 'Frequently Asked Questions'}</h2>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="h-4 w-4 shrink-0" style={{ color: accent }} />
                <span className="text-sm font-semibold text-slate-900">{item.question}</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 ml-7">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
