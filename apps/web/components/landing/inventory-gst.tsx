'use client';

import { Boxes, Receipt, RefreshCw } from 'lucide-react';
import { AnimationWrapper } from '@/components/storefront/primitives/animation-wrapper';
import { InventoryMock, GstInvoiceMock } from './landing-previews';
import { SectionHeading } from './section-heading';

export function InventoryGstSection() {
  return (
    <section id="inventory" className="py-20 sm:py-28 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Inventory · GST"
          title={
            <>
              Inventory and GST.{' '}
              <span className="text-amber-600">Connected.</span>
            </>
          }
          subtitle="Every sale updates inventory and billing automatically. No double entry, no mismatched ledgers."
          variant="light"
          className="mb-14"
        />

        <div className="grid lg:grid-cols-2 gap-8 items-center relative">
          <AnimationWrapper animation="fade-up">
            <div className="relative">
              <InventoryMock className="w-full" />
            </div>
          </AnimationWrapper>

          {/* Connector (desktop) */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex-col items-center gap-1">
            <div className="h-10 w-px bg-slate-300" />
            <div className="bg-white border border-slate-200 rounded-full shadow-lg px-3 py-1.5 flex items-center gap-1.5 text-2xs font-bold text-slate-700">
              <RefreshCw className="h-3 w-3 text-amber-600" />
              sale → −1 stock
            </div>
            <div className="h-10 w-px bg-slate-300" />
          </div>

          <AnimationWrapper animation="fade-up">
            <div className="relative">
              <GstInvoiceMock className="w-full" />
            </div>
          </AnimationWrapper>
        </div>

        {/* Benefit strip */}
        <AnimationWrapper animation="fade-up">
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              { icon: RefreshCw, title: 'Auto stock deduction', text: 'POS and online orders decrement stock instantly.' },
              { icon: Receipt, title: 'HSN auto-mapped', text: 'Correct HSN codes and tax slabs applied per product.' },
              { icon: Boxes, title: 'CGST / SGST / IGST', text: 'Inter- and intra-state splits calculated automatically.' },
            ].map((b, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl border border-slate-200 p-4 hover:border-amber-300 hover:shadow-md transition-all">
                <span className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-200/60 flex items-center justify-center shrink-0 mt-0.5">
                  <b.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">{b.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{b.text}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}