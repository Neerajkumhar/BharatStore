'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ExternalLink, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEntitlements } from '@/components/entitlements/EntitlementProvider';
import {
  navigationGroups,
  isItemActive,
  isGroupActive,
  type NavGroup,
} from './navigation';

function countBadges(group: NavGroup): number {
  return group.items.reduce((acc, item) => {
    const value = item.badge ? Number.parseInt(item.badge, 10) : NaN;
    return acc + (Number.isFinite(value) ? value : 0);
  }, 0);
}

export function NavBar() {
  const pathname = usePathname();
  const { entitlements } = useEntitlements();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const isLocked = (feature?: string) => !!feature && !entitlements.features.includes(feature);

  useEffect(() => {
    setOpenGroup(null);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setOpenGroup(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenGroup(null);
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={barRef} className="hidden md:block sticky top-16 z-20 bg-white border-b border-slate-200">
      <nav aria-label="Primary" className="flex items-center gap-1 px-4 sm:px-6 h-12">
        {navigationGroups.map((group) => {
          const active = isGroupActive(pathname, group);
          const open = openGroup === group.group;
          const badgeCount = countBadges(group);

          return (
            <div key={group.group} className="relative">
              <button
                type="button"
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() => setOpenGroup(open ? null : group.group)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  active && !open
                    ? 'bg-amber-100 text-amber-800 font-semibold'
                    : open
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <span className="whitespace-nowrap">{group.group}</span>
                {badgeCount > 0 && (
                  <span className="text-2xs px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-semibold leading-none">
                    {badgeCount}
                  </span>
                )}
                <ChevronDown
                  className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', open && 'rotate-180')}
                />
              </button>

              {open && (
                <div
                  className={cn(
                    'absolute top-full mt-1.5 w-72 rounded-xl border border-slate-200 bg-white shadow-lg py-2 z-50',
                    group.group === 'Administration' ? 'right-0' : 'left-0'
                  )}
                >
                  <div className="px-4 pb-1.5 text-2xs font-bold uppercase tracking-wider text-slate-500">
                    {group.group}
                  </div>
                  <div role="menu">
                    {group.items.map((item) => {
                      const itemActive = isItemActive(pathname, item.href);
                      const Icon = item.icon;
                      const locked = isLocked(item.feature);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          className={cn(
                            'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors mx-1',
                            itemActive
                              ? 'bg-amber-50 text-slate-900'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                            locked && !itemActive && 'text-slate-400'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={cn('h-4 w-4', itemActive ? 'text-amber-600' : 'text-slate-400')}
                            />
                            <span>{item.label}</span>
                            {locked && (
                              <span className="inline-flex items-center gap-1 text-2xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                                <Lock className="h-2.5 w-2.5" />
                                Upgrade
                              </span>
                            )}
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
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export function VerticalNav() {
  const pathname = usePathname();
  const { entitlements, session } = useEntitlements();

  const isLocked = (feature?: string) => !!feature && !entitlements.features.includes(feature);
  const storeDomain = session.tenantSlug ? `${session.tenantSlug}.bharatstore.in` : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.group}>
            <div className="px-3 text-2xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {group.group}
            </div>
            <nav aria-label={group.group} className="space-y-1">
              {group.items.map((item) => {
                const itemActive = isItemActive(pathname, item.href);
                const Icon = item.icon;
                const locked = isLocked(item.feature);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors border-l-2',
                      itemActive
                        ? 'border-amber-500 bg-amber-50 text-slate-900 shadow-xs'
                        : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                      locked && !itemActive && 'text-slate-400'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn('h-4 w-4', itemActive ? 'text-amber-600' : 'text-slate-400')} />
                      <span>{item.label}</span>
                      {locked && <Lock className="h-3.5 w-3.5 text-amber-500" />}
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
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-800 truncate">{storeDomain ?? 'Storefront'}</span>
            <span className="text-emerald-700 text-2xs font-medium">● Live &amp; Online</span>
          </div>
          {storeDomain && (
            <a
              href={`https://${storeDomain}`}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-slate-400 hover:text-slate-700 transition"
              title="View Public Store"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}