'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BuilderToolbar } from '@/components/builder/builder-toolbar';
import { BuilderSidebar } from '@/components/builder/builder-sidebar';
import { BuilderCanvas } from '@/components/builder/builder-canvas';
import { BuilderSettings } from '@/components/builder/builder-settings';
import { BuilderWorkspace, type BuilderWorkspaceHandle } from '@/components/builder/builder-workspace';
import { SectionPickerModal } from '@/components/builder/section-picker-modal';
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
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load builder state
  useEffect(() => {
    async function load() {
      const searchParams = new URLSearchParams(window.location.search);
      const themeParam = searchParams.get('theme');
      const isApplied = searchParams.get('applied') === '1';

      try {
        const res = await fetch('/api/admin/storefront/builder');
        const json = await res.json();
        if (json.success) {
          const { draftConfig, publishedConfig } = json.data;

          if (themeParam && (isApplied || !draftConfig || !draftConfig.sections?.length || draftConfig.templateId !== themeParam)) {
            try {
              const built = buildTemplatePageConfig(themeParam);
              const newConfig = {
                sections: (built.sections as any) || [],
                theme: built.theme || {},
                seo: {},
                templateId: themeParam,
              };
              setBuilderState(newConfig);

              // Persist applied URL theme to DB draft & publish immediately so Live Preview & Live Store match 100%
              fetch('/api/admin/storefront/builder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config: newConfig }),
              })
                .then(() => {
                  if (isApplied) {
                    fetch('/api/admin/storefront/builder/publish', { method: 'POST' }).catch(() => {});
                  }
                })
                .catch(() => {});
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
            })
              .then(() => {
                if (isApplied) {
                  fetch('/api/admin/storefront/builder/publish', { method: 'POST' }).catch(() => {});
                }
              })
              .catch(() => {});
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
  }, [builderState, loading, scheduleSave]);

  // Actions
  const handleSave = async () => {
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
  };

  const handlePublish = async () => {
    if (!confirm('Publish draft to live store? This will make your storefront live.')) return;
    setSaveState('saving');
    try {
      // 1. Ensure latest builderState is saved to draft
      await fetch('/api/admin/storefront/builder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: builderState }),
      });
      setSaveState('saved');

      // 2. Publish draft to live store
      const res = await fetch('/api/admin/storefront/builder/publish', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setHasPublished(true);
        alert('Published successfully! Your store is now live.');
      } else {
        alert(json.error || 'Failed to publish');
      }
    } catch (err) {
      alert('Network error while publishing');
    }
  };

  const handlePreview = () => {
    if (slug) {
      window.open(`/store/${slug}?preview=true`, '_blank');
    }
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
    </div>
  );
}
