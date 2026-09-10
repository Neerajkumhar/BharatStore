'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AnimationWrapper } from '@/components/storefront/primitives/animation-wrapper';
import { CouponCardMock, CampaignsMock, CouponPerformanceMock } from './landing-previews';
import { SectionHeading } from './section-heading';

export function MarketingShowcase() {
  return (
    <section id="marketing" className="py-20 sm:py-28 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Marketing"
          title={
            <>
              Turn customers into{' '}
              <span className="text-amber-600">repeat customers.</span>
            </>
          }
          subtitle="Coupons, promotions, and campaign tracking built right in — no third-party tools needed."
          variant="light"
          className="mb-14"
        />

        <div className="grid md:grid-cols-3 gap-6">
          <AnimationWrapper animation="fade-up">
            <CouponCardMock className="w-full" />
          </AnimationWrapper>
          <AnimationWrapper animation="fade-up">
            <CampaignsMock className="w-full" />
          </AnimationWrapper>
          <AnimationWrapper animation="fade-up">
            <CouponPerformanceMock className="w-full" />
          </AnimationWrapper>
        </div>

        <AnimationWrapper animation="fade-up">
          <div className="mt-10 flex justify-center">
            <Link
              href="/dashboard/marketing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition hover:-translate-y-0.5"
            >
              <span>Open Marketing Hub</span>
              <ArrowRight className="h-4 w-4 text-amber-400" />
            </Link>
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}