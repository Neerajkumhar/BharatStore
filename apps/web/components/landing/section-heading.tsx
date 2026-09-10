'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AnimationWrapper } from '@/components/storefront/primitives/animation-wrapper';

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  variant?: 'dark' | 'light';
  align?: 'center' | 'left';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  variant = 'light',
  align = 'center',
  className,
}: SectionHeadingProps) {
  const dark = variant === 'dark';

  return (
    <AnimationWrapper animation="fade-up" className={cn('', className)}>
      <div
        className={cn(
          'max-w-2xl',
          align === 'center' ? 'mx-auto text-center' : 'text-left'
        )}
      >
        {eyebrow && (
          <span
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-[0.14em] mb-4',
              dark
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            )}
          >
            {eyebrow}
          </span>
        )}
        <h2
          className={cn(
            'text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.08]',
            dark ? 'text-white' : 'text-primary-900'
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              'mt-4 text-base sm:text-lg leading-relaxed',
              dark ? 'text-slate-400' : 'text-slate-500'
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </AnimationWrapper>
  );
}