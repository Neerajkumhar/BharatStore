'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search, X, Plus, Eye, Sparkles, RotateCcw,
} from 'lucide-react';
import {
  COMPONENT_CATEGORIES,
  STOREFRONT_GALLERY_CATEGORIES,
  type ComponentCategory,
  type TemplateCategory,
} from '@bharatstore/shared/constants';
import {
  COMPONENT_PREVIEW_REGISTRY,
  ALL_INDUSTRIES,
  getRecommendedEntriesForIndustry,
  searchComponentPreviews,
  type ComponentPreviewEntry,
} from '@/lib/component-preview-registry';
import { StorefrontSectionPreview } from '@/components/storefront/storefront-section-preview';
import { getStoreSectionIcon } from './component-icons';
import {
  ComponentPreviewModal,
  type SectionAddPayload,
} from './component-preview-modal';

interface SectionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (payload: SectionAddPayload) => void;
  storeCategory?: TemplateCategory;
}

function industryLabel(category: string): string {
  return STOREFRONT_GALLERY_CATEGORIES.find((c) => c.id === category)?.label ?? category;
}

function MiniPreviewCard({
  entry,
  compact = false,
  onPreview,
  onUse,
}: {
  entry: ComponentPreviewEntry;
  compact?: boolean;
  onPreview: (entry: ComponentPreviewEntry) => void;
  onUse: (entry: ComponentPreviewEntry) => void;
}) {
  const Icon = getStoreSectionIcon(entry.icon);
  return (
    <div
      className={`relative flex flex-col rounded-xl border overflow-hidden bg-white transition ${
        compact ? 'w-52 shrink-0 border-slate-200' : 'border-slate-200 hover:border-amber-400 hover:shadow-md'
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onPreview(entry)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPreview(entry);
          }
        }}
        className={`group relative block w-full bg-slate-50 overflow-hidden focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
          compact ? 'h-28' : 'aspect-[16/10]'
        }`}
        aria-label={`Preview ${entry.name}`}
      >
        <div className="absolute inset-0">
          <StorefrontSectionPreview
            fluid
            type={entry.sectionType}
            config={entry.config}
            demoCategory={entry.demoCategory}
          />
        </div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-slate-950/30 flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1 text-2xs font-bold text-white bg-slate-950/70 px-2.5 py-1 rounded-lg">
            <Eye className="h-3 w-3" /> Preview
          </span>
        </div>
        {entry.isNew && (
          <span className="absolute top-1.5 left-1.5 z-10 text-3xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
            New
          </span>
        )}
      </div>

      <div className="p-2.5 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="p-1 bg-amber-50 text-amber-600 rounded-md shrink-0">
            <Icon className="h-3 w-3" />
          </div>
          <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 truncate">
            {entry.category}
          </span>
        </div>
        <h3 className="text-2xs font-bold text-slate-900 leading-snug">
          {entry.name}
          {entry.variantLabel && (
            <span className="ml-1 text-3xs font-semibold text-slate-400">· {entry.variantLabel}</span>
          )}
        </h3>
      </div>

      <div className="px-2.5 pb-2.5 flex gap-1.5">
        <button
          type="button"
          onClick={() => onPreview(entry)}
          className="flex-1 py-1.5 text-2xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition"
        >
          Preview
        </button>
        <button
          type="button"
          onClick={() => onUse(entry)}
          className="flex-1 py-1.5 text-2xs font-bold bg-slate-900 text-white rounded-lg hover:bg-amber-500 hover:text-slate-950 transition inline-flex items-center justify-center gap-1"
        >
          <Plus className="h-3 w-3" /> Use
        </button>
      </div>
    </div>
  );
}

export function SectionPickerModal({ isOpen, onClose, onAddSection, storeCategory }: SectionPickerModalProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<TemplateCategory | 'all'>(storeCategory ?? 'all');
  const [previewId, setPreviewId] = useState<string | null>(null);

  const recommended = useMemo(
    () => getRecommendedEntriesForIndustry(storeCategory ?? 'general', 4),
    [storeCategory]
  );

  useEffect(() => {
    if (storeCategory) setSelectedIndustry(storeCategory);
  }, [storeCategory]);

  if (!isOpen) return null;

  const categories = [{ id: 'all' as const, label: 'All Components' }, ...COMPONENT_CATEGORIES];
  const industries = [{ id: 'all' as const, label: 'All Industries' }, ...STOREFRONT_GALLERY_CATEGORIES];
  const industryId = (c: string) => c as TemplateCategory | 'all';
  const catId = (c: string) => c as ComponentCategory | 'all';

  const filtered = searchComponentPreviews({
    query: search,
    category: selectedCategory,
    industry: selectedIndustry,
  });

  const handleUse = (entry: ComponentPreviewEntry) => {
    onAddSection({
      id: entry.id,
      sectionType: entry.sectionType,
      name: entry.name,
      config: entry.config,
    });
    onClose();
  };

  const totalEntries = COMPONENT_PREVIEW_REGISTRY.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div>
            <h2 className="text-base font-bold tracking-tight">Component Marketplace</h2>
            <p className="text-2xs text-slate-400 mt-0.5">
              {totalEntries} real components · live previews · variant-aware
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-slate-50/80 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search components, variants, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(catId(cat.id))}
                className={`text-2xs font-bold px-3 py-1.5 rounded-full border whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {storeCategory && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 whitespace-nowrap">Industry:</span>
              {industries.map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => setSelectedIndustry(industryId(ind.id))}
                  className={`text-2xs font-bold px-3 py-1.5 rounded-full border whitespace-nowrap transition ${
                    selectedIndustry === ind.id
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {ind.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Recommended for industry */}
          {storeCategory && recommended.length > 0 && selectedIndustry === storeCategory && (
            <section>
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <h3 className="text-2xs font-extrabold uppercase tracking-wider text-slate-500">
                  Recommended for {industryLabel(storeCategory)}
                </h3>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {recommended.map((entry) => (
                  <MiniPreviewCard
                    key={entry.id}
                    entry={entry}
                    compact
                    onPreview={(e) => setPreviewId(e.id)}
                    onUse={handleUse}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Full grid */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xs font-extrabold uppercase tracking-wider text-slate-500">
                {selectedIndustry !== 'all' && selectedCategory === 'all' && !search
                  ? `${industryLabel(selectedIndustry)} components`
                  : 'All components'}
                <span className="ml-1.5 text-slate-300 font-semibold">({filtered.length})</span>
              </h3>
              {(search || selectedCategory !== 'all' || selectedIndustry !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedIndustry(storeCategory ?? 'all'); }}
                  className="text-3xs font-bold text-slate-400 hover:text-amber-600 inline-flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Reset filters
                </button>
              )}
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {filtered.map((entry) => (
                  <MiniPreviewCard
                    key={entry.id}
                    entry={entry}
                    onPreview={(e) => setPreviewId(e.id)}
                    onUse={handleUse}
                  />
                ))}
              </div>
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-xs font-medium">No components match your filters.</p>
                <button
                  onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedIndustry(storeCategory ?? 'all'); }}
                  className="text-2xs font-bold text-amber-600 hover:underline inline-flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Reset Filters
                </button>
              </div>
            )}
          </section>

          {/* Variant legend */}
          <p className="text-3xs text-slate-300 pb-1">
            {ALL_INDUSTRIES.length} industry data sets · {COMPONENT_PREVIEW_REGISTRY.filter((e) => e.variant).length}+ variants ·
            thumbnails render the real storefront component with demo data
          </p>
        </div>
      </div>

      {previewId && (
        <ComponentPreviewModal entryId={previewId} onClose={() => setPreviewId(null)} onAddSection={onAddSection} />
      )}
    </div>
  );
}