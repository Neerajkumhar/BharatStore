'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Store,
  MapPin,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { INDIAN_STATES } from '@bharatstore/shared/constants';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    legalName: '',
    tradeName: '',
    gstin: '',
    isCompositeScheme: false,
    slug: '',
    addressLine1: '',
    city: '',
    stateCode: '09', // Uttar Pradesh
    pincode: '',
    phone: '',
    upiVpa: '',
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      // Completed onboarding
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Quick fill sample for fast verification
  const handleAutoFill = () => {
    setFormData({
      legalName: 'Varanasi Weaves & Silks LLP',
      tradeName: 'Kashi Heritage Silks',
      gstin: '09AAECR1234F1Z5',
      isCompositeScheme: false,
      slug: 'kashi-heritage',
      addressLine1: '45 Chowk Ghat Road',
      city: 'Varanasi',
      stateCode: '09',
      pincode: '221001',
      phone: '9876543210',
      upiVpa: 'kashisilks@upi',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 font-black text-lg shadow-xs">
              भा
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              Bharat<span className="text-amber-600">Store</span>
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Register Your Business in Bharat
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Setup your integrated storefront, POS counter, and GST billing in minutes.
          </p>
        </div>

        {/* Wizard Steps Stepper */}
        <div className="mb-8 flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          {[
            { num: 1, label: 'Identity', icon: Building2 },
            { num: 2, label: 'Store URL', icon: Store },
            { num: 3, label: 'Location', icon: MapPin },
            { num: 4, label: 'Settlement', icon: CreditCard },
          ].map((item) => {
            const isDone = step > item.num;
            const isCurrent = step === item.num;
            const Icon = item.icon;

            return (
              <div key={item.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-xs ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-slate-900 text-amber-400 ring-4 ring-amber-100'
                      : 'bg-white text-slate-400 border border-slate-300'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={`text-3xs sm:text-2xs font-semibold mt-1.5 truncate max-w-[60px] xs:max-w-[75px] sm:max-w-none text-center ${
                    isCurrent ? 'text-slate-900 font-bold' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {/* Step 1: Identity */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Step 1: Business Identity & GST
                </h2>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="text-2xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Auto-fill Sample</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Legal Entity Name (As per PAN / GST) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  placeholder="e.g. Varanasi Weaves & Silks LLP"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trade Name / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tradeName}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                  placeholder="e.g. Kashi Heritage Silks"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GSTIN (15-digit Indian GST number)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  placeholder="e.g. 09AAECR1234F1Z5"
                  className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-2xs text-slate-400 mt-1">
                  Leave blank if your business is exempt or not registered under GST.
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isCompositeScheme}
                    onChange={(e) => setFormData({ ...formData, isCompositeScheme: e.target.checked })}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Enrolled in GST Composition Scheme (Issues &apos;Bill of Supply&apos;)</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Storefront URL */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                Step 2: Choose Your Store URL
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Storefront Handle / Subdomain *
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="kashi-heritage"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg text-xs font-medium text-slate-600 shrink-0">
                    .bharatstore.in
                  </span>
                </div>
                <p className="text-2xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Subdomain is currently available!</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 leading-relaxed">
                <p className="font-semibold text-slate-900">✨ Custom Domain Ready:</p>
                <p>
                  You can map your own domain (e.g. <code>www.kashiheritagesilks.com</code>) with free automated SSL certificates at any time in Business Settings.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Location & State Tax */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                Step 3: Primary Store & Tax Location
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operating State (For CGST/SGST determination) *
                </label>
                <select
                  value={formData.stateCode}
                  onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st.code} value={st.code}>
                      [{st.code}] {st.name}
                    </option>
                  ))}
                </select>
                <p className="text-2xs text-slate-400 mt-1">
                  Used by the billing engine to determine Intra-state (CGST+SGST) vs. Inter-state (IGST).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address Line *
                </label>
                <input
                  type="text"
                  required
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="e.g. 45 Chowk Ghat Road"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Varanasi"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PIN Code (6 digits) *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="221001"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Settlement */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                Step 4: Payment Settlement Details
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Merchant UPI ID (VPA) for Counter Dynamic QR *
                </label>
                <input
                  type="text"
                  value={formData.upiVpa}
                  onChange={(e) => setFormData({ ...formData, upiVpa: e.target.value })}
                  placeholder="yourstore@okhdfcbank or business@upi"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                />
                <p className="text-2xs text-slate-400 mt-1">
                  Used by your walk-in POS counter terminal to generate instant dynamic QR codes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-700" />
                  <span>Ready to Launch BharatStore</span>
                </p>
                <p className="text-2xs text-amber-800 leading-relaxed">
                  Clicking Complete Onboarding will provision your isolated tenant database, configure default GST tax slabs, and load your management dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 rounded-lg border border-slate-200 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition flex items-center gap-1.5"
            >
              <span>{step === 4 ? 'Complete Setup & Open Dashboard' : 'Next Step'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
