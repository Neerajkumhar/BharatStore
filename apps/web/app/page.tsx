import Link from 'next/link';
import {
  Store,
  ShieldCheck,
  Receipt,
  QrCode,
  Boxes,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
              भा
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-white">
                Bharat<span className="text-amber-500">Store</span>
              </span>
              <span className="text-2xs text-slate-400 font-medium tracking-wide">
                Unified Commerce Engine for Bharat
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/onboarding"
              className="text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg shadow-xs transition flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Built for Indian Retailers, Wholesalers & Artisans</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Your Complete Business. <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              Storefront, POS & GST Billing.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Stop juggling Shopify, Khatabook, and spreadsheets. BharatStore unifies your online storefront, counter billing, real-time inventory, dynamic UPI QR codes, and GST tax invoices into one tenant-isolated platform.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
            >
              <span>Explore Live Dashboard Demo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm sm:text-base border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <span>Merchant Sign In</span>
            </Link>
          </div>

          {/* Quick Metrics Badge */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Sub-10s Counter Billing</p>
              <p className="text-lg font-bold text-white mt-1">Instant Walk-in POS</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Indian Tax Compliance</p>
              <p className="text-lg font-bold text-white mt-1">CGST / SGST / IGST</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Native Payment Rails</p>
              <p className="text-lg font-bold text-white mt-1">Dynamic UPI & QR</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Data Sovereignty</p>
              <p className="text-lg font-bold text-white mt-1">Multi-Tenant Isolation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered specifically for Indian commerce reality
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Every feature respects Indian trade workflows, tax rules, payment habits, and speed requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Store className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Omnichannel Storefront</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Publish a modern mobile-first web storefront under your brand domain or subdomain with instant checkout and WhatsApp order confirmations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Receipt className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">GST Invoicing Engine</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Automated HSN code calculation with auto-splitting into CGST + SGST (intra-state) or IGST (inter-state). Generates standard A4 and 80mm thermal receipts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Boxes className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Double-Entry Stock Ledger</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Never oversell again. Physical store sales and online orders share a unified real-time inventory ledger with audit tracking on every unit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <p>© 2026 BharatStore Technologies. All rights reserved. Secure Indian Cloud Infrastructure.</p>
      </footer>
    </div>
  );
}
