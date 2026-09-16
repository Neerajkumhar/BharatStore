'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  CreditCard,
  Plus,
  Pencil,
  Archive,
  Trash2,
  Check,
  CheckCircle2,
  X,
  IndianRupee,
  Package,
  ShoppingCart,
  Users,
  Database,
  ToggleLeft,
  AlertCircle,
} from 'lucide-react';

interface FeatureFlag {
  id: string;
  slug: string;
  name: string;
  category: string;
  isPlatformWide: boolean;
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  maxProducts: number;
  maxOrders: number;
  maxStaff: number;
  maxStorageMb: number;
  features: string[];
  featureSlugs: string[];
  isActive: boolean;
  displayOrder: number;
  activeSubscriptions: number;
}

interface PlanForm {
  name: string;
  slug: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  maxProducts: string;
  maxOrders: string;
  maxStaff: string;
  maxStorageMb: string;
  featureSlugs: string[];
  isActive: boolean;
  displayOrder: string;
}

const emptyForm: PlanForm = {
  name: '',
  slug: '',
  description: '',
  monthlyPrice: '0',
  annualPrice: '0',
  maxProducts: '50',
  maxOrders: '500',
  maxStaff: '3',
  maxStorageMb: '500',
  featureSlugs: [],
  isActive: true,
  displayOrder: '0',
};

