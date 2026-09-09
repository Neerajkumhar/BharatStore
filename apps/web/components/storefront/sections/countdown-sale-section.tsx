'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Timer, ArrowRight, Sparkles } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface CountdownSaleSectionProps {
  config: {
    title?: string;
    targetDate?: string;
    badge?: string;
    ctaText?: string;
    ctaLink?: string;
    bgColor?: string;
    textColor?: string;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
  slug: string;
}

export function CountdownSaleSection({ config, slug }: CountdownSaleSectionProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const target = config.targetDate ? new Date(config.targetDate).getTime() : Date.now() + 86400000 * 2;

    const updateTimer = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [config.targetDate]);

  return (
    <section
      className="py-12 px-4 border-b border-amber-900/30 overflow-hidden"
      style={{
        backgroundColor: config.bgColor || '#7c2d12',
        color: config.textColor || '#fed7aa',
      }}
    >
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <AnimationWrapper animation={config.animation || 'scale'}>
          {config.badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-3xs font-extrabold uppercase tracking-widest border border-amber-500/30">
              <Sparkles className="h-3 w-3" />
              <span>{config.badge}</span>
            </span>
          )}

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-2">
            {config.title || 'Festival Flash Sale Ends In:'}
          </h2>

          {/* Countdown Clock Grid */}
          {!timeLeft.isExpired ? (
            <div className="flex justify-center gap-3 sm:gap-6 my-6">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds },
              ].map((unit, idx) => (
                <div key={idx} className="bg-slate-950/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-3 sm:p-5 w-18 sm:w-24 shadow-xl">
                  <span className="block text-2xl sm:text-4xl font-mono font-black text-amber-400">
                    {String(unit.value).padStart(2, '0')}
                  </span>
                  <span className="block text-3xs uppercase font-extrabold tracking-widest text-slate-300 mt-1">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="my-6 p-4 bg-slate-900/80 rounded-2xl text-amber-300 text-sm font-bold border border-amber-500/30">
              ⚡ Flash sale offers have concluded. Regular prices apply.
            </div>
          )}

          <div>
            <Link
              href={config.ctaLink || `/store/${slug}/products`}
              className="inline-flex items-center gap-2 py-3.5 px-7 bg-amber-500 text-slate-950 font-black text-xs rounded-xl hover:bg-amber-400 transition shadow-xl"
            >
              <span>{config.ctaText || 'Grab Deals Now'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
