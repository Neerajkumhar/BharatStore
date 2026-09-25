'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BuilderToolbar } from '@/components/builder/builder-toolbar';
import { BuilderSidebar } from '@/components/builder/builder-sidebar';
import { BuilderCanvas } from '@/components/builder/builder-canvas';
import { BuilderSettings } from '@/components/builder/builder-settings';
import { BuilderWorkspace, type BuilderWorkspaceHandle } from '@/components/builder/builder-workspace';
import { SectionPickerModal } from '@/components/builder/section-picker-modal';
import { GoLivePublishModal } from '@/components/builder/go-live-publish-modal';
import { NewPageModal } from '@/components/builder/new-page-modal';
import type { SectionAddPayload } from '@/components/builder/component-preview-modal';
import { createDefaultSection, getTemplateById, buildTemplatePageConfig, type SectionType, type TemplateCategory } from '@bharatstore/shared/constants';
import { Layers, Sliders, Palette, Eye, X } from 'lucide-react';

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

interface PageMeta {
  id: string;
  title: string;
  slug: string;
  navLabel: string | null;
  showInMenu: boolean;
  order: number;
  status: string;
  updatedAt: string;
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

  // Undo / Redo History Stacks
  const [historyStack, setHistoryStack] = useState<BuilderState[]>([]);
  const [redoStack, setRedoStack] = useState<BuilderState[]>([]);

