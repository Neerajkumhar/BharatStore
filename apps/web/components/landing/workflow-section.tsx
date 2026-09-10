'use client';

import { Package, Boxes, ShoppingCart, ClipboardList, CreditCard, Receipt, Users, BarChart3 } from 'lucide-react';
import { AnimationWrapper } from '@/components/storefront/primitives/animation-wrapper';
import { WorkflowStep, WorkflowStepMobile } from './landing-previews';
import { SectionHeading } from './section-heading';

const steps = [
  { icon: Package, label: 'Product' },
  { icon: Boxes, label: 'Inventory' },
  { icon: ShoppingCart, label: 'Store / POS' },
  { icon: ClipboardList, label: 'Order' },
  { icon: CreditCard, label: 'Payment' },
  { icon: Receipt, label: 'GST Invoice' },
  { icon: Users, label: 'Customer' },
  { icon: BarChart3, label: 'Analytics' },
];

export function WorkflowSection() {
  return (
    <section className="py-20 sm:py-28 bg-canvas relative overflow-hidden">
      <div className="absolute inset-0 bg-landing-grid-light mask-fade-edges" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              From product to analytics.{' '}
              <span className="text-amber-600">Connected.</span>
            </>
          }
          subtitle="Every step in your business flow is unified in one platform — no spreadsheets, no bridges."
          variant="light"
          className="mb-14"
        />

        {/* Desktop: horizontal */}
        <AnimationWrapper animation="fade-up">
          <div className="hidden sm:flex items-center justify-center gap-0 overflow-x-auto pb-4">
            {steps.map((step, i) => (
              <WorkflowStep
                key={i}
                icon={step.icon}
                label={step.label}
                isLast={i === steps.length - 1}
              />
            ))}
          </div>
        </AnimationWrapper>

        {/* Mobile: vertical */}
        <AnimationWrapper animation="fade-up">
          <div className="sm:hidden space-y-0 pl-4 max-w-xs mx-auto">
            {steps.map((step, i) => (
              <WorkflowStepMobile
                key={i}
                icon={step.icon}
                label={step.label}
                isLast={i === steps.length - 1}
              />
            ))}
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}