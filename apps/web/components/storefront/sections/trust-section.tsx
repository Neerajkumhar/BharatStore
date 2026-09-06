'use client';

import React from 'react';
import { ShieldCheck, FileText, Truck, Headphones, CreditCard, RefreshCw, HeartHandshake, Star } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  ShieldCheck, FileText, Truck, Headphones, CreditCard, RefreshCw, HeartHandshake, Star,
};

interface TrustBadge {
  icon: string;
  title: string;
  description: string;
}

interface TrustSectionProps {
  config: {
    badges?: TrustBadge[];
  };
  theme?: { accentColor?: string };
}

export function TrustSection({ config, theme }: TrustSectionProps) {
  const accent = theme?.accentColor || '#d97706';
  const badges = config.badges || [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className={`grid grid-cols-2 ${badges.length > 3 ? 'md:grid-cols-4' : `md:grid-cols-${badges.length}`} gap-4 text-center`}>
          {badges.map((badge, i) => {
            const Icon = iconMap[badge.icon] || ShieldCheck;
            return (
              <div key={i} className="p-3 rounded-xl flex flex-col items-center space-y-1" style={{ backgroundColor: `${accent}10` }}>
                <Icon className="h-5 w-5" style={{ color: accent }} />
                <span className="text-xs font-bold text-slate-900">{badge.title}</span>
                <span className="text-2xs text-slate-400">{badge.description}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
