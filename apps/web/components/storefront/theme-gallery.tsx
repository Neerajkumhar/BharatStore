'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LayoutGrid } from 'lucide-react';
import {
  STOREFRONT_TEMPLATES,
  getGalleryCategories,
  searchTemplates,
  filterTemplates,
  sortTemplates,
  type StorefrontTemplate,
  type TemplateSortKey,
} from '@bharatstore/shared/constants';
import { ThemeCard } from './theme-card';
import { ThemePreviewModal } from './theme-preview-modal';
import { ApplyThemeDialog } from './apply-theme-dialog';

interface ThemeGalleryProps {
  currentTemplateId: string | null;
}

export function ThemeGallery({ currentTemplateId }: ThemeGalleryProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<TemplateSortKey>('featured');
  const [previewTemplate, setPreviewTemplate] = useState<StorefrontTemplate | null>(null);
  const [applyTemplate, setApplyTemplate] = useState<StorefrontTemplate | null>(null);

  const categories = useMemo(() => getGalleryCategories(), []);

  const filtered = useMemo(() => {
    let list = searchTemplates(STOREFRONT_TEMPLATES, query);
    if (category) list = filterTemplates(list, { category });
    return sortTemplates(list, sort);
  }, [query, category, sort]);

  const handleApplied = (templateId: string) => {
    setApplyTemplate(null);
    router.push(`/storefront/builder?theme=${templateId}&applied=1`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-amber-500" />
            Theme Gallery
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse {STOREFRONT_TEMPLATES.length} professionally designed themes. Preview each theme,
            then apply one to your storefront draft.
          </p>
        </div>
        <div className="relative md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search themes by name, category or style..."
            className="w-full text-sm bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Search themes"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
              category === null
                ? 'text-white bg-amber-500 border-amber-500'
                : 'text-slate-600 bg-white border-slate-200 hover:border-amber-300'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(category === cat.id ? null : cat.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize transition ${
                category === cat.id
                  ? 'text-white bg-amber-500 border-amber-500'
                  : 'text-slate-600 bg-white border-slate-200 hover:border-amber-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <label htmlFor="sort" className="text-2xs font-semibold text-slate-500 uppercase tracking-wide">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as TemplateSortKey)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="featured">Featured</option>
            <option value="popular">Most popular</option>
            <option value="newest">Newest</option>
            <option value="az">Name (A–Z)</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-300 rounded-xl bg-white">
          <p className="text-sm font-semibold text-slate-600">No themes match your search</p>
          <p className="text-xs text-slate-400 mt-1">Try a different keyword or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((template) => (
            <ThemeCard
              key={template.id}
              template={template}
              isCurrent={template.id === currentTemplateId}
              onPreview={setPreviewTemplate}
              onUse={setApplyTemplate}
            />
          ))}
        </div>
      )}

      {previewTemplate && (
        <ThemePreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} />
      )}

      {applyTemplate && (
        <ApplyThemeDialog
          template={applyTemplate}
          onClose={() => setApplyTemplate(null)}
          onApplied={handleApplied}
        />
      )}
    </div>
  );
}