'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BuilderToolbar } from '@/components/builder/builder-toolbar';
import { BuilderSidebar } from '@/components/builder/builder-sidebar';
import { BuilderCanvas } from '@/components/builder/builder-canvas';
import { BuilderSettings } from '@/components/builder/builder-settings';
import { TemplateSelector } from '@/components/builder/template-selector';
import { createDefaultSection, type SectionType, getTemplateSections } from '@bharatstore/shared/constants';

interface SectionItem {
  id: string;
  type: string;
  config: Record<string, unknown>;
  visible: boolean;
  order: number;
}

interface BuilderState {
  sections: SectionItem[];
  theme: Record<string, unknown>;
  seo: Record<string, unknown>;
  templateId: string | null;
}

export default function StorefrontBuilderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [builderState, setBuilderState] = useState<BuilderState>({
    sections: [],
    theme: {},
    seo: {},
    templateId: null,
  });
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [hasPublished, setHasPublished] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showTheme, setShowTheme] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [storeData, setStoreData] = useState<any>(null);
  const [slug, setSlug] = useState('');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load builder state
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/storefront/builder');
        const json = await res.json();
        if (json.success) {
          const { draftConfig, publishedConfig, theme } = json.data;
          if (draftConfig) {
            setBuilderState({
              sections: draftConfig.sections || [],
              theme: draftConfig.theme || {},
              seo: draftConfig.seo || {},
              templateId: draftConfig.templateId || null,
            });
          }
          setHasPublished(!!publishedConfig);
        }

        const storeRes = await fetch('/api/admin/storefront');
        const storeJson = await storeRes.json();
        if (storeJson.success) {
          setStoreData(storeJson.data.tenant);
          setSlug(storeJson.data.tenant.slug);
        }
      } catch (err) {
        console.error('Failed to load builder:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Auto-save with debounce
  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveState('unsaved');
    saveTimeoutRef.current = setTimeout(async () => {
      setSaveState('saving');
      try {
        const res = await fetch('/api/admin/storefront/builder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config: builderState }),
        });
        const json = await res.json();
        if (json.success) setSaveState('saved');
        else setSaveState('unsaved');
      } catch {
        setSaveState('unsaved');
      }
    }, 1000);
  }, [builderState]);

  useEffect(() => {
    if (!loading) scheduleSave();
  }, [builderState]);

  // Warn about unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (saveState === 'unsaved') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [saveState]);

  const updateSection = useCallback((id: string, config: Record<string, unknown>) => {
    setBuilderState((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, config } : s)),
    }));
  }, []);

  const toggleVisibility = useCallback((id: string) => {
    setBuilderState((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)),
    }));
  }, []);

  const deleteSection = useCallback((id: string) => {
    setBuilderState((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }));
    if (selectedSectionId === id) setSelectedSectionId(null);
  }, [selectedSectionId]);

  const addSection = useCallback((type: SectionType) => {
    const section = createDefaultSection(type);
    section.order = builderState.sections.length;
    setBuilderState((prev) => ({
      ...prev,
      sections: [...prev.sections, section],
    }));
    setSelectedSectionId(section.id);
  }, [builderState.sections.length]);

  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    setBuilderState((prev) => {
      const sorted = [...prev.sections].sort((a, b) => a.order - b.order);
      const [moved] = sorted.splice(fromIndex, 1);
      sorted.splice(toIndex, 0, moved);
      return {
        ...prev,
        sections: sorted.map((s, i) => ({ ...s, order: i })),
      };
    });
  }, []);

  const updateTheme = useCallback((theme: Record<string, unknown>) => {
    setBuilderState((prev) => ({ ...prev, theme }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaveState('saving');
    try {
      const res = await fetch('/api/admin/storefront/builder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: builderState }),
      });
      const json = await res.json();
      if (json.success) setSaveState('saved');
    } catch {
      setSaveState('unsaved');
    }
  }, [builderState]);

  const handlePublish = useCallback(async () => {
    if (!confirm('Publish your storefront? This will make your changes live to customers.')) return;
    await handleSave();
    try {
      const res = await fetch('/api/admin/storefront/builder/publish', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setHasPublished(true);
        setSaveState('saved');
        alert('Storefront published successfully!');
      } else {
        alert(json.error || 'Failed to publish');
      }
    } catch (err: any) {
      alert('Failed to publish: ' + err.message);
    }
  }, [handleSave]);

  const handleTemplateSelect = useCallback(async (templateId: string) => {
    const sections = getTemplateSections(templateId);
    const template = (await import('@bharatstore/shared/constants')).getTemplateById(templateId);
    setBuilderState({
      sections,
      theme: template?.defaultTheme || {},
      seo: {},
      templateId,
    });
  }, []);

  const handlePreview = useCallback(() => {
    if (slug) {
      window.open(`/store/${slug}`, '_blank');
    }
  }, [slug]);

  const selectedSection = builderState.sections.find((s) => s.id === selectedSectionId) || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-8">
      <BuilderToolbar
        slug={slug}
        saveState={saveState}
        hasPublished={hasPublished}
        onSave={handleSave}
        onPublish={handlePublish}
        viewport={viewport}
        onViewportChange={setViewport}
        onPreview={handlePreview}
      />

      <div className="flex flex-1 overflow-hidden">
        <BuilderSidebar
          sections={builderState.sections}
          selectedSectionId={selectedSectionId}
          onSelectSection={(id) => { setSelectedSectionId(id); setShowTheme(false); }}
          onToggleVisibility={toggleVisibility}
          onDeleteSection={deleteSection}
          onReorder={reorderSections}
          onAddSection={addSection}
          templateId={builderState.templateId}
        />

        <BuilderCanvas
          slug={slug}
          draftConfig={builderState}
          storeData={storeData || {}}
          viewport={viewport}
        />

        <BuilderSettings
          section={selectedSection}
          theme={builderState.theme}
          onUpdateSection={updateSection}
          onUpdateTheme={updateTheme}
          showTheme={showTheme}
          onToggleTheme={() => setShowTheme(!showTheme)}
        />
      </div>

      <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between text-2xs text-slate-400">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowTemplateSelector(true)} className="font-semibold text-amber-600 hover:underline">
            Change Template
          </button>
          <button onClick={() => {
            if (confirm('Reset to template defaults? This will clear your current draft.')) {
              fetch('/api/admin/storefront/builder/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId: builderState.templateId || 'general' }),
              }).then(r => r.json()).then(json => {
                if (json.success) window.location.reload();
              });
            }
          }} className="hover:text-red-500 transition">
            Reset to Default
          </button>
        </div>
        <div>
          {builderState.sections.length} sections | {builderState.sections.filter((s) => s.visible).length} visible
        </div>
      </div>

      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelect}
        currentTemplateId={builderState.templateId}
      />
    </div>
  );
}
