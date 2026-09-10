'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingCart, Store, Receipt, Users, BarChart3, Boxes } from 'lucide-react';
import { AnimationWrapper } from '@/components/storefront/primitives/animation-wrapper';

const capabilities = [
  { icon: Store, label: 'Storefront' },
  { icon: ShoppingCart, label: 'POS' },
  { icon: Boxes, label: 'Inventory' },
  { icon: Receipt, label: 'GST Billing' },
  { icon: Users, label: 'Khata' },
  { icon: BarChart3, label: 'Analytics' },
];

export function CtaSection() {
  return (
    <section className="py-20 sm:py-28 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <AnimationWrapper animation="fade-up">
          <div className="relative bg-slate-950 rounded-[2rem] p-10 sm:p-16 text-center overflow-hidden border border-slate-800">
            {/* Decorative layers */}
            <div className="absolute inset-0 bg-landing-grid opacity-40 mask-fade-b" />
            <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[640px] h-[320px] bg-amber-500/[0.12] rounded-full blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-[-140px] right-[-100px] w-[360px] h-[300px] bg-blue-600/[0.07] rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                Ready to unify your business?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
                Bring your storefront, counter billing, inventory, and GST invoicing onto one platform — built for Indian retail.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/onboarding"
                  className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-base shadow-lg shadow-amber-500/25 transition flex items-center gap-2 hover:shadow-amber-500/40 hover:-translate-y-0.5"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-base border border-white/10 transition"
                >
                  Explore Live Dashboard
                </Link>
              </div>

              {/* Capability chips (no fabricated numbers) */}
              <div className="mt-10 flex flex-wrap justify-center gap-2">
                {capabilities.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300"
                  >
                    <c.icon className="h-3.5 w-3.5 text-amber-400" />
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}