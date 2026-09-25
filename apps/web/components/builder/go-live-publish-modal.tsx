'use client';

import React, { useEffect, useState } from 'react';
import {
  X, Loader2, CheckCircle2, AlertTriangle, Globe, Copy, ExternalLink,
  Rocket, Check, Store, Phone, Mail, MapPin, Lock,
} from 'lucide-react';
import { buildLiveUrl, getPublicProtocol, getPlatformHostWithPort } from '@/lib/storefront-url';

const indianStates = [
  { code: '09', name: 'Uttar Pradesh' },
  { code: '27', name: 'Maharashtra' },
  { code: '07', name: 'Delhi' },
  { code: '29', name: 'Karnataka' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '19', name: 'West Bengal' },
  { code: '24', name: 'Gujarat' },
  { code: '08', name: 'Rajasthan' },
  { code: '06', name: 'Haryana' },
  { code: '10', name: 'Bihar' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '32', name: 'Kerala' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '03', name: 'Punjab' },
];

interface GoLiveTenant {
  id?: string;
  tradeName?: string;
  slug?: string;
  subdomain?: string | null;
  customDomain?: string | null;
  phone?: string;
  email?: string | null;
  addressLine1?: string;
  city?: string;
  stateCode?: string;
  pincode?: string;
  gstin?: string | null;
}

interface GoLivePublishModalProps {
  open: boolean;
  onClose: () => void;
  store: GoLiveTenant | null;
  onPublished: (liveUrl: string) => void;
}