  const pushHistory = (newState: BuilderState) => {
    setHistoryStack((prev) => [...prev.slice(-20), builderState]);
    setRedoStack([]);
    setBuilderState(newState);
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [builderState, ...prev]);
    setBuilderState(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack((prev) => prev.slice(1));
    setHistoryStack((prev) => [...prev, builderState]);
    setBuilderState(next);
  };

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [hasPublished, setHasPublished] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showTheme, setShowTheme] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mobileActiveSheet, setMobileActiveSheet] = useState<'none' | 'sections' | 'edit' | 'theme'>('none');
  const [fullscreen, setFullscreen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const workspaceRef = useRef<BuilderWorkspaceHandle>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [slug, setSlug] = useState('rajesh-fabrics');
  const [showPublish, setShowPublish] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Multi-page state: the pages list, the page currently being edited, and the
  // new-page modal trigger. Home is the default active page.
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [activePage, setActivePage] = useState<{ type: 'home' } | { type: 'page'; id: string; slug: string }>({ type: 'home' });
  const [showNewPageModal, setShowNewPageModal] = useState(false);

  // Load builder state
  useEffect(() => {
    async function load() {
      const searchParams = new URLSearchParams(window.location.search);
      const themeParam = searchParams.get('theme');

      try {
        const res = await fetch('/api/admin/storefront/builder');
        const json = await res.json();
        if (json.success) {
          const { draftConfig, publishedConfig } = json.data;

          if (themeParam && (!draftConfig || !draftConfig.sections?.length || draftConfig.templateId !== themeParam)) {
            try {
              const built = buildTemplatePageConfig(themeParam);
              const newConfig = {
                sections: (built.sections as any) || [],
                theme: built.theme || {},
                seo: {},
                templateId: themeParam,
              };
              setBuilderState(newConfig);

              // Persist applied URL theme to DB draft so Live Preview matches.
              fetch('/api/admin/storefront/builder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config: newConfig }),
              }).catch(() => {});
            } catch (e) {
              console.error('Failed to build template from URL param:', e);
            }
          } else if (draftConfig && draftConfig.sections && draftConfig.sections.length > 0) {
            setBuilderState({
              sections: draftConfig.sections || [],
              theme: draftConfig.theme || {},
              seo: draftConfig.seo || {},
              templateId: draftConfig.templateId || themeParam || null,
            });
          }
          setHasPublished(!!publishedConfig);
        } else if (themeParam) {
          try {
            const built = buildTemplatePageConfig(themeParam);
            const newConfig = {
              sections: (built.sections as any) || [],
              theme: built.theme || {},
              seo: {},
              templateId: themeParam,
            };
            setBuilderState(newConfig);

            fetch('/api/admin/storefront/builder', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ config: newConfig }),
            }).catch(() => {});
          } catch (e) {
            console.error('Failed to build template from URL param:', e);
          }
        }

        const storeRes = await fetch('/api/admin/storefront');
        const storeJson = await storeRes.json();
        if (storeJson.success && storeJson.data?.tenant) {
          setStoreData(storeJson.data.tenant);
          if (storeJson.data.tenant.slug) {
            setSlug(storeJson.data.tenant.slug);
          }
        }

        const pagesRes = await fetch('/api/admin/storefront/pages');
        const pagesJson = await pagesRes.json();
        if (pagesJson.success) setPages(pagesJson.data.pages || []);
      } catch (err) {
        console.error('Failed to load builder:', err);
        if (themeParam) {
          try {
            const built = buildTemplatePageConfig(themeParam);
            setBuilderState({
              sections: (built.sections as any) || [],
              theme: built.theme || {},
              seo: {},
              templateId: themeParam,
            });
          } catch (e) {
            // ignore
          }
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Persist the active page's builder state to its own draft. Home → theme
  // builder route; a page → pages/[id] route with { config } (same shape).
  const persistCurrentDraft = useCallback(async (): Promise<boolean> => {
    const url = activePage.type === 'home'
      ? '/api/admin/storefront/builder'
      : `/api/admin/storefront/pages/${activePage.id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: builderState }),
    });
    return res.ok && (await res.json())?.success === true;
  }, [builderState, activePage]);

  // Auto-save with debounce
  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveState('unsaved');
    saveTimeoutRef.current = setTimeout(async () => {
      setSaveState('saving');
      try {
        const ok = await persistCurrentDraft();
        setSaveState(ok ? 'saved' : 'unsaved');
      } catch {
        setSaveState('unsaved');
      }
    }, 1000);
  }, [persistCurrentDraft]);

  useEffect(() => {
    if (!loading) scheduleSave();
  }, [builderState, loading, scheduleSave]);

  // Actions
  const handleSave = async () => {
    setSaveState('saving');
    try {
      const ok = await persistCurrentDraft();
      setSaveState(ok ? 'saved' : 'unsaved');
    } catch {
      setSaveState('unsaved');
    }
  };

  const handlePublish = async () => {
    // 1. Ensure latest builder state is saved to draft before opening Go-Live
    setSaveState('saving');
    try {
      await persistCurrentDraft();
      setSaveState('saved');
    } catch {
      setSaveState('unsaved');
    }
    setShowPublish(true);
  };

  const handlePreview = async () => {
    // Persist the latest builder state to draft first so the preview (which
    // renders draftConfig) reflects current edits — auto-save is debounced.
    setSaveState('saving');
    try {
      await persistCurrentDraft();
      setSaveState('saved');
    } catch {
      setSaveState('unsaved');
    }
    const pagePath = activePage.type === 'home' ? '' : `/${activePage.slug}`;
    if (slug) {
      window.open(`/store/${slug}${pagePath}?preview=true`, '_blank');
    }
  };

  // Load a page's draft into the builder (switching away from Home).
  const loadPageDraft = async (pageId: string) => {
    const res = await fetch(`/api/admin/storefront/pages/${pageId}`);
    const json = await res.json();
    if (json.success && json.data.page) {
      const d = json.data.page.draftConfig;
      setBuilderState({
        sections: d?.sections || [],
        theme: d?.theme || {},
        seo: d?.seo || {},
        templateId: d?.templateId || null,
      });
      setHistoryStack([]);
      setRedoStack([]);
    }
  };

  // Reload the Home theme draft (switching back from a page).
  const loadHomeDraft = async () => {
    const res = await fetch('/api/admin/storefront/builder');
    const json = await res.json();
    if (json.success && json.data.draftConfig) {
      setBuilderState({
        sections: json.data.draftConfig.sections || [],
        theme: json.data.draftConfig.theme || {},
        seo: json.data.draftConfig.seo || {},
        templateId: json.data.draftConfig.templateId || null,
      });
      setHistoryStack([]);
      setRedoStack([]);
    }
  };

  const handleSelectPage = async (value: string) => {
    await persistCurrentDraft();
    if (value === 'home') {
      await loadHomeDraft();
      setActivePage({ type: 'home' });
    } else {
      const p = pages.find((x) => x.id === value);
      if (!p) return;
      await loadPageDraft(p.id);
      setActivePage({ type: 'page', id: p.id, slug: p.slug });
    }
  };

  const handlePageCreated = async (page: PageMeta) => {
    setPages((prev) => [...prev, page].sort((a, b) => a.order - b.order));
    setActivePage({ type: 'page', id: page.id, slug: page.slug });
    await loadPageDraft(page.id);
  };

  const handleAddSection = (payload: SectionAddPayload) => {
    const defaultSec = createDefaultSection(payload.sectionType as SectionType);
    const maxOrder = builderState.sections.reduce((max, s) => Math.max(max, s.order), 0);
    const newSection: SectionItem = {
      id: `${payload.sectionType}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: payload.sectionType,
      config: { ...defaultSec.config, ...payload.config },
      visible: true,
      order: maxOrder + 10,
    };
    pushHistory({
      ...builderState,
      sections: [...builderState.sections, newSection],
    });
    setSelectedSectionId(newSection.id);
  };

  const handleDuplicateSection = (id: string) => {
    const target = builderState.sections.find((s) => s.id === id);
    if (!target) return;
    const newSection: SectionItem = {
      ...target,
      id: `${target.type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      config: JSON.parse(JSON.stringify(target.config)),
      order: target.order + 5,
    };
    pushHistory({
      ...builderState,
      sections: [...builderState.sections, newSection].sort((a, b) => a.order - b.order),
    });
    setSelectedSectionId(newSection.id);
  };

  const handleToggleVisibility = (id: string) => {
    pushHistory({
      ...builderState,
      sections: builderState.sections.map((s) =>
        s.id === id ? { ...s, visible: !s.visible } : s
      ),
    });
  };

  const handleDeleteSection = (id: string) => {
    pushHistory({
      ...builderState,
      sections: builderState.sections.filter((s) => s.id !== id),
    });
    if (selectedSectionId === id) setSelectedSectionId(null);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const sorted = [...builderState.sections].sort((a, b) => a.order - b.order);
    const [moved] = sorted.splice(fromIndex, 1);
    sorted.splice(toIndex, 0, moved);
    const reordered = sorted.map((s, idx) => ({ ...s, order: (idx + 1) * 10 }));
    pushHistory({ ...builderState, sections: reordered });
  };

  const handleUpdateSection = (id: string, config: Record<string, unknown>) => {
    pushHistory({
      ...builderState,
      sections: builderState.sections.map((s) => (s.id === id ? { ...s, config } : s)),
    });
  };

  const handleUpdateTheme = (newTheme: Record<string, unknown>) => {
    pushHistory({ ...builderState, theme: newTheme });
  };

  const selectedSection = builderState.sections.find((s) => s.id === selectedSectionId) || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading Store Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen w-full bg-slate-100 overflow-hidden">
      {/* Top Toolbar */}
      <BuilderToolbar
        slug={slug}
        saveState={saveState}
        hasPublished={hasPublished}
        onSave={handleSave}
        onPublish={handlePublish}
        viewport={viewport}
        onViewportChange={setViewport}
        onPreview={handlePreview}
        canUndo={historyStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        onToggleLeft={() => workspaceRef.current?.toggleLeft()}
        onToggleRight={() => workspaceRef.current?.toggleRight()}
        fullscreen={fullscreen}
        onToggleFullscreen={() => setFullscreen((v) => !v)}
        pages={pages}
        activePageValue={activePage.type === 'home' ? 'home' : activePage.id}
        onSelectPage={(value) => handleSelectPage(value)}
        onNewPage={() => setShowNewPageModal(true)}
      />

      {/* Main Resizable Studio Builder Workspace */}
      <BuilderWorkspace
        ref={workspaceRef}
        onPanelStateChange={({ leftOpen: lo, rightOpen: ro }) => {
          setLeftOpen(lo);
          setRightOpen(ro);
        }}
        left={
          <BuilderSidebar
            sections={builderState.sections}
            selectedSectionId={selectedSectionId}
            onSelectSection={(id) => { setSelectedSectionId(id); setShowTheme(false); }}
            onToggleVisibility={handleToggleVisibility}
            onDeleteSection={handleDeleteSection}
            onDuplicateSection={handleDuplicateSection}
            onReorder={handleReorder}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            templateId={builderState.templateId}
          />
        }
        right={
          <BuilderSettings
            section={selectedSection}
            theme={builderState.theme}
            onUpdateSection={handleUpdateSection}
            onUpdateTheme={handleUpdateTheme}
            showTheme={showTheme}
            onToggleTheme={() => setShowTheme(!showTheme)}
          />
        }
        center={
          <BuilderCanvas
            slug={slug}
            draftConfig={builderState}
            storeData={storeData || {}}
            viewport={viewport}
            selectedSectionId={selectedSectionId}
            onSelectSection={(id) => { setSelectedSectionId(id); setShowTheme(false); }}
            onReorder={handleReorder}
            onDuplicateSection={handleDuplicateSection}
            onToggleVisibility={handleToggleVisibility}
            onDeleteSection={handleDeleteSection}
            onUpdateSection={handleUpdateSection}
          />
        }
        leftLabel="Sections"
        rightLabel="Design"
        fullscreen={fullscreen}
      />

      {/* Mobile Bottom Navigation Toolbar (< 768px) */}
      <div className="md:hidden bg-slate-900 text-white border-t border-slate-800 px-4 py-2 flex items-center justify-around z-30 shadow-lg">
        <button
          onClick={() => setMobileActiveSheet('sections')}
          className="flex flex-col items-center gap-1 text-2xs font-bold text-slate-300 hover:text-amber-600"
        >
          <Layers className="h-4 w-4" />
          <span>Outline</span>
        </button>
        <button
          onClick={() => setMobileActiveSheet('edit')}
          className="flex flex-col items-center gap-1 text-2xs font-bold text-slate-300 hover:text-amber-600"
        >
          <Sliders className="h-4 w-4" />
          <span>Edit Section</span>
        </button>
        <button
          onClick={() => setMobileActiveSheet('theme')}
          className="flex flex-col items-center gap-1 text-2xs font-bold text-slate-300 hover:text-amber-600"
        >
          <Palette className="h-4 w-4" />
          <span>Theme</span>
        </button>
        <button
          onClick={handlePreview}
          className="flex flex-col items-center gap-1 text-2xs font-bold text-slate-300 hover:text-amber-600"
        >
          <Eye className="h-4 w-4" />
          <span>Live Store</span>
        </button>
      </div>

      {/* Mobile Bottom Sheet Drawer (< 768px) */}
      {mobileActiveSheet !== 'none' && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-t-2xl max-h-[80vh] h-[80vh] flex flex-col shadow-2xl overflow-hidden border-t border-slate-200">
            <div className="p-3 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">
                {mobileActiveSheet === 'sections' ? 'Sections List' : mobileActiveSheet === 'edit' ? 'Edit Selected Section' : 'Store Design Settings'}
              </span>
              <button
                onClick={() => setMobileActiveSheet('none')}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {mobileActiveSheet === 'sections' && (
                <BuilderSidebar
                  sections={builderState.sections}
                  selectedSectionId={selectedSectionId}
                  onSelectSection={(id) => { setSelectedSectionId(id); setMobileActiveSheet('edit'); }}
                  onToggleVisibility={handleToggleVisibility}
                  onDeleteSection={handleDeleteSection}
                  onDuplicateSection={handleDuplicateSection}
                  onReorder={handleReorder}
                  onOpenAddModal={() => { setMobileActiveSheet('none'); setIsAddModalOpen(true); }}
                  templateId={builderState.templateId}
                />
              )}

              {(mobileActiveSheet === 'edit' || mobileActiveSheet === 'theme') && (
                <BuilderSettings
                  section={mobileActiveSheet === 'edit' ? selectedSection : null}
                  theme={builderState.theme}
                  onUpdateSection={handleUpdateSection}
                  onUpdateTheme={handleUpdateTheme}
                  showTheme={mobileActiveSheet === 'theme'}
                  onToggleTheme={() => setShowTheme(!showTheme)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Section Picker Modal */}
      <SectionPickerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSection={handleAddSection}
        storeCategory={getTemplateById(builderState.templateId ?? '')?.category ?? 'general'}
      />

      {/* Go Live Publish Modal */}
      <GoLivePublishModal
        open={showPublish}
        onClose={() => setShowPublish(false)}
        store={storeData}
        onPublished={() => {
          setHasPublished(true);
        }}
      />

      {/* New Page Modal */}
      <NewPageModal
        open={showNewPageModal}
        onClose={() => setShowNewPageModal(false)}
        onCreated={handlePageCreated}
        defaultOrder={pages.length}
      />
    </div>
  );
}
