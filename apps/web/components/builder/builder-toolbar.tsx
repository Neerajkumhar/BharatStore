'use client';

import React from 'react';
import {
  Save, Eye, Send, Undo2, Redo2, Monitor, Tablet, Smartphone, ChevronLeft, Loader2,
  LayoutGrid, SlidersHorizontal, Maximize2, Minimize2,
} from 'lucide-react';
import Link from 'next/link';

interface BuilderToolbarProps {
  slug: string;
  saveState: 'saved' | 'saving' | 'unsaved';
  hasPublished: boolean;
  onSave: () => void;
  onPublish: () => void;
  viewport: 'desktop' | 'tablet' | 'mobile';
  onViewportChange: (v: 'desktop' | 'tablet' | 'mobile') => void;
  onPreview: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  leftOpen?: boolean;
  rightOpen?: boolean;
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function BuilderToolbar({
  slug,
  saveState,
  hasPublished,
  onSave,
  onPublish,
  viewport,
  onViewportChange,
  onPreview,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  leftOpen = true,
  rightOpen = true,
  onToggleLeft,
  onToggleRight,
  fullscreen = false,
  onToggleFullscreen,
}: BuilderToolbarProps) {
  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-2.5 sm:px-4 shrink-0 shadow-2xs z-20">
      {/* Left Back Navigation & Branding */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {fullscreen ? (
          <button
            onClick={onToggleFullscreen}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-amber-600 transition shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden xs:inline">Exit Canvas</span>
          </button>
        ) : (
          <Link
            href="/storefront"
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-amber-600 transition shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Storefront</span>
          </Link>
        )}
        <div className="h-5 w-px bg-slate-200 hidden xs:block shrink-0" />
        <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate max-w-[100px] xs:max-w-[140px] sm:max-w-none">
          Store Builder
        </h1>

        {/* Undo / Redo Controls */}
        {!fullscreen && (
          <div className="hidden md:flex items-center gap-1 ml-1 border-l border-slate-200 pl-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 disabled:opacity-30 transition"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 disabled:opacity-30 transition"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Center: Panel toggles + Viewport Selector */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Sidebar toggles */}
        <div className="hidden md:flex items-center gap-1.5">
          <button
            onClick={onToggleLeft}
            title={`${leftOpen ? 'Hide' : 'Show'} Sections panel`}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-2xs font-bold transition ${
              leftOpen
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : 'border-slate-200 bg-slate-100 text-slate-400 hover:text-slate-700'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden xl:inline capitalize">Sections</span>
          </button>
          <button
            onClick={onToggleRight}
            title={`${rightOpen ? 'Hide' : 'Show'} Design panel`}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-2xs font-bold transition ${
              rightOpen
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : 'border-slate-200 bg-slate-100 text-slate-400 hover:text-slate-700'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden xl:inline capitalize">Design</span>
          </button>
        </div>

        <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/60 shadow-2xs">
          {([
            { key: 'desktop' as const, icon: Monitor, label: 'Desktop (1280px)' },
            { key: 'tablet' as const, icon: Tablet, label: 'Tablet (768px)' },
            { key: 'mobile' as const, icon: Smartphone, label: 'Mobile (390px)' },
          ]).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => onViewportChange(key)}
              className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-2xs font-extrabold transition ${
                viewport === key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
              title={label}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline capitalize">{key}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Actions: Fullscreen, Preview, Save, Publish */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          onClick={onToggleFullscreen}
          title={fullscreen ? 'Exit canvas mode' : 'Focus canvas (hide panels)'}
          className="hidden sm:inline-flex items-center p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
        >
          {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>

        <button
          onClick={onPreview}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition"
        >
          <Eye className="h-4 w-4 text-slate-500" />
          <span>Live Preview</span>
        </button>

        <button
          onClick={onSave}
          disabled={saveState === 'saving' || saveState === 'saved'}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition disabled:opacity-60 bg-white"
        >
          {saveState === 'saving' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
          ) : saveState === 'saved' ? (
            <span className="text-emerald-600 font-extrabold flex items-center gap-1 text-2xs sm:text-xs">
              <span>Saved</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </span>
          ) : (
            <>
              <Save className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-900 text-2xs sm:text-xs">Save</span>
            </>
          )}
        </button>

        <button
          onClick={onPublish}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 text-xs font-black bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition shadow-xs hover:shadow-md active:scale-95"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Publish</span>
        </button>
      </div>
    </div>
  );
}
