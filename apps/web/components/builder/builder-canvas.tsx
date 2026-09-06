'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  generateStorefrontPreviewHTML,
  getPreviewViewportWidth,
} from '../storefront/preview-html';

interface BuilderCanvasProps {
  slug: string;
  draftConfig: any;
  storeData: any;
  viewport: 'desktop' | 'tablet' | 'mobile';
}

export function BuilderCanvas({ slug, draftConfig, storeData, viewport }: BuilderCanvasProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  const sections = draftConfig?.sections || [];
  const theme = draftConfig?.theme || {};
  const visibleSections = sections
    .filter((s: any) => s.visible)
    .sort((a: any, b: any) => a.order - b.order);

  useEffect(() => {
    if (iframeRef.current) {
      setLoading(true);
      const html = generateStorefrontPreviewHTML(visibleSections, theme, storeData, slug);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;
    }
  }, [draftConfig, viewport]);

  return (
    <div className="flex-1 bg-slate-100 p-4 overflow-auto flex justify-center">
      <div
        className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 h-full"
        style={{ width: getPreviewViewportWidth(viewport), maxWidth: '100%' }}
      >
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Storefront Preview"
          onLoad={() => setLoading(false)}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="text-xs text-slate-400">Loading preview...</div>
          </div>
        )}
      </div>
    </div>
  );
}
