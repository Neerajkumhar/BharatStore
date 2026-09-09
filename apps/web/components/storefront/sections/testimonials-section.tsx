'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';
import { CarouselPrimitive } from '../primitives/carousel-primitive';
import { AnimationWrapper } from '../primitives/animation-wrapper';

interface Testimonial {
  name: string;
  text: string;
  rating: number;
}

interface TestimonialsSectionProps {
  config: {
    title?: string;
    testimonials?: Testimonial[];
    autoplay?: boolean;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  theme?: { accentColor?: string };
}

export function TestimonialsSection({ config, theme }: TestimonialsSectionProps) {
  const accent = theme?.accentColor || '#d97706';
  const testimonials = config.testimonials?.length
    ? config.testimonials
    : [
        { name: 'Priya S.', text: 'Amazing quality products! Delivered within 2 days in Delhi.', rating: 5 },
        { name: 'Rahul M.', text: 'Fast delivery, proper GST invoice, and authentic items.', rating: 5 },
        { name: 'Anita K.', text: 'Best online shopping experience for my boutique requirements.', rating: 5 },
      ];

  const cards = testimonials.map((t, i) => (
    <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs h-full flex flex-col justify-between">
      <div className="space-y-3">
        <Quote className="h-6 w-6 opacity-30" style={{ color: accent }} />
        <p className="text-sm text-slate-700 leading-relaxed font-medium">"{t.text}"</p>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-900">{t.name}</span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, si) => (
            <Star
              key={si}
              className={`h-3.5 w-3.5 ${si < t.rating ? 'fill-current' : 'text-slate-200'}`}
              style={{ color: si < t.rating ? accent : undefined }}
            />
          ))}
        </div>
      </div>
    </div>
  ));

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {config.title || 'What Our Customers Say'}
        </h2>
      </div>

      <AnimationWrapper animation={config.animation || 'fade-up'}>
        <CarouselPrimitive autoplay={config.autoplay !== false} itemsPerPage={{ desktop: 3, tablet: 2, mobile: 1 }}>
          {cards}
        </CarouselPrimitive>
      </AnimationWrapper>
    </section>
  );
}
