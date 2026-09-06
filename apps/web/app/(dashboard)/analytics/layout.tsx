import React, { Suspense } from 'react';
import { AnalyticsHeader } from '@/components/analytics/analytics-header';

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="h-32 bg-slate-900 animate-pulse rounded-xl mb-6" />}>
        <AnalyticsHeader />
      </Suspense>
      <div>{children}</div>
    </div>
  );
}
