'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { EditableSectionList } from './editable-section-list';

interface SectionItem {
  id: string;
  type: string;
  config: Record<string, unknown>;
  visible: boolean;
  order: number;
}

interface BuilderCanvasProps {
  slug: string;
  draftConfig: {
    sections: SectionItem[];
    theme: Record<string, unknown>;
    templateId?: string | null;
  };
  storeData: any;
  viewport: 'desktop' | 'tablet' | 'mobile';
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onDuplicateSection?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  onDeleteSection?: (id: string) => void;
  onUpdateSection?: (id: string, config: Record<string, unknown>) => void;
}

export function BuilderCanvas({
  slug,
  draftConfig,
  storeData,
  viewport,
  selectedSectionId,
  onSelectSection,
  onReorder,
  onDuplicateSection,
  onToggleVisibility,
  onDeleteSection,
  onUpdateSection,
}: BuilderCanvasProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const sections = draftConfig?.sections || [];
  const theme = draftConfig?.theme || {};
  const templateId = draftConfig?.templateId || null;

  // Reset zoom when device changes
  useEffect(() => {
    setZoom(1);
  }, [viewport]);

  // Fit to available center width
  const fitToScreen = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const container = frame.parentElement as HTMLElement | null;
    if (!container) return;
    const avail = container.clientWidth - 48;
    const frameW = frame.offsetWidth;
    if (frameW <= 0) return;
    const fit = Math.max(0.3, Math.min(1, avail / frameW));
    setZoom(Math.round(fit * 100) / 100);
  }, []);

  const deviceWidth = viewport === 'desktop' ? 1280 : viewport === 'tablet' ? 768 : 390;

  const frameClasses = {
    desktop: 'rounded-xl border border-slate-200/80 bg-white shadow-xl',
    tablet: 'rounded-2xl border border-slate-200/80 bg-white shadow-xl',
    mobile: 'rounded-[36px] border-[10px] border-slate-900 bg-white shadow-xl ring-1 ring-slate-900/10',
  }[viewport];

  const handleReorder = onReorder || (() => {});
  const handleDuplicate = onDuplicateSection || (() => {});
  const handleToggle = onToggleVisibility || (() => {});
  const handleDelete = onDeleteSection || (() => {});
  const handleUpdate = onUpdateSection || (() => {});

  return (
    <div className="relative flex h-full flex-col bg-slate-200/50">
      {/* Viewer controls */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg border border-slate-200 shadow-sm p-1">
        <button
          onClick={() => setZoom((z) => Math.max(0.3, Math.round((z - 0.1) * 100) / 100))}
          title="Zoom out"
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="text-3xs font-bold text-slate-600 tabular-nums w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(1.5, Math.round((z + 0.1) * 100) / 100))}
          title="Zoom in"
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <div className="w-px h-4 bg-slate-200 mx-0.5" />
        <button
          onClick={fitToScreen}
          title="Fit to screen"
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable canvas surface */}
      <div className="relative flex-1 overflow-auto p-4 sm:p-6 custom-scrollbar">
        <div
          className="flex min-h-full items-start justify-center"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        >
          <div
            ref={frameRef}
            className={`relative transition-all duration-300 ${frameClasses} overflow-hidden`}
            style={{
              width: deviceWidth,
              maxWidth: viewport === 'mobile' ? 'calc(100% - 32px)' : '100%',
              minHeight: '900px',
            }}
          >
            {/* Real editable section components, just like the live store */}
            <EditableSectionList
              slug={slug}
              sections={sections}
              theme={theme}
              storeData={storeData || {}}
              templateId={templateId}
              selectedSectionId={selectedSectionId}
              onSelectSection={onSelectSection}
              onReorder={handleReorder}
              onDuplicateSection={handleDuplicate}
              onToggleVisibility={handleToggle}
              onDeleteSection={handleDelete}
              onUpdateSection={handleUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}