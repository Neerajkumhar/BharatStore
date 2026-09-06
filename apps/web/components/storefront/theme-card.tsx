'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  type StorefrontTemplate,
  buildTemplatePageConfig,
} from '@bharatstore/shared/constants';
import { getDemoDataset, getPreviewDemoPayload } from '@/lib/storefront-demo-data';
import { generateStorefrontPreviewHTML } from './preview-html';

const PREVIEW_WIDTH = 1100;
const PREVIEW_HEIGHT = 320;

interface ThemeCardProps {
  template: StorefrontTemplate;
  isCurrent: boolean;
  onPreview: (template: StorefrontTemplate) => void;
  onUse: (template: StorefrontTemplate) => void;
}

export function ThemeCard({ template, isCurrent, onPreview, onUse }: ThemeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      if (width > 0) setScale(width / PREVIEW_WIDTH);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { html, meta } = useMemo(() => {
    const config = buildTemplatePageConfig(template.id);
    const visibleSections = config.sections
      .filter((s) => s.visible)
      .sort((a, b) => a.order - b.order);
    const demo = getDemoDataset(template.category);
    const payload = getPreviewDemoPayload(template.category, template.id);
    const previewHtml = generateStorefrontPreviewHTML(visibleSections, config.theme, demo.store, template.id, {
      store: payload.store,
      categories: payload.categories,
      products: payload.products,
      heroImage: payload.heroImage,
      bannerImages: payload.bannerImages,
      aboutImage: payload.aboutImage,
      testimonials: payload.testimonials,
    });
    return { html: previewHtml, meta: { demo } };
  }, [template.id, template.category]);

  const s = scale || 0.36;
  const iframeHeight = Math.ceil(PREVIEW_HEIGHT / s);

  return (
    <div
      className={`relative group rounded-xl overflow-hidden bg-white border transition-all hover:shadow-lg hover:-translate-y-0.5 ${
        isCurrent ? 'border-amber-400 ring-2 ring-amber-400' : 'border-slate-200'
      }`}
    >
      <button
        type="button"
        className="block w-full text-left"
        onClick={() => onPreview(template)}
        aria-label={`Preview ${template.name}`}
      >
        <div
          ref={cardRef}
          className="overflow-hidden bg-slate-100 pointer-events-none"
          style={{ height: PREVIEW_HEIGHT }}
        >
          <div
            style={{
              width: PREVIEW_WIDTH,
              height: iframeHeight,
              transform: `scale(${s})`,
              transformOrigin: 'top left',
            }}
          >
            <iframe
              srcDoc={html}
              width={PREVIEW_WIDTH}
              height={iframeHeight}
              className="border-0 pointer-events-none"
              tabIndex={-1}
              aria-hidden
              title={`${template.name} preview`}
            />
          </div>
        </div>
      </button>

      <button
        type="button"
        className="block w-full text-left px-4 py-3 bg-white"
        onClick={() => onPreview(template)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-slate-800 truncate">{template.name}</h3>
              {template.isNew && (
                <span className="text-[10px] font-bold text-green-700 bg-green-100 border border-green-200 px-1.5 py-0.5 rounded-full">
                  New
                </span>
              )}
              {template.popular && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">
                  Popular
                </span>
              )}
              {template.featured && (
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 border border-indigo-200 px-1.5 py-0.5 rounded-full">
                  Featured
                </span>
              )}
              {isCurrent && (
                <span className="text-[10px] font-bold text-white bg-amber-500 px-1.5 py-0.5 rounded-full">
                  Current
                </span>
              )}
            </div>
            <p className="text-2xs text-slate-500 mt-1 line-clamp-2">{template.description}</p>
            <p className="text-2xs text-slate-400 mt-2">
              {meta.demo.store.tradeName} · {template.category} · {template.style}
            </p>
          </div>
        </div>
      </button>

      <div className="px-4 pb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPreview(template)}
          className="flex-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg py-2 transition"
        >
          Previews
        </button>
        {isCurrent ? (
          <div className="flex-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg py-2 text-center cursor-default">
            Currently applied
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onUse(template)}
            className="flex-1 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 border border-amber-500 rounded-lg py-2 transition"
          >
            Use Theme
          </button>
        )}
      </div>

      <div className="absolute inset-0 ring-1 ring-inset ring-slate-900/5 rounded-xl pointer-events-none" />
    </div>
  );
}