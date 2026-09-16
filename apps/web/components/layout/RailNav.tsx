'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, ExternalLink, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRailGroups, isItemActive } from './navigation';

interface RailNavProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function RailNav({ collapsed, onToggleCollapsed }: RailNavProps) {
  const pathname = usePathname();
  const groups = getRailGroups();

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-white border-r border-slate-200 shrink-0 transition-[width] duration-200 ease-out sticky top-0 h-screen overflow-hidden',
        collapsed ? 'w-16' : 'w-56'
      )}
      aria-label="Primary navigation rail"
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-5" role="menu">
        {groups.map((group) => {
          const Icon = group.railIcon || group.items[0]?.icon;

          return (
            <div key={group.group}>
              {collapsed ? (
                <div className="px-4 pb-2 flex justify-center" role="presentation">
                  {Icon && <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />}
                </div>
              ) : (
                <div className="px-4 pb-1.5 text-2xs font-bold uppercase tracking-wider text-slate-400">
                  {group.railLabel || group.group}
                </div>
              )}

              <nav aria-label={group.group} className="space-y-0.5">
                {group.items.map((item) => {
                  const itemActive = isItemActive(pathname, item.href);
                  const ItemIcon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'relative flex items-center gap-2.5 mx-2 py-2 text-sm font-medium rounded-lg transition-colors',
                        collapsed ? 'justify-center px-0' : 'px-2.5',
                        itemActive
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      {itemActive && !collapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-brand-500" />
                      )}
                      <ItemIcon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          itemActive ? 'text-brand-600' : 'text-slate-400'
                        )}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span
                          className={cn(
                            'ml-auto text-2xs px-1.5 py-0.5 rounded-full font-semibold leading-none',
                            itemActive ? 'bg-brand-500 text-white' : 'bg-amber-100 text-amber-800'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      {collapsed && itemActive && (
                        <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-brand-500" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      {/* Rail footer */}
      <div className="border-t border-slate-200 p-2 space-y-1">
        {!collapsed && (
          <a
            href="https://rajesh-sarees.bharatstore.in"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 mx-1 px-2.5 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition-colors"
          >
            <Store className="h-4 w-4 text-slate-400" />
            <span className="truncate">rajesh-sarees.in</span>
            <ExternalLink className="h-3 w-3 text-slate-400 ml-auto" />
          </a>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand navigation rail' : 'Collapse navigation rail'}
          title={collapsed ? 'Expand rail (⌘\\)' : 'Collapse rail (⌘\\)'}
          className={cn(
            'flex items-center gap-2.5 mx-1 px-2.5 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition-colors w-full',
            collapsed ? 'justify-center' : ''
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 text-slate-400" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}