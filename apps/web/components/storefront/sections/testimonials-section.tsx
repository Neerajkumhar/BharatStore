'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  text: string;
  rating: number;
}

interface TestimonialsSectionProps {
  config: {
    title?: string;
    testimonials?: Testimonial[];
  };
  theme?: { accentColor?: string };
}

export function TestimonialsSection({ config, theme }: TestimonialsSectionProps) {
  const accent = theme?.accentColor || '#d97706';
  const testimonials = config.testimonials || [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{config.title || 'What Our Customers Say'}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <Quote className="h-6 w-6 opacity-30" style={{ color: accent }} />
            <p className="text-sm text-slate-600 leading-relaxed">{t.text}</p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900">{t.name}</span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`h-3 w-3 ${si < t.rating ? 'fill-current' : 'text-slate-200'}`}
                    style={{ color: si < t.rating ? accent : undefined }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
