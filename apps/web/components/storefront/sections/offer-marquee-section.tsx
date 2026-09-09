'use client';

import React from 'react';

export interface OfferMarqueeSectionProps {
  config: {
    items?: string[];
    speed?: 'slow' | 'normal' | 'fast';
    bgColor?: string;
    textColor?: string;
  };
}

export function OfferMarqueeSection({ config }: OfferMarqueeSectionProps) {
  const items = config.items?.length
    ? config.items
    : [
        '✨ 100% Genuine Direct Store Products',
        '🚚 Express Dispatch Within 24 Hours',
        '💳 Cash on Delivery & Khata Credit Available',
        '🧾 Tax Compliant GST Invoice Included',
      ];

  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div
      className="overflow-hidden whitespace-nowrap py-3 border-y border-slate-800 text-xs font-black tracking-wider"
      style={{
        backgroundColor: config.bgColor || '#1e293b',
        color: config.textColor || '#f8fafc',
      }}
    >
      <div className="inline-block animate-marquee">
        {repeated.map((item, idx) => (
          <span key={idx} className="mx-6 inline-flex items-center">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
