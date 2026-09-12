import React from 'react';
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, FlaskConical } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export type StatIconTone = 'amber' | 'blue' | 'purple' | 'rose';

const iconToneStyles: Record<StatIconTone, string> = {
  amber: 'bg-amber-50 text-amber-600',
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  rose: 'bg-rose-50 text-rose-600',
};

export interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  iconTone?: StatIconTone;
  trend?: { direction: 'up' | 'down'; label: string; positive?: boolean };
  hint?: string;
  demo?: boolean;
  href?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  iconTone = 'amber',
  trend,
  hint,
  demo,
  href,
  className,
}: StatCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</h2>
        <div
          className={cn('h-9 w-9 rounded-lg flex items-center justify-center', iconToneStyles[iconTone])}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{value}</span>
        {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
      </div>
      <div className="mt-2 min-h-[1.25rem]">
        {trend ? (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <TrendGlyph direction={trend.direction} positive={trend.positive} />
            <span
              className={cn(trend.positive === false ? 'text-rose-600' : 'text-emerald-600')}
            >
              {trend.label}
            </span>
          </div>
        ) : hint ? (
          <p className="text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    </>
  );

  return (
    <Card className={cn('p-5', href && 'hover:border-slate-300', className)}>
      <CardContent className="p-0">
        {href ? (
          <Link href={href} className="block h-full" aria-label={label}>
            {content}
          </Link>
        ) : (
          content
        )}
        {demo && (
          <div className="mt-3 flex items-center gap-1 text-2xs font-medium text-slate-400">
            <FlaskConical className="h-3 w-3" aria-hidden="true" />
            Demo data
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TrendGlyph({
  direction,
  positive,
}: {
  direction: 'up' | 'down';
  positive?: boolean;
}) {
  const Icon = direction === 'up' ? ArrowUpRight : ArrowDownRight;
  return (
    <Icon
      className={cn('h-3.5 w-3.5', positive === false ? 'text-rose-600' : 'text-emerald-600')}
      aria-hidden="true"
    />
  );
}