export function GoLivePublishModal({ open, onClose, store, onPublished }: GoLivePublishModalProps) {
  const [tab, setTab] = useState<'details' | 'domain'>('details');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    tradeName: '',
    slug: '',
    subdomain: '',
    customDomain: '',
    phone: '',
    email: '',
    addressLine1: '',
    city: '',
    stateCode: '09',
    pincode: '',
    gstin: '',
  });

  useEffect(() => {
    if (!open) return;
    setTab('details');
    setError(null);
    setSubmitting(false);
    setCopied(false);
    setLiveUrl(null);

    const normalizedSub = store?.subdomain || store?.slug || '';
    setForm({
      tradeName: store?.tradeName || '',
      slug: store?.slug || '',
      subdomain: normalizedSub,
      customDomain: store?.customDomain || '',
      phone: store?.phone || '',
      email: store?.email || '',
      addressLine1: store?.addressLine1 || '',
      city: store?.city || '',
      stateCode: store?.stateCode || '09',
      pincode: store?.pincode || '',
      gstin: store?.gstin || '',
    });
  }, [open, store]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'subdomain') next = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (name === 'customDomain') next = value.replace(/^https?:\/\//, '').replace(/^www\./, '');
    setForm((prev) => ({ ...prev, [name]: next }));
  };

  const normalizeSubdomain = (v: string) => v.toLowerCase().replace(/[\s_]+/g, '-').replace(/^https?:\/\//, '');
  const normalizeCustomDomain = (v: string) =>
    v
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/\/$/, '')
      .replace(/^www\./, '');

  const subdomain = normalizeSubdomain(form.subdomain);
  const customDomain = normalizeCustomDomain(form.customDomain);
  const platformHost = getPlatformHostWithPort();
  const protocol = getPublicProtocol();
  const fallbackUrl = buildLiveUrl({ slug: form.slug || 'your-store' });

  const previewUrl = customDomain
    ? buildLiveUrl({ customDomain })
    : subdomain
    ? buildLiveUrl({ subdomain })
    : fallbackUrl;

  const handleCopy = async () => {
    if (!liveUrl) return;
    try {
      await navigator.clipboard.writeText(liveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleGoLive = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/storefront/builder/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          customDomain,
          tenant: {
            tradeName: form.tradeName,
            slug: form.slug,
            phone: form.phone,
            email: form.email,
            addressLine1: form.addressLine1,
            city: form.city,
            stateCode: form.stateCode,
            pincode: form.pincode,
            gstin: form.gstin,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setLiveUrl(json.data.liveUrl);
        onPublished(json.data.liveUrl);
      } else {
        setError(json.error || 'Failed to publish storefront');
      }
    } catch (err: any) {
      setError(err.message || 'Network error while publishing');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none';
  const labelClass = 'block text-xs font-semibold text-slate-700 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Go Live - Publish storefront">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={submitting ? undefined : onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-amber-500" />
              <h3 className="text-base font-black text-slate-900 tracking-tight">Go Live</h3>
            </div>
            <p className="text-2xs text-slate-500 mt-0.5">Publish your storefront &amp; claim your live URL</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-700 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {liveUrl ? (
          <div className="p-6 overflow-y-auto space-y-5">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-slate-900">Your store is live!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your storefront is now published and accessible to customers.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500">Live Store URL</label>
              <div className="flex items-center gap-2">
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 truncate text-sm font-mono font-bold text-amber-600 hover:text-amber-700 underline underline-offset-2"
                >
                  {liveUrl}
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition shrink-0"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              {customDomain && (
                <p className="text-2xs text-slate-500 flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <span>
                    Point your domain&apos;s <b>DNS CNAME</b> to <b className="font-mono">{platformHost}</b> (or an A
                    record to this server&apos;s IP) to finish connecting it.
                  </span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-4 py-2.5 transition"
              >
                Done
              </button>
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg px-4 py-2.5 transition"
              >
                <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
                Open Live Store
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="px-6 pt-4 shrink-0">
              <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/60 max-w-sm">
                <button
                  type="button"
                  onClick={() => setTab('details')}
                  className={`flex-1 text-2xs font-bold px-3 py-1.5 rounded-lg transition ${tab === 'details' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Store Details
                </button>
                <button
                  type="button"
                  onClick={() => setTab('domain')}
                  className={`flex-1 text-2xs font-bold px-3 py-1.5 rounded-lg transition ${tab === 'domain' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Domain &amp; Live URL
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {tab === 'details' ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Store Display Name *</label>
                      <input type="text" name="tradeName" value={form.tradeName} onChange={handleChange} placeholder="e.g. Rajesh Fabrics" className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Store Path (for {protocol}://{platformHost}/&lt;slug&gt;) — Optional</label>
                      <input type="text" name="slug" value={form.slug} onChange={handleChange} placeholder="e.g. rajesh-fabrics" className={inputClass + ' font-mono'} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Contact Phone *</label>
                        <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile" className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Store Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="care@yourstore.com" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Street Address *</label>
                      <input type="text" name="addressLine1" value={form.addressLine1} onChange={handleChange} placeholder="Building, street, landmark..." className={inputClass} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>City / Town *</label>
                        <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="City" className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>State *</label>
                        <select name="stateCode" value={form.stateCode} onChange={handleChange} className={inputClass + ' bg-white'} required>
                          {indianStates.map((st) => (
                            <option key={st.code} value={st.code}>{st.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Pincode *</label>
                        <input type="text" name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit" className={inputClass + ' font-mono'} required />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>GSTIN (Optional)</label>
                      <input type="text" name="gstin" value={form.gstin} onChange={handleChange} placeholder="15-digit GSTIN" className={inputClass + ' font-mono uppercase'} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                    <Globe className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-2xs text-amber-800 leading-relaxed">
                      Your store gets a free subdomain like <b className="font-mono">{form.slug || 'yourstore'}.{platformHost}</b>.
                      You can also connect a custom domain you already own.
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>Select your subdomain</label>
                    <div className="flex items-center">
                      <span className="bg-slate-100 border border-r-0 border-slate-300 text-slate-500 px-3 py-2 rounded-l-lg text-xs font-mono">
                        {protocol}://
                      </span>
                      <input
                        type="text"
                        name="subdomain"
                        value={form.subdomain}
                        onChange={handleChange}
                        placeholder="yourstore-name"
                        className="w-full px-3 py-2 border border-slate-300 border-r-0 text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <span className="bg-slate-100 border border-slate-300 text-slate-500 px-3 py-2 rounded-r-lg text-xs font-mono">
                        .{platformHost}
                      </span>
                    </div>
                    <p className="text-2xs text-slate-400 mt-1">Lowercase letters, numbers and hyphens only.</p>
                  </div>

                  <div>
                    <label className={labelClass}>Custom domain (optional)</label>
                    <div className="flex items-center">
                      <span className="bg-slate-100 border border-r-0 border-slate-300 text-slate-500 px-3 py-2 rounded-l-lg text-xs font-mono">{protocol}://</span>
                      <input
                        type="text"
                        name="customDomain"
                        value={form.customDomain}
                        onChange={handleChange}
                        placeholder="yourstore.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded-r-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-2xs text-slate-400 mt-1">Enter a bare domain like <b className="font-mono">yourstore.com</b></p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Your Live Store URL
                    </label>
                    <div className="flex items-center gap-2 text-sm font-mono font-bold text-amber-600 bg-white border border-slate-200 rounded-lg px-3 py-2.5">
                      <Globe className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">{previewUrl}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="px-6 pb-2 shrink-0">
                <div className="flex items-center gap-2 text-2xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              </div>
            )}

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setTab(tab === 'details' ? 'domain' : 'details')}
                className="text-2xs font-semibold text-amber-600 hover:text-amber-700 transition"
              >
                {tab === 'details' ? 'Next: Domain & Live URL →' : '← Back to Store Details'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-4 py-2.5 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGoLive}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg px-4 py-2.5 transition shadow-xs disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
                  {submitting ? 'Publishing...' : 'Go Live'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}