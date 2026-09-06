'use client';

import React, { useState } from 'react';
import { X, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { type StorefrontTemplate } from '@bharatstore/shared/constants';

interface ApplyThemeDialogProps {
  template: StorefrontTemplate;
  onClose: () => void;
  onApplied: (templateId: string) => void;
}

export function ApplyThemeDialog({ template, onClose, onApplied }: ApplyThemeDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/storefront/builder/apply-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: template.id }),
      });
      const json = await res.json();
      if (json.success) {
        onApplied(template.id);
      } else {
        setError(json.error || 'Failed to apply theme');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to apply theme');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Apply ${template.name} theme`}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Apply &ldquo;{template.name}&rdquo;</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-700 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-2xs text-amber-800 leading-relaxed">
              This theme&rsquo;s layout and colors will replace your current builder draft.
              Your published storefront and product catalog are not affected. You can keep
              editing in the builder before publishing.
            </p>
          </div>

          <dl className="mt-4 space-y-2">
            <div className="flex justify-between text-2xs">
              <dt className="text-slate-500">Category</dt>
              <dd className="text-slate-700 font-semibold capitalize">{template.category}</dd>
            </div>
            <div className="flex justify-between text-2xs">
              <dt className="text-slate-500">Style</dt>
              <dd className="text-slate-700 font-semibold capitalize">{template.style}</dd>
            </div>
            <div className="flex justify-between text-2xs">
              <dt className="text-slate-500">Sections</dt>
              <dd className="text-slate-700 font-semibold">{template.preview.sections.length} configured</dd>
            </div>
          </dl>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-2xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertTriangle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-3 py-2 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={submitting}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 border border-amber-500 rounded-lg px-3 py-2 transition disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            {submitting ? 'Applying...' : 'Apply Theme'}
          </button>
        </div>
      </div>
    </div>
  );
}