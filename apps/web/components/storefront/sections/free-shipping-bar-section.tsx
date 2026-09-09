'use client';

import React from 'react';
import { Truck } from 'lucide-react';

export interface FreeShippingBarSectionProps {
  config: {
    threshold?: number;
    text?: string;
    bgColor?: string;
    textColor?: string;
  };
}

export function FreeShippingBarSection({ config }: FreeShippingBarSectionProps) {
  const threshold = config.threshold || 999;
  const rawText = config.text || 'Add ₹{remaining} more for FREE Pan-India Delivery!';
  const displayText = rawText.replace('{remaining}', threshold.toLocaleString('en-IN'));

  return (
    <div
      className="py-2.5 px-4 text-center text-xs font-bold tracking-wide flex items-center justify-center gap-2"
      style={{
        backgroundColor: config.bgColor || '#15803d',
        color: config.textColor || '#ffffff',
      }}
    >
      <Truck className="h-4 w-4 shrink-0" />
      <span>{displayText}</span>
    </div>
  );
}
