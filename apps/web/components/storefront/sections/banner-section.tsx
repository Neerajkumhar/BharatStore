'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface BannerSectionProps {
  config: {
    heading?: string;
    description?: string;
    imageUrl?: string;
    ctaText?: string;
    ctaLink?: string;
    bgColor?: string;
    textColor?: string;
    layout?: 'left' | 'center' | 'right';
  };
  slug: string;
}

export function BannerSection({ config, slug }: BannerSectionProps) {
  const alignMap = { left: 'text-left', center: 'text-center', right: 'text-right' };

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div
        className={`rounded-2xl overflow-hidden relative ${config.imageUrl ? 'min-h-[200px]' : 'py-12 px-6 sm:px-12'}`}
        style={{ backgroundColor: config.bgColor || '#fef3c7', color: config.textColor || '#92400e' }}
      >
        {config.imageUrl && (
          <div className="absolute inset-0 z-0">
            <img src={config.imageUrl} alt="" className="w-full h-full object-cover opacity-20" />
          </div>
        )}
        <div className={`relative z-10 ${config.imageUrl ? 'py-12 px-6 sm:px-12' : ''} ${alignMap[config.layout || 'left']}`}>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{config.heading || 'Special Offer'}</h2>
          {config.description && (
            <p className="mt-2 text-sm max-w-xl leading-relaxed" style={{ margin: config.layout === 'center' ? '0.5rem auto 0' : '0.5rem 0 0' }}>
              {config.description}
            </p>
          )}
          {config.ctaText && (
            <div className="mt-4" style={{ display: 'flex', justifyContent: config.layout === 'right' ? 'flex-end' : config.layout === 'center' ? 'center' : 'flex-start' }}>
              <Link
                href={config.ctaLink?.startsWith('/') ? config.ctaLink : `/store/${slug}${config.ctaLink || '/products'}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm hover:opacity-90"
                style={{ backgroundColor: config.textColor || '#92400e', color: config.bgColor || '#fef3c7' }}
              >
                <span>{config.ctaText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
