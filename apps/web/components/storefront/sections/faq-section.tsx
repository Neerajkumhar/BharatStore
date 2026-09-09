'use client';

import React from 'react';
import { AccordionPrimitive, AccordionItem } from '../primitives/accordion-primitive';
import { AnimationWrapper } from '../primitives/animation-wrapper';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  config: {
    title?: string;
    items?: FaqItem[];
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  theme?: { accentColor?: string };
}

export function FaqSection({ config }: FaqSectionProps) {
  const items = config.items?.length
    ? config.items
    : [
        { question: 'What payment methods do you accept?', answer: 'We accept Cash on Delivery, UPI, Credit/Debit cards, and Khata credit.' },
        { question: 'How long does delivery take?', answer: 'Orders are dispatched within 24 hours and delivered in 2-4 business days.' },
        { question: 'Do you provide a tax invoice for GST claiming?', answer: 'Yes, every order includes a valid B2B/B2C GST tax invoice.' },
      ];

  const accordionItems: AccordionItem[] = items.map((item, idx) => ({
    id: `faq-${idx}`,
    title: item.question,
    content: <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.answer}</p>,
  }));

  return (
    <section className="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {config.title || 'Frequently Asked Questions'}
        </h2>
      </div>

      <AnimationWrapper animation={config.animation || 'fade-up'}>
        <AccordionPrimitive items={accordionItems} />
      </AnimationWrapper>
    </section>
  );
}
