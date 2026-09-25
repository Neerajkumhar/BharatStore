'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

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

interface NewPageForm {
  title: string;
  slug: string;
  navLabel: string;
  showInMenu: boolean;
  order: number;
}

interface NewPageModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (page: PageMeta) => void;
  defaultOrder: number;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function NewPageModal({ open, onClose, onCreated, defaultOrder }: NewPageModalProps) {
  const [form, setForm] = useState<NewPageForm>({ title: '', slug: '', navLabel: '', showInMenu: true, order: defaultOrder });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const updateTitle = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: f.slug === '' || f.slug === slugify(f.title) ? slugify(title) : f.slug,
    }));
  };

  const submit = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/storefront/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug || slugify(form.title),
          navLabel: form.navLabel || null,
          showInMenu: form.showInMenu,
          order: form.order,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to create page.');
        return;
      }
      onCreated(json.data.page);
      setForm({ title: '', slug: '', navLabel: '', showInMenu: true, order: defaultOrder });
      onClose();
    } catch {
      setError('Failed to create page.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500';
  const labelCls = 'block text-2xs font-bold text-slate-600 uppercase tracking-wide mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="text-sm font-black tracking-tight">Create New Page</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-md text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className={labelCls}>Page Title</label>
            <input value={form.title} onChange={(e) => updateTitle(e.target.value)} placeholder="e.g. About Us" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })} placeholder="about-us" className={inputCls} />
            <p className="text-2xs text-slate-400 mt-1">Lowercase letters, numbers and hyphens. Shown as /store/{'{slug}'}/{'{pageSlug}'}</p>
          </div>
          <div>
            <label className={labelCls}>Nav Label (optional)</label>
            <input value={form.navLabel} onChange={(e) => setForm({ ...form, navLabel: e.target.value })} placeholder="Defaults to title" className={inputCls} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input type="checkbox" checked={form.showInMenu} onChange={(e) => setForm({ ...form, showInMenu: e.target.checked })} className="h-4 w-4 rounded border-slate-300 focus:ring-amber-500" />
              Show in store navbar
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span>Order</span>
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 0 })} className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-lg" />
            </label>
          </div>
          {error && <p className="text-xs font-bold text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">
              Cancel
            </button>
            <button onClick={submit} disabled={saving || !form.title.trim()} className="px-4 py-2 text-xs font-black bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition disabled:opacity-50">
              {saving ? 'Creating…' : 'Create Page'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}