'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRailGroups, isItemActive } from './navigation';

interface MobileRailNavProps {
  onNavigate?: () => void;
}

export function MobileRailNav({ onNavigate }: MobileRailNavProps) {
  const pathname = usePathname();
  const groups = getRailGroups();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.group}>
            <div className="px-3 text-2xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {group.group}
            </div>
            <nav aria-label={group.group} className="space-y-1">
              {group.items.map((item) => {
                const itemActive = isItemActive(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors border-l-2',
                      itemActive
                        ? 'border-amber-500 bg-amber-50 text-slate-900 shadow-xs'
                        : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn('h-4 w-4', itemActive ? 'text-amber-600' : 'text-slate-400')} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          itemActive
                            ? 'bg-amber-500 text-white font-semibold'
                            : 'bg-amber-100 text-amber-800'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between p-2 rounded-md bg-white border border-slate-200 text-xs">
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 truncate">rajesh-sarees.in</span>
            <span className="text-emerald-700 text-2xs font-medium">● Live & Online</span>
          </div>
          <a
            href="https://rajesh-sarees.bharatstore.in"
            target="_blank"
            rel="noreferrer"
            className="p-1 text-slate-400 hover:text-slate-700 transition"
            title="View Public Store"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}