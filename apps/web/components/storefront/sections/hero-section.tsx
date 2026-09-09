'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  config: {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    ctaText?: string;
    ctaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    alignment?: 'left' | 'center' | 'right';
    height?: 'small' | 'medium' | 'large';
    overlayOpacity?: number;
    layout?: 'collection' | 'campaign' | 'layered';
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
  const layout = config.layout || 'collection';
  const title = config.title || 'Welcome to Our Store';
  const subtitle = config.subtitle || 'Quality products delivered to your doorstep';
  const ctaText = config.ctaText || 'Shop Now';
  const ctaHref = config.ctaLink?.startsWith('/') ? config.ctaLink : `/store/${slug}${config.ctaLink || '/products'}`;

  const bgImage = config.imageUrl && (
    <div className="absolute inset-0 z-0">
      <img src={config.imageUrl} alt="" className="w-full h-full object-cover" style={{ opacity: opacity / 100 }} />
    </div>
  );

  if (layout === 'campaign') {
    return (
      <section
        className={`relative text-white overflow-hidden px-4 sm:px-6 lg:px-8 shadow-md ${heightMap[config.height || 'medium']}`}
        style={{ backgroundColor: bg }}
      >
        {bgImage}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-rose-400 to-amber-400" />
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-5">
          <span className="inline-flex items-center gap-1.5 text-3xs font-extrabold uppercase tracking-[0.25em] text-amber-400 border border-amber-400/40 rounded-full px-4 py-1.5 bg-amber-400/10">
            <Sparkles className="h-3 w-3" />
            Limited Time Campaign
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.05] uppercase">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed uppercase tracking-wider">
            {subtitle}
          </p>
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-6 py-3">
            <span className="text-3xs font-mono font-black uppercase tracking-widest text-amber-400">Offer ends soon</span>
            <span className="h-4 w-px bg-white/30" />
            <span className="text-2xs text-slate-200">Extra 10% with code <strong className="text-amber-400">BHARAT10</strong></span>
          </div>
          <div className="pt-3 flex items-center justify-center gap-3">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider transition shadow-xl hover:scale-105"
              style={{ backgroundColor: accent, color: bg }}
            >
              <span>{ctaText}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            {config.secondaryCtaText && (
              <Link
                href={config.secondaryCtaLink?.startsWith('/') ? config.secondaryCtaLink : `/store/${slug}${config.secondaryCtaLink || '/products'}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider border border-white/40 hover:bg-white/10 transition"
              >
                {config.secondaryCtaText}
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'layered') {
    return (
      <section
        className={`relative text-white overflow-hidden px-4 sm:px-6 lg:px-8 shadow-md ${heightMap[config.height || 'medium']}`}
        style={{ backgroundColor: bg }}
      >
        {bgImage}
        <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className={`${alignMap[config.alignment || 'left']} space-y-4`}>
            <span className="inline-flex items-center gap-1.5 text-3xs font-extrabold uppercase tracking-[0.25em] text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              Curated Collection
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">{subtitle}</p>
            <div className="pt-3 flex items-center gap-3">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition shadow-lg"
                style={{ backgroundColor: accent, color: bg }}
              >
                <span>{ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              {config.secondaryCtaText && (
                <Link
                  href={config.secondaryCtaLink?.startsWith('/') ? config.secondaryCtaLink : `/store/${slug}${config.secondaryCtaLink || '/products'}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm border border-white/40 hover:bg-white/10 transition"
                >
                  {config.secondaryCtaText}
                </Link>
              )}
            </div>
          </div>

          {config.imageUrl && (
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="absolute -inset-6 rounded-3xl bg-amber-400/10 rotate-6" />
                <div className="absolute -left-8 top-6 h-40 w-32 rounded-2xl overflow-hidden -rotate-6 shadow-xl border border-white/20">
                  <img src={config.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative w-72 h-96 rounded-3xl overflow-hidden rotate-2 shadow-2xl border border-white/20">
                  <img src={config.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -right-6 bottom-8 h-36 w-28 rounded-2xl overflow-hidden rotate-6 shadow-xl border border-white/20">
                  <img src={config.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`relative text-white overflow-hidden px-4 sm:px-6 lg:px-8 shadow-md ${heightMap[config.height || 'medium']}`}
      style={{ backgroundColor: bg }}
    >
      {bgImage}
      <div className={`relative z-10 max-w-5xl mx-auto ${alignMap[config.alignment || 'center']} space-y-4`}>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          {title}
        </h1>
        {config.subtitle && (
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed" style={{ margin: config.alignment === 'center' ? '0 auto' : undefined }}>
            {subtitle}
          </p>
        )}
        {config.ctaText && (
          <div className="pt-4" style={{ display: 'flex', justifyContent: config.alignment === 'right' ? 'flex-end' : config.alignment === 'center' ? 'center' : 'flex-start' }}>
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition shadow-lg"
              style={{ backgroundColor: accent, color: bg }}
            >
              <span>{ctaText}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}