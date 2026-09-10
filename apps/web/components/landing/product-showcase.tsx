'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimationWrapper } from '@/components/storefront/primitives/animation-wrapper';
import { DashboardMock } from './landing-previews';
import { CheckCircle2, Boxes, Receipt, Users, ShoppingCart, ShieldCheck } from 'lucide-react';
import { SectionHeading } from './section-heading';
import { cn } from '@/lib/utils';

const labels = [
  { icon: Boxes, text: 'Real-time inventory' },
  { icon: Receipt, text: 'GST-ready billing' },
  { icon: Users, text: 'Customer Khata' },
  { icon: ShoppingCart, text: 'Omnichannel orders' },
  { icon: ShieldCheck, text: 'Role-based access' },
];

function useParallax(amount: number, ref: React.RefObject<HTMLElement | null>) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        if (rect.top > vh || rect.bottom < 0) return;
        const progress = (vh - rect.top) / (vh + rect.height);
        setOffset((progress - 0.5) * amount);
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [amount, ref]);

  return offset;
}

export function ProductShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const offset = useParallax(-24, sectionRef);

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-28 bg-slate-950 border-t border-slate-800 overflow-hidden">
      <div className="absolute inset-0 bg-landing-dots opacity-40 mask-fade-b" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-500/[0.06] rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="One platform"
          title={
            <>
              One platform. Every part{' '}
              <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                of your business.
              </span>
            </>
          }
          subtitle="Products, orders, billing, customers, and decisions — wired together automatically."
          variant="dark"
          className="mb-14"
        />

        <AnimationWrapper animation="scale">
          <div
            className="relative max-w-5xl mx-auto"
            style={{ transform: `translateY(${offset}px)` }}
          >
            <div className="absolute -inset-8 bg-gradient-to-br from-amber-500/10 via-transparent to-blue-500/10 rounded-[2rem] blur-3xl -z-10" />

            {/* Layered backing plates */}
            <div className="absolute -inset-3 rounded-[1.75rem] bg-white/[0.03] border border-white/10 -z-[1] hidden sm:block" />

            <DashboardMock className="w-full" />

            {/* Floating labels — desktop */}
            <div className="absolute -left-10 sm:-left-4 top-1/2 -translate-y-1/2 space-y-3 hidden lg:block z-10">
              {labels.slice(0, 3).map((label, i) => (
                <RevealPill key={i} label={label} delay={i * 150} />
              ))}
            </div>
            <div className="absolute -right-10 sm:-right-4 top-1/2 -translate-y-1/2 space-y-3 hidden lg:block z-10">
              {labels.slice(3).map((label, i) => (
                <RevealPill key={i} label={label} delay={(i + 3) * 150} />
              ))}
            </div>
          </div>
        </AnimationWrapper>

        {/* Mobile: inline pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8 lg:hidden">
          {labels.map((label, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-slate-300 font-medium"
            >
              <label.icon className="h-3 w-3 text-amber-400" />
              {label.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function RevealPill({ label, delay }: { label: { icon: React.ComponentType<{ className?: string }>; text: string }; delay: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-medium shadow-xl shadow-black/30 transition-all duration-500',
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 flex items-center justify-center">
        <label.icon className="h-3.5 w-3.5" />
      </span>
      {label.text}
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-1" />
    </div>
  );
}