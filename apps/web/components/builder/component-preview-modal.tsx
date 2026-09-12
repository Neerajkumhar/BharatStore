'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, Eye, Plus, Sparkles, Layers } from 'lucide-react';
import {
  COMPONENT_REGISTRY,
  STOREFRONT_GALLERY_CATEGORIES,
} from '@bharatstore/shared/constants';
import {
  COMPONENT_PREVIEW_REGISTRY,
  getComponentPreviewEntry,
  type ComponentPreviewEntry,
} from '@/lib/component-preview-registry';
import { StorefrontSectionPreview } from '@/components/storefront/storefront-section-preview';
import { getStoreSectionIcon } from './component-icons';

export type SectionAddPayload = Pick<ComponentPreviewEntry, 'id' | 'sectionType' | 'name' | 'config'>;

interface ComponentPreviewModalProps {
  entryId: string | null;
  onClose: () => void;
  onAddSection: (payload: SectionAddPayload) => void;
}

function industryLabel(category: string): string {
  return STOREFRONT_GALLERY_CATEGORIES.find((c) => c.id === category)?.label ?? category;
}

export function ComponentPreviewModal({ entryId, onClose, onAddSection }: ComponentPreviewModalProps) {
  const entry = entryId ? getComponentPreviewEntry(entryId) : undefined;
  const [selectedId, setSelectedId] = useState<string | null>(entryId);

  useEffect(() => setSelectedId(entryId), [entryId]);

  const active = selectedId ? getComponentPreviewEntry(selectedId) : entry;

  const siblingVariants = useMemo(
    () => (active ? COMPONENT_PREVIEW_REGISTRY.filter((e) => e.sectionType === active.sectionType) : []),
    [active]
  );

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onClose]);

  if (!active) return null;

  const Icon = getStoreSectionIcon(active.icon);
  const sectionDef = COMPONENT_REGISTRY[active.sectionType as keyof typeof COMPONENT_REGISTRY];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight truncate">{active.name}</h2>
                {active.variantLabel && (
                  <span className="text-3xs font-extrabold uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
                    {active.variantLabel}
                  </span>
                )}
                {active.isNew && (
                  <span className="text-3xs font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                    New
                  </span>
                )}
              </div>
              <p className="text-2xs text-slate-400 mt-0.5 truncate">{sectionDef?.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition shrink-0"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Live Preview */}
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" /> Live Preview
              <span className="normal-case font-medium text-slate-300">
                · rendered with {industryLabel(active.demoCategory)} demo data
              </span>
            </p>
            <div className="h-[52vh] min-h-72 max-h-[420px] rounded-xl overflow-hidden border border-slate-200 bg-white shadow-inner">
              <StorefrontSectionPreview
                fluid
                type={active.sectionType}
                config={active.config}
                demoCategory={active.demoCategory}
              />
            </div>
          </div>

          {/* Variant Switcher */}
          {siblingVariants.length > 1 && (
            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Variants
                <span className="normal-case font-medium text-slate-300">· {siblingVariants.length} for this component</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {siblingVariants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedId(v.id)}
                    className={`text-2xs font-bold px-3 py-1.5 rounded-full border transition ${
                      v.id === active.id
                        ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    {v.name}
                    {v.variantLabel ? ` · ${v.variantLabel}` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-1.5 text-2xs">
            <span className="font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {active.category}
            </span>
            {active.industries.slice(0, 4).map((ind) => (
              <span key={ind} className="text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                {industryLabel(ind)}
              </span>
            ))}
            {active.tags.slice(0, 5).map((tag) => (
              <span key={tag} className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/80">
          <div className="flex items-center gap-1.5 text-2xs text-slate-400 min-w-0">
            <Layers className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              Adds a real <span className="font-bold text-slate-600">{active.sectionType}</span> section with this variant&apos;s configuration
            </span>
          </div>
          <button
            onClick={() => {
              onAddSection({
                id: active.id,
                sectionType: active.sectionType,
                name: active.name,
                config: active.config,
              });
              onClose();
            }}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 text-2xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-2xs"
          >
            <Plus className="h-4 w-4" />
            Add {active.name}
          </button>
        </div>
      </div>
    </div>
  );
}