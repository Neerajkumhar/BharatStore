'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, ShoppingCart, Boxes, PlayCircle } from 'lucide-react';
import { AnimationWrapper } from '@/components/storefront/primitives/animation-wrapper';
import { DashboardMock } from './landing-previews';
import { CountUp } from './count-up';
import { cn } from '@/lib/utils';

function HeroFloatCard({
  icon: Icon,
  label,
  value,
  change,
  tint,
  className,
  delayClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  prefix?: string;
  change: string;
  tint: string;
  className?: string;
  delayClass?: string;
}) {
  return (
    <div
      className={cn(
        'absolute z-20 bg-slate-950/85 backdrop-blur-xl border border-white/15 rounded-2xl px-4 py-3 shadow-2xl shadow-black/40',
        delayClass,
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg ring-1', tint)}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-2xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
          <p className="text-lg font-black text-white tabular-nums leading-tight">{value > 99999 ? '₹84,520' : value}</p>
          <p className={cn('text-2xs font-bold', change.startsWith('+') ? 'text-emerald-400' : 'text-amber-300')}>
            {change}
          </p>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative pt-14 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
      {/* Layered background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-landing-grid mask-fade-b" />
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[900px] h-[520px] bg-amber-500/[0.07] rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 right-[-160px] w-[500px] h-[400px] bg-blue-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-120px] left-[-160px] w-[420px] h-[360px] bg-emerald-600/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-14 lg:gap-12 items-center">
          {/* Left: Text */}
          <AnimationWrapper animation="fade-up">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Built for Indian Retailers & Wholesalers</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-black tracking-tight text-white leading-[1.05]">
                Your Complete Business.{' '}
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 bg-clip-text text-transparent">
                  Storefront, POS & GST Billing.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Stop juggling Shopify, Khatabook, and spreadsheets. BharatStore unifies your online storefront, counter billing, real-time inventory, and GST invoicing in one platform.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/35 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <span>Explore Live Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 transition flex items-center justify-center gap-2"
                >
                  <PlayCircle className="h-4 w-4 text-amber-400" />
                  <span>Merchant Sign In</span>
                </Link>
              </div>

              {/* Compact stat strip (mobile/tablet only — floating cards carry desktop) */}
              <div className="mt-8 lg:hidden">
                <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
                  {[
                    { icon: TrendingUp, label: '₹84,520 revenue', tint: 'text-emerald-400 bg-emerald-500/10' },
                    { icon: ShoppingCart, label: '128 orders today', tint: 'text-blue-400 bg-blue-500/10' },
                    { icon: Boxes, label: '12 low-stock alerts', tint: 'text-amber-400 bg-amber-500/10' },
                  ].map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
                      <s.icon className={cn('h-3.5 w-3.5', s.tint)} />
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </AnimationWrapper>

          {/* Right: Product visual */}
          <AnimationWrapper animation="scale">
            <div className="relative">
              {/* Backdrop panel */}
              <div className="absolute -inset-5 bg-gradient-to-br from-amber-500/15 via-transparent to-blue-500/10 rounded-[2rem] blur-2xl -z-10" />

              {/* Floating cards (desktop) */}
              <HeroFloatCard
                icon={TrendingUp}
                label="Revenue"
                value={84520}
                change="+18.4%"
                tint="text-emerald-500 bg-emerald-500/10 ring-emerald-500/20"
                className="hidden lg:flex -left-8 top-16 animate-float"
              />
              <HeroFloatCard
                icon={ShoppingCart}
                label="Orders"
                value={128}
                change="+12 today"
                tint="text-blue-500 bg-blue-500/10 ring-blue-500/20"
                className="hidden lg:flex -right-6 top-6 animate-float-delayed"
              />
              <HeroFloatCard
                icon={Boxes}
                label="Low Stock"
                value={12}
                change="needs restock"
                tint="text-amber-500 bg-amber-500/10 ring-amber-500/20"
                className="hidden lg:flex -right-8 bottom-14 animate-float-slow"
              />

              {/* Dashboard mock with subtle perspective */}
              <div className="lg:[transform:perspective(1400px)_rotateY(-7deg)_rotateX(2deg)] lg:origin-left transition-transform duration-500">
                <DashboardMock className="w-full" />
              </div>

              {/* Demo tag */}
              <div className="absolute bottom-3 right-3 z-20 hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-slate-950/70 backdrop-blur border border-white/10 text-2xs text-slate-300">
                Demo preview · sample data
              </div>
            </div>
          </AnimationWrapper>
        </div>
      </div>
    </section>
  );
}