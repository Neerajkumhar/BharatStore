'use client';

import Link from 'next/link';
import { TrendingUp, ShoppingCart, Users, Boxes, ArrowRight, Star } from 'lucide-react';
import { AnimationWrapper } from '@/components/storefront/primitives/animation-wrapper';
import { AnalyticsChartMock } from './landing-previews';
import { CountUp } from './count-up';
import { SectionHeading } from './section-heading';
import { cn } from '@/lib/utils';

const kpis = [
  { icon: TrendingUp, label: 'Revenue', value: 840000, prefix: '₹', change: '+18.4%', tone: 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/20' },
  { icon: ShoppingCart, label: 'Orders', value: 1248, change: '+12%', tone: 'text-blue-400 bg-blue-500/10 ring-blue-500/20' },
  { icon: Users, label: 'Customers', value: 342, change: '+8%', tone: 'text-purple-400 bg-purple-500/10 ring-purple-500/20' },
  { icon: Boxes, label: 'Low Stock', value: 12, change: 'needs attention', warn: true, tone: 'text-amber-400 bg-amber-500/10 ring-amber-500/20' },
];

const topProducts = [
  { name: 'Cotton Kurta', units: 142, revenue: '₹1.28L', pct: 100 },
  { name: 'Silk Dupatta', units: 98, revenue: '₹44.1K', pct: 69 },
  { name: 'Printed Saree', units: 61, revenue: '₹73.2K', pct: 57 },
  { name: 'Brass Jewellery', units: 54, revenue: '₹17.3K', pct: 42 },
];

export function AnalyticsShowcase() {
  return (
    <section id="analytics" className="py-20 sm:py-28 bg-slate-950 border-t border-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-landing-grid opacity-30 mask-fade-b" />
      <div className="absolute top-[-100px] left-[-120px] w-[440px] h-[380px] bg-blue-600/[0.06] rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Analytics"
          title={
            <>
              See what your business is{' '}
              <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">really doing.</span>
            </>
          }
          subtitle="Real-time revenue, orders, customer growth, and inventory alerts — with payment and channel breakdowns."
          variant="dark"
          className="mb-14"
        />

        {/* KPI row */}
        <AnimationWrapper animation="fade-up">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-amber-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn('p-1.5 rounded-lg ring-1', kpi.tone)}>
                    <kpi.icon className="h-4 w-4" />
                  </span>
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                </div>
                <p className="text-2xl font-black text-white tabular-nums">
                  <CountUp value={kpi.value} prefix={kpi.prefix ?? ''} />
                </p>
                <p className={cn('text-2xs font-bold mt-1', kpi.warn ? 'text-amber-400' : 'text-emerald-400')}>
                  {kpi.warn ? '⚠ needs attention' : `↑ ${kpi.change}`}
                </p>
              </div>
            ))}
          </div>
        </AnimationWrapper>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
          <AnimationWrapper animation="fade-up">
            <AnalyticsChartMock className="w-full h-full" />
          </AnimationWrapper>

          {/* Top products */}
          <AnimationWrapper animation="fade-up">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)] overflow-hidden h-full">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  Top Products
                </span>
                <span className="text-2xs text-slate-400">This month</span>
              </div>
              <div className="p-5 space-y-4">
                {topProducts.map((p, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800">
                        <span className="text-slate-400 font-mono mr-1.5">#{i + 1}</span>
                        {p.name}
                      </span>
                      <span className="text-slate-500 tabular-nums">
                        {p.units} units · <span className="font-bold text-slate-900">{p.revenue}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          i === 0 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-slate-400'
                        )}
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
                <Link
                  href="/dashboard/analytics"
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition mt-2"
                >
                  Open full analytics
                  <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
                </Link>
              </div>
            </div>
          </AnimationWrapper>
        </div>
      </div>
    </section>
  );
}