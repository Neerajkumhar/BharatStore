'use client';

import Link from 'next/link';
import { ArrowRight, ScanLine, Zap, Banknote, BookOpen, Receipt, Gauge } from 'lucide-react';
import { AnimationWrapper } from '@/components/storefront/primitives/animation-wrapper';
import { PosMock } from './landing-previews';

const chips = [
  { icon: ScanLine, label: 'UPI' },
  { icon: Banknote, label: 'Cash' },
  { icon: BookOpen, label: 'Khata' },
  { icon: Receipt, label: 'GST' },
  { icon: Zap, label: 'Instant Invoice' },
];

const points = [
  'Scan barcode or search in under a second',
  'Attach a customer and their Khata balance',
  'Choose UPI, cash, card, or credit',
  'Invoice, receipt, and stock updated instantly',
];

export function PosShowcase() {
  return (
    <section id="pos" className="py-20 sm:py-28 bg-slate-950 border-t border-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-landing-grid opacity-30 mask-fade-b" />
      <div className="absolute top-[-80px] right-[-120px] w-[420px] h-[360px] bg-amber-500/[0.06] rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <AnimationWrapper animation="fade-up">
            <div className="order-2 lg:order-1">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-2xs font-bold uppercase tracking-[0.14em] text-amber-400 mb-4">
                POS
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.08]">
                Fast billing for{' '}
                <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">the counter.</span>
              </h2>
              <p className="mt-4 text-base text-slate-400 leading-relaxed">
                Built for fast-moving Indian retail. Ring up a sale, print the invoice, and update stock — all in one motion.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {chips.map((chip, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-200"
                  >
                    <chip.icon className="h-3.5 w-3.5 text-amber-400" />
                    {chip.label}
                  </span>
                ))}
              </div>

              <ul className="mt-7 space-y-3">
                {points.map((p, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="h-5 w-5 rounded-full bg-amber-500/15 text-amber-400 text-2xs font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-medium">{p}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard/pos"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 transition hover:shadow-amber-500/35 hover:-translate-y-0.5"
                >
                  <span>Try POS Billing</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="inline-flex items-center gap-2 text-xs text-slate-400">
                  <Gauge className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold">Sub-10s average checkout</span>
                </div>
              </div>
            </div>
          </AnimationWrapper>

          {/* Right: POS Visual */}
          <AnimationWrapper animation="scale">
            <div className="order-1 lg:order-2 relative max-w-md mx-auto w-full">
              <div className="absolute -inset-5 bg-amber-500/10 rounded-[2rem] blur-3xl -z-10" />
              <PosMock className="w-full" />
              <div className="absolute -top-5 -left-4 sm:-left-8 bg-slate-900/85 backdrop-blur border border-white/10 rounded-xl px-3.5 py-2.5 shadow-xl shadow-black/30 flex items-center gap-2 animate-float">
                <span className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-white">Stock updated</p>
                  <p className="text-2xs text-slate-400">CK-001 · -2 units</p>
                </div>
              </div>
            </div>
          </AnimationWrapper>
        </div>
      </div>
    </section>
  );
}