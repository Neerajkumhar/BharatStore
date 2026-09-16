'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Flag,
  Plus,
  Pencil,
  Globe,
  ToggleLeft,
  ToggleRight,
  Archive,
  CheckCircle2,
  X,
  AlertCircle,
  Layers,
} from 'lucide-react';

interface FeatureFlag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  isPlatformWide: boolean;
  isActive: boolean;
  displayOrder: number;
  enabledCount: number;
  planCount: number;
  tenantCount: number;
}

interface FeatureForm {
  name: string;
  slug: string;
  description: string;
  category: string;
  isPlatformWide: boolean;
  isActive: boolean;
}

const emptyForm: FeatureForm = {
  name: '',
  slug: '',
  description: '',
  category: 'operations',
  isPlatformWide: false,
  isActive: true,
};

const categoryBadge: Record<string, string> = {
  inventory: 'bg-sky-50 text-sky-700 border-sky-200',
  orders: 'bg-violet-50 text-violet-700 border-violet-200',
  payments: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  staff: 'bg-amber-50 text-amber-700 border-amber-200',
  customer: 'bg-rose-50 text-rose-700 border-rose-200',
  growth: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  platform: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function SuperAdminFeatureFlagsPage() {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FeatureFlag | null>(null);
  const [form, setForm] = useState<FeatureForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/superadmin/features')
      .then((r) => r.json())
      .then((d) => d.success && setFeatures(d.data))
      .catch(() => setMessage({ type: 'error', text: 'Failed to load features' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const categories = Array.from(new Set(['platform', ...features.map((f) => f.category)]));

  const toggle = async (f: FeatureFlag, field: 'isPlatformWide' | 'isActive') => {
    const res = await fetch(`/api/superadmin/features/${f.id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field }),
    });
    const data = await res.json();
    if (data.success) {
      setFeatures((prev) => prev.map((p) => (p.id === f.id ? { ...p, [field]: data.data[field] } : p)));
    } else {
      setMessage({ type: 'error', text: data.error || 'Failed to toggle' });
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setMessage(null);
    setFormOpen(true);
  };

  const openEdit = (f: FeatureFlag) => {
    setEditing(f);
    setForm({
      name: f.name,
      slug: f.slug,
      description: f.description ?? '',
      category: f.category,
      isPlatformWide: f.isPlatformWide,
      isActive: f.isActive,
    });
    setMessage(null);
    setFormOpen(true);
  };

  const archive = async (f: FeatureFlag) => {
    if (!confirm(`Archive "${f.name}"? It will stop being applied to new signups.`)) return;
    const res = await fetch(`/api/superadmin/features/${f.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      setMessage({ type: 'success', text: data.message || 'Archived.' });
      load();
    } else {
      setMessage({ type: 'error', text: data.error || 'Failed to archive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...form,
        slug: form.slug.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      };
      const res = await fetch(editing ? `/api/superadmin/features/${editing.id}` : '/api/superadmin/features', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setMessage({ type: 'success', text: editing ? 'Feature updated.' : 'Feature created.' });
      setFormOpen(false);
      load();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500';
  const labelCls = 'block text-2xs font-bold text-slate-600 uppercase tracking-wider mb-1';

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Flag className="h-6 w-6 text-amber-500" />
            Feature Flags
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {features.filter((f) => f.isActive).length} active / {features.length} total feature capabilities
          </p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg">
          <Plus className="h-3.5 w-3.5" />
          New Feature
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-slate-200 rounded-xl" />)}
        </div>
      ) : (
        categories.map((category) => {
          const catFeatures = features.filter((f) => f.category === category);
          if (catFeatures.length === 0) return null;
          return (
            <div key={category} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2 capitalize">
                  <Layers className="h-3.5 w-3.5 text-slate-400" />
                  {category}
                </h2>
                <span className="text-2xs text-slate-400">{catFeatures.length} flags</span>
              </div>
              <div className="divide-y divide-slate-100">
                {catFeatures.map((f) => (
                  <div key={f.id} className={`p-4 flex items-center justify-between gap-4 ${f.isActive ? '' : 'opacity-60'}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-slate-900">{f.name}</p>
                        <span className="font-mono text-2xs text-slate-400">{f.slug}</span>
                        <span className={`text-2xs font-bold px-1.5 py-0.5 rounded border ${categoryBadge[f.category] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {f.category}
                        </span>
                        {f.isPlatformWide && (
                          <span className="inline-flex items-center gap-1 text-2xs font-bold px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
                            <Globe className="h-2.5 w-2.5" /> Platform-wide
                          </span>
                        )}
                        {!f.isActive && (
                          <span className="text-2xs font-bold px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">Archived</span>
                        )}
                      </div>
                      {f.description && <p className="text-xs text-slate-500 mt-1">{f.description}</p>}
                      <p className="text-2xs text-slate-400 mt-1.5">
                        In {f.planCount} plans · enabled for {f.enabledCount} / {f.tenantCount} tenants
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggle(f, 'isActive')}
                        title={f.isActive ? 'Deactivate' : 'Activate'}
                        className="p-1.5 rounded-lg hover:bg-slate-100"
                      >
                        {f.isActive ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5 text-slate-300" />}
                      </button>
                      <button
                        onClick={() => toggle(f, 'isPlatformWide')}
                        title="Platform-wide"
                        className={`p-1.5 rounded-lg ${f.isPlatformWide ? 'text-blue-600 bg-blue-50' : 'text-slate-300 hover:bg-slate-100'}`}
                      >
                        <Globe className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEdit(f)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => archive(f)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="Archive">
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-black text-slate-900">{editing ? 'Edit Feature' : 'Create New Feature'}</h2>
              <button onClick={() => setFormOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className={labelCls}>Feature Name</label>
                <input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Barcode Scanning" />
              </div>
              <div>
                <label className={labelCls}>Slug</label>
                <input required className={`${inputCls} font-mono`} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="barcode_scanning" />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {['inventory', 'orders', 'payments', 'staff', 'customer', 'growth', 'platform'].map((c) => (
                    <option key={c} value={c} className="capitalize">{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPlatformWide}
                  onChange={(e) => setForm({ ...form, isPlatformWide: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <Globe className="h-4 w-4 text-blue-500" />
                Platform-wide (available on every plan)
              </label>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                  Active
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg disabled:opacity-50">
                    {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Feature'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}