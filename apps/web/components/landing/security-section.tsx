'use client';

import { ShieldCheck, Users, ScrollText, Lock, UserRound, Database, Shield, Waypoints } from 'lucide-react';
import { AnimationWrapper } from '@/components/storefront/primitives/animation-wrapper';
import { SecurityCardMock } from './landing-previews';
import { SectionHeading } from './section-heading';

const securityFeatures = [
  {
    icon: ShieldCheck,
    title: 'Multi-Tenant Isolation',
    description: 'Every business operates in complete data isolation. Your data never touches another tenant.',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Owner, Manager, Staff — granular permissions control who sees and modifies what.',
  },
  {
    icon: ScrollText,
    title: 'Audit Logs',
    description: 'Every action is tracked with timestamps, user IDs, and full change history.',
  },
  {
    icon: Lock,
    title: 'Secure Authentication',
    description: 'JWT-based auth with hashed credentials and session management.',
  },
];

function ArchNode({
  icon: Icon,
  label,
  sub,
  tone = 'line',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub?: string;
  tone?: 'brand' | 'line';
}) {
  return (
    <div
      className={
        tone === 'brand'
          ? 'flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center min-w-[96px]'
          : 'flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-center min-w-[96px]'
      }
    >
      <span className={tone === 'brand' ? 'text-amber-400' : 'text-slate-400'}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-xs font-bold text-white">{label}</span>
      {sub && <span className="text-2xs text-slate-500">{sub}</span>}
    </div>
  );
}

function ArchConnector() {
  return (
    <div className="flex items-center" aria-hidden="true">
      <span className="h-px w-6 sm:w-10 bg-gradient-to-r from-slate-600 to-slate-500" />
      <span className="text-slate-500 text-xs font-black">›</span>
    </div>
  );
}

export function SecuritySection() {
  return (
    <section id="security" className="py-20 sm:py-28 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-landing-grid opacity-30 mask-fade-b" />
      <div className="absolute top-[-100px] right-[-120px] w-[440px] h-[380px] bg-emerald-600/[0.05] rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Security"
          title={
            <>
              Built with security{' '}
              <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">at the core.</span>
            </>
          }
          subtitle="Enterprise-grade isolation and access control for businesses of every size."
          variant="dark"
          className="mb-12"
        />

        {/* Architecture visual */}
        <AnimationWrapper animation="fade-up">
          <div className="relative rounded-3xl border border-white/10 bg-slate-950/60 backdrop-blur-sm p-6 sm:p-8 mb-10 overflow-hidden">
            <div className="absolute inset-0 bg-landing-dots opacity-30 mask-fade-b" />
            <div className="relative">
              <p className="text-2xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Waypoints className="h-3.5 w-3.5 text-amber-400" />
                Request flow · every tenant isolated end-to-end
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-0">
                <ArchNode icon={UserRound} label="Merchant login" sub="JWT session" />
                <ArchConnector />
                <ArchNode icon={Shield} label="Auth + RBAC" sub="role policy" />
                <ArchConnector />
                <ArchNode icon={Lock} label="Edge validation" sub="rate + sign" />
                <ArchConnector />
                <ArchNode icon={Database} label="Tenant DB" sub="row-scoped" tone="brand" />
                <ArchConnector />
                <ArchNode icon={Database} label="Scaled-out nodes" sub="shared kernel" />
              </div>
              <div className="grid sm:grid-cols-3 gap-2 mt-6">
                {['Tenant A', 'Tenant B', 'Tenant C'].map((t) => (
                  <div key={t} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-300">
                    <span className="font-bold">{t}</span>
                    <span className="text-2xs text-emerald-400 font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> isolated
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimationWrapper>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {securityFeatures.map((feature, i) => (
            <AnimationWrapper key={i} animation="fade-up">
              <SecurityCardMock {...feature} />
            </AnimationWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}