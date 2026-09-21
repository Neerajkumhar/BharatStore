import React from 'react';
import { getSectionBlockClass, type SectionBlockStyle, type SectionViewport } from '@/lib/section-block-style';

interface SectionBlockProps {
  type: string;
  config: Record<string, unknown>;
  viewport?: SectionViewport;
  builder?: boolean;
  children: React.ReactNode;
}

export function SectionBlock({ type, config, viewport, builder = false, children }: SectionBlockProps) {
  const raw = (config?.style || {}) as SectionBlockStyle | null;
  const { className, style, hasBg, hasText } = getSectionBlockClass(type, raw, viewport, builder);

  return (
    <div
      className={className}
      style={style as React.CSSProperties}
      data-sb-bg={hasBg ? '' : undefined}
      data-sb-text={hasText ? '' : undefined}
    >
      {children}
    </div>
  );
}