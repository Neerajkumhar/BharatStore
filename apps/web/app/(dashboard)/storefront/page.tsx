'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Store,
  ExternalLink,
  Save,
  CheckCircle2,
  Globe,
  Palette,
  Layout,
  Phone,
  Mail,
  MapPin,
  Clock,
  Share2,
  LayoutDashboard,
} from 'lucide-react';

export default function StorefrontSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    tradeName: '',
    slug: '',
    phone: '',
    email: '',
    addressLine1: '',
    city: '',
    stateCode: '',
    pincode: '',
    primaryColor: '#0f172a',
    accentColor: '#d97706',
    heroTitle: '',
    heroSubtitle: '',
    heroBannerUrl: '',
    logoUrl: '',
    description: '',
    businessHours: '',
    contactPhone: '',
    contactEmail: '',
    isPublished: true,
    socialInstagram: '',
    socialWhatsapp: '',
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/storefront');
        const json = await res.json();
        if (json.success) {
          const { tenant, theme } = json.data;
          setFormData({
            tradeName: tenant.tradeName || '',
            slug: tenant.slug || '',
            phone: tenant.phone || '',
            email: tenant.email || '',
            addressLine1: tenant.addressLine1 || '',
            city: tenant.city || '',
            stateCode: tenant.stateCode || '',
            pincode: tenant.pincode || '',
            primaryColor: theme.primaryColor || '#0f172a',
            accentColor: theme.accentColor || '#d97706',
            heroTitle: theme.heroTitle || `Welcome to ${tenant.tradeName}`,
            heroSubtitle: theme.heroSubtitle || 'Quality products delivered straight to your doorstep',
            heroBannerUrl: theme.heroBannerUrl || '',
            logoUrl: theme.logoUrl || '',
            description: theme.description || '',
            businessHours: theme.businessHours || 'Mon - Sat: 9:00 AM - 9:00 PM',
            contactPhone: theme.contactPhone || tenant.phone || '',
            contactEmail: theme.contactEmail || tenant.email || '',
            isPublished: theme.isPublished !== undefined ? theme.isPublished : true,
            socialInstagram: theme.socialLinks?.instagram || '',
            socialWhatsapp: theme.socialLinks?.whatsapp || '',
          });
        }
      } catch (err) {
        console.error('Failed to load storefront settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/storefront', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          socialLinks: {
            instagram: formData.socialInstagram,
            whatsapp: formData.socialWhatsapp,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Storefront settings updated successfully!');
      } else {
        setErrorMsg(json.error || 'Failed to update settings');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  const storefrontUrl = `/store/${formData.slug}`;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="h-5 w-5 text-amber-400" />
            <span className="bg-amber-500 text-slate-950 text-2xs font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Public D2C Storefront
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Online Storefront Settings</h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Configure your customer-facing digital store, domain slug, and branding theme
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/storefront/builder"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-100 transition shadow-xs border border-slate-200"
          >
            <Layout className="h-4 w-4" />
            <span>Open Builder</span>
          </Link>
          <Link
            href={storefrontUrl}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-amber-400 transition shadow-xs"
          >
            <Globe className="h-4 w-4" />
            <span>Launch Store</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-4 flex items-center gap-3 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-4 text-sm font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Store Metadata */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="h-5 w-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Store Profile & URL</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store Display Name</label>
              <input
                type="text"
                name="tradeName"
                value={formData.tradeName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store URL Slug</label>
              <div className="flex items-center">
                <span className="bg-slate-100 border border-r-0 border-slate-300 text-slate-500 px-3 py-2 rounded-l-lg text-xs font-mono">
                  /store/
                </span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-r-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Store About / Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Short introduction about your business, heritage, products, or values..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="h-4 w-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
            />
            <label htmlFor="isPublished" className="text-xs font-bold text-slate-800 cursor-pointer">
              Publish Online Storefront (Make accessible to public customers)
            </label>
          </div>
        </div>

        {/* Hero & Branding Theme */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Palette className="h-5 w-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Theme Colors & Hero Banner</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Theme Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="h-10 w-12 p-1 border border-slate-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Accent Highlight Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="accentColor"
                  value={formData.accentColor}
                  onChange={handleChange}
                  className="h-10 w-12 p-1 border border-slate-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="accentColor"
                  value={formData.accentColor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Title</label>
              <input
                type="text"
                name="heroTitle"
                value={formData.heroTitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Subtitle</label>
              <input
                type="text"
                name="heroSubtitle"
                value={formData.heroSubtitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Logo Image URL</label>
              <input
                type="text"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Banner Image URL</label>
              <input
                type="text"
                name="heroBannerUrl"
                value={formData.heroBannerUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact & Business Hours */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone className="h-5 w-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Customer Support & Hours</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Support Phone</label>
              <input
                type="text"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Operating Hours</label>
              <input
                type="text"
                name="businessHours"
                value={formData.businessHours}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Business Number</label>
              <input
                type="text"
                name="socialWhatsapp"
                value={formData.socialWhatsapp}
                onChange={handleChange}
                placeholder="+91..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram Handle</label>
              <input
                type="text"
                name="socialInstagram"
                value={formData.socialInstagram}
                onChange={handleChange}
                placeholder="@yourstore"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Storefront Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
