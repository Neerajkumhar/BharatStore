'use client';

import React from 'react';
import {
  Save, Eye, Send, Undo2, Redo2, Monitor, Tablet, Smartphone, ChevronLeft, Loader2,
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
}

export function BuilderToolbar({
  slug, saveState, hasPublished, onSave, onPublish, viewport, onViewportChange, onPreview,
}: BuilderToolbarProps) {
  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <Link href="/storefront" className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition">
          <ChevronLeft className="h-4 w-4" />
          <span>Storefront</span>
        </Link>
        <div className="h-5 w-px bg-slate-200" />
        <h1 className="text-sm font-bold text-slate-900">Store Builder</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Viewport Switcher */}
        <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5 mr-2">
          {([
            { key: 'desktop' as const, icon: Monitor, label: 'Desktop' },
            { key: 'tablet' as const, icon: Tablet, label: 'Tablet' },
            { key: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
          ]).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => onViewportChange(key)}
              className={`p-1.5 rounded-md transition ${viewport === key ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              title={label}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <button
          onClick={onPreview}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Preview</span>
        </button>

        <button
          onClick={onSave}
          disabled={saveState === 'saving' || saveState === 'saved'}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
        >
          {saveState === 'saving' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : saveState === 'saved' ? (
            <span className="text-emerald-600 font-bold">Saved</span>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>Save</span>
            </>
          )}
        </button>

        <button
          onClick={onPublish}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition shadow-xs"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Publish</span>
        </button>
      </div>
    </div>
  );
}
