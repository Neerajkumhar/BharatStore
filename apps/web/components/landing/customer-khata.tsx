'use client';

import { Users, ShoppingCart, Banknote, Wallet, BarChart3, BellRing } from 'lucide-react';
import { AnimationWrapper } from '@/components/storefront/primitives/animation-wrapper';
import { CustomerCardMock, KhataLedgerMock } from './landing-previews';
import { SectionHeading } from './section-heading';

const flow = [
  { icon: Users, label: 'Customer' },
  { icon: ShoppingCart, label: 'Order' },
  { icon: Banknote, label: 'Payment' },
  { icon: Wallet, label: 'Khata' },
  { icon: BarChart3, label: 'Analytics' },
];

export function CustomerKhataSection() {
  return (
    <section id="customers" className="py-20 sm:py-28 bg-slate-950 border-t border-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-landing-dots opacity-30 mask-fade-b" />
      <div className="absolute bottom-[-140px] left-[-120px] w-[420px] h-[360px] bg-purple-600/[0.06] rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Customers & Khata"
          title={
            <>
              Know your customers.{' '}
              <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">Not just your sales.</span>
            </>
          }
          subtitle="Profiles, purchase history, and outstanding Khata balances — connected to every order in one ledger."
          variant="dark"
          className="mb-14"
        />

        {/* Connection flow */}
        <AnimationWrapper animation="fade-up">
          <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
            {flow.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  <step.icon className="h-3.5 w-3.5 text-amber-400" />
                  {step.label}
                </span>
                {i < flow.length - 1 && <ArrowConnector />}
              </div>
            ))}
          </div>
        </AnimationWrapper>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <AnimationWrapper animation="fade-up">
            <CustomerCardMock className="w-full" />
          </AnimationWrapper>
          <AnimationWrapper animation="fade-up">
            <div className="relative">
              <KhataLedgerMock className="w-full" />
              <div className="absolute -top-4 -right-3 sm:right-6 bg-slate-900/85 backdrop-blur border border-white/10 rounded-xl px-3.5 py-2.5 shadow-xl shadow-black/30 flex items-center gap-2 animate-float-delayed">
                <span className="h-7 w-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <BellRing className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-white">Khata reminder</p>
                  <p className="text-2xs text-slate-400">₹3,200 due · 14 days</p>
                </div>
              </div>
            </div>
          </AnimationWrapper>
        </div>
      </div>
    </section>
  );
}

function ArrowConnector() {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2" aria-hidden="true">
      <span className="h-px w-4 sm:w-8 bg-gradient-to-r from-amber-400/0 via-amber-400/50 to-amber-400/0" />
      <ChevronArrow />
    </div>
  );
}

function ChevronArrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="text-amber-500">
      <path d="M2 6h7M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}