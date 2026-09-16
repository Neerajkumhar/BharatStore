'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, AlertCircle, Building2 } from 'lucide-react';

interface TenantFormData {
  legalName: string;
  tradeName: string;
  gstin: string;
  pan: string;
  phone: string;
  email: string;
  addressLine1: string;
  city: string;
  stateCode: string;
  pincode: string;
  isActive: boolean;
  isCompositeScheme: boolean;
}

const emptyForm: TenantFormData = {
  legalName: '',
  tradeName: '',
  gstin: '',
  pan: '',
  phone: '',
  email: '',
  addressLine1: '',
  city: '',
  stateCode: '',
  pincode: '',
  isActive: true,
  isCompositeScheme: false,
};

export default function SuperAdminTenantEditPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = typeof params.tenantId === 'string' ? params.tenantId : '';
  const [form, setForm] = useState<TenantFormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/superadmin/tenants/${tenantId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) throw new Error(d.error || 'Failed to load');
        const t = d.data;
        setForm({
          legalName: t.legalName ?? '',
          tradeName: t.tradeName ?? '',
          gstin: t.gstin ?? '',
          pan: t.pan ?? '',
          phone: t.phone ?? '',
          email: t.email ?? '',
          addressLine1: t.addressLine1 ?? '',
          city: t.city ?? '',
          stateCode: t.stateCode ?? '',
          pincode: t.pincode ?? '',
          isActive: t.isActive ?? true,
          isCompositeScheme: t.isCompositeScheme ?? false,
        });
      })
      .catch((e) => setMessage({ type: 'error', text: e.message }))
      .finally(() => setLoading(false));
  }, [tenantId]);

  useEffect(load, [load]);

  const update = (key: keyof TenantFormData, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/superadmin/tenants/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setMessage({ type: 'success', text: 'Business profile updated.' });
      setTimeout(() => router.push(`/superadmin/tenants/${tenantId}`), 800);
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-8 space-y-4 animate-pulse">
        <div className="h-8 w-52 bg-slate-200 rounded-lg" />
        <div className="h-72 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500';
  const labelCls = 'block text-2xs font-bold text-slate-600 uppercase tracking-wider mb-1';

  return (
    <div className="p-4 sm:p-8 max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push(`/superadmin/tenants/${tenantId}`)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to business
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-amber-500" /> Edit Business
          </h1>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}>
          <AlertCircle className="h-4 w-4" /> {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        {/* Business identity */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-4">Business Identity</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Legal Name</label>
              <input required className={inputCls} value={form.legalName} onChange={(e) => update('legalName', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Trade Name</label>
              <input required className={inputCls} value={form.tradeName} onChange={(e) => update('tradeName', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>GSTIN</label>
              <input className={`${inputCls} font-mono`} maxLength={15} placeholder="15-digit GSTIN" value={form.gstin} onChange={(e) => update('gstin', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>PAN</label>
              <input className={`${inputCls} font-mono uppercase`} maxLength={10} placeholder="10-char PAN" value={form.pan} onChange={(e) => update('pan', e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input required className={inputCls} value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" className={inputCls} value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Business Address</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Address Line</label>
              <input required className={inputCls} value={form.addressLine1} onChange={(e) => update('addressLine1', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>City</label>
              <input required className={inputCls} value={form.city} onChange={(e) => update('city', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>State Code</label>
              <input required className={`${inputCls} font-mono`} maxLength={2} placeholder="e.g. 09" value={form.stateCode} onChange={(e) => update('stateCode', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>PIN Code</label>
              <input required className={`${inputCls} font-mono`} maxLength={6} placeholder="6-digit" value={form.pincode} onChange={(e) => update('pincode', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Flags */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Configuration</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => update('isActive', e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm font-semibold text-slate-800">Business Active</span>
              <span className="text-2xs text-slate-400">Tenant can log in and transact</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isCompositeScheme}
                onChange={(e) => update('isCompositeScheme', e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm font-semibold text-slate-800">GST Composition Scheme</span>
              <span className="text-2xs text-slate-400">Issues bill of supply instead of tax invoice</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push(`/superadmin/tenants/${tenantId}`)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}