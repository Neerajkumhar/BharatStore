'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  config: {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    ctaText?: string;
    ctaLink?: string;
    alignment?: 'left' | 'center' | 'right';
    height?: 'small' | 'medium' | 'large';
    overlayOpacity?: number;
  };
  slug: string;
  theme?: {
    primaryColor?: string;
    accentColor?: string;
  };
}

const heightMap = { small: 'py-10 sm:py-14', medium: 'py-16 sm:py-20', large: 'py-20 sm:py-28' };
const alignMap = { left: 'text-left', center: 'text-center', right: 'text-right' };

export function HeroSection({ config, slug, theme }: HeroSectionProps) {
  const bg = theme?.primaryColor || '#0f172a';
  const accent = theme?.accentColor || '#d97706';
  const opacity = config.overlayOpacity ?? 40;

  return (
    <section
      className={`relative text-white overflow-hidden px-4 sm:px-6 lg:px-8 shadow-md ${heightMap[config.height || 'medium']}`}
      style={{ backgroundColor: bg }}
    >
      {config.imageUrl && (
        <div className="absolute inset-0 z-0">
          <img src={config.imageUrl} alt="" className="w-full h-full object-cover" style={{ opacity: opacity / 100 }} />
        </div>
      )}
      <div className={`relative z-10 max-w-5xl mx-auto ${alignMap[config.alignment || 'center']} space-y-4`}>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          {config.title || 'Welcome to Our Store'}
        </h1>
        {config.subtitle && (
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed" style={{ margin: config.alignment === 'center' ? '0 auto' : undefined }}>
            {config.subtitle}
          </p>
        )}
        {config.ctaText && (
          <div className="pt-4" style={{ display: 'flex', justifyContent: config.alignment === 'right' ? 'flex-end' : config.alignment === 'center' ? 'center' : 'flex-start' }}>
            <Link
              href={config.ctaLink?.startsWith('/') ? config.ctaLink : `/store/${slug}${config.ctaLink || '/products'}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition shadow-lg"
              style={{ backgroundColor: accent, color: bg }}
            >
              <span>{config.ctaText}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