export default function SuperAdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([fetch('/api/superadmin/plans').then((r) => r.json()), fetch('/api/superadmin/features').then((r) => r.json())])
      .then(([p, f]) => {
        if (p.success) setPlans(p.data);
        if (f.success) setFeatures(f.data);
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load plans' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const openCreate = () => {
    setEditingPlan(null);
    setForm(emptyForm);
    setMessage(null);
    setFormOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description ?? '',
      monthlyPrice: String(plan.monthlyPrice),
      annualPrice: String(plan.annualPrice),
      maxProducts: String(plan.maxProducts),
      maxOrders: String(plan.maxOrders),
      maxStaff: String(plan.maxStaff),
      maxStorageMb: String(plan.maxStorageMb),
      featureSlugs: plan.featureSlugs,
      isActive: plan.isActive,
      displayOrder: String(plan.displayOrder),
    });
    setMessage(null);
    setFormOpen(true);
  };

  const toggleFeature = (slug: string) => {
    setForm((f) => ({
      ...f,
      featureSlugs: f.featureSlugs.includes(slug) ? f.featureSlugs.filter((s) => s !== slug) : [...f.featureSlugs, slug],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        monthlyPrice: parseFloat(form.monthlyPrice) || 0,
        annualPrice: parseFloat(form.annualPrice) || 0,
        maxProducts: parseInt(form.maxProducts) || 0,
        maxOrders: parseInt(form.maxOrders) || 0,
        maxStaff: parseInt(form.maxStaff) || 0,
        maxStorageMb: parseInt(form.maxStorageMb) || 0,
        features: form.featureSlugs,
        isActive: form.isActive,
        displayOrder: parseInt(form.displayOrder) || 0,
      };

      const res = await fetch(editingPlan ? `/api/superadmin/plans/${editingPlan.id}` : '/api/superadmin/plans', {
        method: editingPlan ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      setMessage({ type: 'success', text: editingPlan ? 'Plan updated.' : 'Plan created.' });
      setFormOpen(false);
      load();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const archivePlan = async (plan: Plan) => {
    if (!confirm(`Archive "${plan.name}"? Existing subscribers will keep the plan.`)) return;
    try {
      const res = await fetch(`/api/superadmin/plans/${plan.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessage({ type: 'success', text: data.archived ? 'Plan archived.' : 'Plan deleted.' });
      load();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500';
  const labelCls = 'block text-2xs font-bold text-slate-600 uppercase tracking-wider mb-1';

  return (
    <div className="p-4 sm:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-amber-500" />
            Subscription Plans
          </h1>
          <p className="text-xs text-slate-500 mt-1">Pricing tiers offered to business owners.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
        >
          <Plus className="h-3.5 w-3.5" />
          New Plan
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-72 bg-slate-200 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div key={plan.id} className={`bg-white border rounded-xl overflow-hidden ${plan.isActive ? 'border-slate-200' : 'border-slate-200 opacity-70'}`}>
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
                    <p className="text-2xs text-slate-400 font-mono mt-0.5">{plan.slug}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(plan)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50" title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => archivePlan(plan)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="Archive">
                      {plan.activeSubscriptions > 0 ? <Archive className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <IndianRupee className="h-4 w-4 text-amber-500" />
                  <span className="text-3xl font-black text-slate-900">{plan.monthlyPrice.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-400 font-medium">/month</span>
                </div>
                {plan.annualPrice > 0 && (
                  <p className="text-2xs text-slate-400 mt-0.5">₹{plan.annualPrice.toLocaleString('en-IN')}/year · save {Math.round((1 - plan.annualPrice / (plan.monthlyPrice * 12)) * 100)}%</p>
                )}
                {plan.description && <p className="text-xs text-slate-500 mt-2">{plan.description}</p>}
                <span className={`inline-block mt-2 text-2xs font-bold px-2 py-0.5 rounded-full border ${plan.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  {plan.isActive ? 'Active' : 'Archived'}
                </span>
                <span className="inline-block ml-1.5 text-2xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {plan.activeSubscriptions} subscribers
                </span>
              </div>

              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Products', value: plan.maxProducts === -1 ? '∞' : plan.maxProducts.toLocaleString('en-IN'), icon: Package },
                    { label: 'Orders', value: plan.maxOrders === -1 ? '∞' : plan.maxOrders.toLocaleString('en-IN'), icon: ShoppingCart },
                    { label: 'Staff', value: plan.maxStaff === -1 ? '∞' : plan.maxStaff.toLocaleString('en-IN'), icon: Users },
                    { label: 'Storage', value: plan.maxStorageMb === -1 ? '∞' : `${plan.maxStorageMb.toLocaleString('en-IN')} MB`, icon: Database },
                  ].map((r) => (
                    <div key={r.label} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-1.5 text-2xs text-slate-400 mb-1">
                        <r.icon className="h-3 w-3" />
                        {r.label}
                      </div>
                      <p className="text-sm font-bold text-slate-800">{r.value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <ToggleLeft className="h-3 w-3" /> Features ({plan.featureSlugs.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.featureSlugs.map((f) => (
                      <span key={f} className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                        <Check className="h-2.5 w-2.5" /> {f.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {plan.featureSlugs.length === 0 && <span className="text-2xs text-slate-400">No features</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-black text-slate-900">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
              <button onClick={() => setFormOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Plan Name</label>
                  <input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Premium" />
                </div>
                <div>
                  <label className={labelCls}>Slug</label>
                  <input required className={`${inputCls} font-mono`} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} placeholder="premium" disabled={!!editingPlan} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Monthly Price (₹)</label>
                  <input type="number" min={0} className={inputCls} value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Annual Price (₹)</label>
                  <input type="number" min={0} className={inputCls} value={form.annualPrice} onChange={(e) => setForm({ ...form, annualPrice: e.target.value })} />
                </div>
              </div>

              <div>
                <p className={labelCls}>Limits <span className="text-slate-400 normal-case">(-1 = unlimited)</span></p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'maxProducts' as const, label: 'Products' },
                    { key: 'maxOrders' as const, label: 'Orders/month' },
                    { key: 'maxStaff' as const, label: 'Staff' },
                    { key: 'maxStorageMb' as const, label: 'Storage (MB)' },
                  ].map((r) => (
                    <div key={r.key}>
                      <label className={labelCls}>{r.label}</label>
                      <input type="number" className={inputCls} value={form[r.key]} onChange={(e) => setForm({ ...form, [r.key]: e.target.value })} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className={labelCls}>Included Features</p>
                <div className="grid sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {features.map((f) => (
                    <label key={f.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${form.featureSlugs.includes(f.slug) ? 'bg-emerald-50 border-emerald-300' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input
                        type="checkbox"
                        checked={form.featureSlugs.includes(f.slug)}
                        onChange={() => toggleFeature(f.slug)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-semibold text-slate-700">{f.name}</span>
                      {f.isPlatformWide && <span className="ml-auto text-2xs font-bold text-blue-600">Always</span>}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                  Active & available
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg disabled:opacity-50">
                    {saving ? 'Saving...' : editingPlan ? 'Save Changes' : 'Create Plan'}
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