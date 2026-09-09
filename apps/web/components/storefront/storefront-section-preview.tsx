'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getSectionExtraProps } from './section-component-map';
import { getPreviewLoader } from './section-preview-loader';
import { CartProvider } from './cart-context';
import { getDemoPreviewBundle } from '../../lib/storefront-demo-adapters';

export const PREVIEW_DESIGN_WIDTH = 1280;

export interface StorefrontSectionPreviewProps {
  type: string;
  config: Record<string, unknown>;
  demoCategory?: string;
  width?: number;
  height?: number;
  interactive?: boolean;
  fluid?: boolean;
  className?: string;
}

function useInView<T extends HTMLElement>(rootMargin = '400px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof ResizeObserver === 'undefined') {
      setSize({ width: el.clientWidth, height: el.clientHeight });
      return;
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

export function StorefrontSectionPreview({
  type,
  config,
  demoCategory = 'general',
  width = 264,
  height = 264,
  interactive = false,
  fluid = false,
  className = '',
}: StorefrontSectionPreviewProps) {
  const { ref: inViewRef, inView } = useInView<HTMLDivElement>();
  const { ref: sizeRef, size } = useElementSize<HTMLDivElement>();
  const bundle = useMemo(() => getDemoPreviewBundle(demoCategory), [demoCategory]);

  const Component = inView ? getPreviewLoader(type) : null;

  const containerWidth = fluid && size.width > 0 ? size.width : width;
  const containerHeight = fluid && size.height > 0 ? size.height : height;
  const scale = containerWidth / PREVIEW_DESIGN_WIDTH;

  return (
    <div
      ref={(node) => {
        inViewRef.current = node;
        sizeRef.current = node;
      }}
      className={`storefront-preview relative overflow-hidden ${className}`}
      style={{ width: fluid ? '100%' : containerWidth, height: fluid ? '100%' : containerHeight }}
      data-preview-type={type}
    >
      {Component ? (
        <CartProvider slug="demo-store">
          <div
            className="pointer-events-none"
            style={interactive ? { pointerEvents: 'auto' } : undefined}
          >
            <div
              style={{
                width: '100%',
                height: containerHeight / scale,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  width: `${(100 / scale).toFixed(4)}%`,
                }}
              >
                <Component
                  config={config}
                  slug="demo-store"
                  {...getSectionExtraProps({
                    type,
                    data: bundle as unknown as Record<string, unknown>,
                    theme: { primaryColor: '#0f172a', accentColor: '#d97706' },
                    storeData: bundle.storeData,
                  })}
                />
              </div>
            </div>
          </div>
        </CartProvider>
      ) : (
        <div className="w-full h-full bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-400 animate-spin" />
        </div>
      )}
    </div>
  );
}