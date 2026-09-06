'use client';

import React, { useState, useMemo } from 'react';
import { X, Monitor, Tablet, Smartphone } from 'lucide-react';
import { type StorefrontTemplate, buildTemplatePageConfig } from '@bharatstore/shared/constants';
import { getDemoDataset } from '@/lib/storefront-demo-data';
import {
  generateStorefrontPreviewHTML,
  getPreviewViewportWidth,
} from './preview-html';

type PreviewViewport = 'desktop' | 'tablet' | 'mobile';

const viewportLabel: Record<PreviewViewport, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',
};

interface ThemePreviewModalProps {
  template: StorefrontTemplate;
  onClose: () => void;
}

export function ThemePreviewModal({ template, onClose }: ThemePreviewModalProps) {
  const [viewport, setViewport] = useState<PreviewViewport>('desktop');

  const html = useMemo(() => {
    const config = buildTemplatePageConfig(template.id);
    const visibleSections = config.sections
      .filter((s) => s.visible)
      .sort((a, b) => a.order - b.order);
    const demo = getDemoDataset(template.category);
    return generateStorefrontPreviewHTML(visibleSections, config.theme, demo.store, template.id, {
      store: demo.store,
      categories: demo.categories,
      products: demo.products,
    });
  }, [template.id, template.category]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal="true" aria-label={`${template.name} preview`}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-6xl h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{template.name}</h3>
              <p className="text-2xs text-slate-500">{template.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              {(['desktop', 'tablet', 'mobile'] as PreviewViewport[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setViewport(v)}
                  className={`flex items-center gap-1 text-2xs font-semibold px-2.5 py-1.5 rounded-md transition ${
                    viewport === v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  aria-pressed={viewport === v}
                >
                  {v === 'desktop' ? <Monitor className="w-3.5 h-3.5" /> : v === 'tablet' ? <Tablet className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{viewportLabel[v]}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 text-2xs font-semibold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 transition"
              aria-label="Close preview"
            >
              <X className="w-3.5 h-3.5" />
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-200 p-4 flex justify-center">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ width: getPreviewViewportWidth(viewport), maxWidth: '100%' }}>
            <iframe
              srcDoc={html}
              title={`${template.name} - ${viewportLabel[viewport]} preview`}
              className="w-full border-0"
              style={{ height: '70vh' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}