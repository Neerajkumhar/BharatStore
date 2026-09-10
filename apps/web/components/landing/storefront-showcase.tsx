'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, MonitorSmartphone, Globe, Package, Shapes, Tag, Lock, Truck } from 'lucide-react';
import { AnimationWrapper } from '@/components/storefront/primitives/animation-wrapper';
import { StorefrontMock } from './landing-previews';
import { cn } from '@/lib/utils';

const features = [
  { icon: Globe, text: 'Custom storefront on your own subdomain' },
  { icon: MonitorSmartphone, text: 'Mobile responsive by default' },
  { icon: Package, text: 'Product catalog with variants' },
  { icon: Shapes, text: 'Smart categories & collections' },
  { icon: Tag, text: 'Coupons & discount rules' },
  { icon: Lock, text: 'Secure checkout with UPI & COD' },
  { icon: Truck, text: 'Order tracking for customers' },
];

export function StorefrontShowcase() {
  return (
    <section id="storefront" className="py-20 sm:py-28 bg-canvas relative overflow-hidden">
      <div className="absolute inset-0 bg-landing-grid-light mask-fade-edges" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Visual */}
          <AnimationWrapper animation="fade-up">
            <div className="relative">
              <div className="absolute -inset-5 bg-amber-500/10 rounded-[2rem] blur-3xl -z-10" />
              <div className="rotate-[-1.5deg] hover:rotate-0 transition-transform duration-500">
                <StorefrontMock className="w-full" />
              </div>
              {/* Floating badge */}
              <div className="absolute -top-4 -right-3 sm:right-4 bg-slate-900 text-white rounded-xl px-4 py-2.5 shadow-xl shadow-black/25 flex items-center gap-2 border border-white/10 animate-float">
                <span className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold">Order placed</p>
                  <p className="text-2xs text-slate-400">UPI · Paid · Invoice #142</p>
                </div>
              </div>
            </div>
          </AnimationWrapper>

          {/* Right: Content */}
          <AnimationWrapper animation="fade-up">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-2xs font-bold uppercase tracking-[0.14em] text-amber-700 mb-4">
                Storefront
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-primary-900">
                Turn your business into a{' '}
                <span className="text-amber-600">digital storefront.</span>
              </h2>
              <p className="mt-4 text-base text-slate-500 leading-relaxed">
                Sell online without building from scratch. Your storefront is automatically synced with inventory, orders, and billing.
              </p>

              <ul className="mt-8 grid sm:grid-cols-1 gap-3">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-700">
                    <span className={cn('h-7 w-7 rounded-lg flex items-center justify-center shrink-0', 'bg-amber-50 text-amber-600 ring-1 ring-amber-200/60')}>
                      <f.icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-medium">{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/dashboard/storefront"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 transition hover:shadow-amber-500/35 hover:-translate-y-0.5"
              >
                <span>Explore Storefront</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </AnimationWrapper>
        </div>
      </div>
    </section>
  );
}