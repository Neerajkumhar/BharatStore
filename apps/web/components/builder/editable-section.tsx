'use client';

import React, { useRef, useCallback } from 'react';
import { GripVertical, ArrowUp, ArrowDown, Copy, Eye, EyeOff, Trash2 } from 'lucide-react';
import { COMPONENT_REGISTRY, type SectionType } from '@bharatstore/shared/constants';

interface SectionItem {
  id: string;
  type: string;
  config: Record<string, unknown>;
  visible: boolean;
  order: number;
}

interface EditableSectionProps {
  section: SectionItem;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: (id: string) => void;
  onEditImage: (sectionId: string, imgIndex: number, imgSrc: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}

export function EditableSection({
  section,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onEditImage,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onToggleVisibility,
  onDelete,
  children,
}: EditableSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleClickCapture = useCallback(
    (e: React.MouseEvent) => {
      const el = e.target as HTMLElement;

      // Toolbar clicks are handled by the toolbar itself.
      if (el.closest('[data-builder-section-toolbar]')) return;

      const img = el.closest('img');
      if (img) {
        e.preventDefault();
        e.stopPropagation();
        const src = (img as HTMLImageElement).getAttribute('src') || '';
        const allImgs = Array.from(wrapperRef.current?.querySelectorAll('img') || []);
        const idx = allImgs.indexOf(img as HTMLImageElement);
        onEditImage(section.id, idx, src);
        onSelect(section.id);
        return;
      }

      const anchor = el.closest('a[href]');
      if (anchor) {
        // Stay inside the builder — selecting the section instead of navigating.
        e.preventDefault();
        e.stopPropagation();
      }

      onSelect(section.id);
    },
    [section.id, onSelect, onEditImage]
  );

  const label = COMPONENT_REGISTRY[section.type as SectionType]?.label || section.type;

  return (
    <div
      ref={wrapperRef}
      data-builder-section={section.id}
      onClickCapture={handleClickCapture}
      className={`group/builder relative transition-shadow ${
        isSelected
          ? 'outline outline-2 outline-amber-500 outline-offset-2 z-10'
          : 'outline outline-0 outline-offset-2 outline-slate-300 hover:outline hover:outline-1'
      }`}
    >
      {children}

      {/* Selection chip */}
      <div
        className={`pointer-events-none absolute left-3 top-1 z-30 flex items-center gap-1 rounded-md px-2 py-1 text-3xs font-extrabold uppercase tracking-wider shadow-sm transition ${
          isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-900/85 text-white opacity-0 group-hover/builder:opacity-100'
        }`}
      >
        <GripVertical className="h-3 w-3" />
        <span>{label}</span>
      </div>

      {/* Section toolbar */}
      <div
        data-builder-section-toolbar
        className={`absolute right-3 top-2 z-30 flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-1 shadow-lg transition ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover/builder:opacity-100'
        }`}
      >
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoveUp(); }}
          disabled={isFirst}
          title="Move up"
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 transition"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoveDown(); }}
          disabled={isLast}
          title="Move down"
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 transition"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
        <div className="w-px h-4 bg-slate-200 mx-0.5" />
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDuplicate(); }}
          title="Duplicate section"
          className="p-1.5 rounded-md text-slate-500 hover:bg-amber-50 hover:text-amber-700 transition"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleVisibility(); }}
          title={section.visible ? 'Hide section' : 'Show section'}
          className={`p-1.5 rounded-md transition ${
            section.visible ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-300 hover:bg-slate-100'
          }`}
        >
          {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
          title="Delete section"
          className="p-1.5 rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}