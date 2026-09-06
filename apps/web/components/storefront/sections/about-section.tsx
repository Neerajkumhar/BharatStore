'use client';

import React from 'react';

interface AboutSectionProps {
  config: {
    title?: string;
    description?: string;
    imageUrl?: string;
    layout?: 'left' | 'right' | 'center';
  };
  theme?: { accentColor?: string };
}

export function AboutSection({ config, theme }: AboutSectionProps) {
  const accent = theme?.accentColor || '#d97706';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className={`bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 flex flex-col ${config.layout === 'right' ? 'md:flex-row-reverse' : config.layout === 'center' ? 'md:flex-row md:items-center md:text-center' : 'md:flex-row'} gap-8 items-center`}>
        {config.imageUrl && (
          <div className="shrink-0 w-full md:w-1/3">
            <img src={config.imageUrl} alt={config.title || 'About us'} className="w-full h-48 sm:h-56 object-cover rounded-xl" />
          </div>
        )}
        <div className={`space-y-3 ${config.layout === 'center' ? 'text-center' : ''}`}>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{config.title || 'About Us'}</h2>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: accent }} />
          <p className="text-sm text-slate-600 leading-relaxed max-w-xl">{config.description || 'We are dedicated to bringing you the best products.'}</p>
        </div>
      </div>
    </section>
  );
}
