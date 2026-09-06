'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Layers,
  Boxes,
  ShoppingCart,
  Users,
  CreditCard,
  FileText,
  ShieldCheck,
  Bell,
  History,
  Settings,
  Store,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Analytics BI', href: '/analytics', icon: BarChart3, badge: 'Live' },
    ],
  },
  {
    group: 'Commerce',
    items: [
      { label: 'Products', href: '/products', icon: Package },
      { label: 'Inventory', href: '/inventory', icon: Boxes, badge: '1 Alert' },
      { label: 'Orders', href: '/orders', icon: ShoppingCart, badge: '1' },
      { label: 'Marketing & Promo', href: '/marketing', icon: Layers },
      { label: 'Customers & Khata', href: '/customers', icon: Users },
    ],
  },
  {
    group: 'Finance & Compliance',
    items: [
      { label: 'Invoices (GST)', href: '/invoices', icon: FileText },
      { label: 'Payments', href: '/payments', icon: CreditCard },
    ],
  },
  {
    group: 'Storefront',
    items: [
      { label: 'Online Store', href: '/storefront', icon: Store },
    ],
  },
  {
    group: 'Administration',
    items: [
      { label: 'Notifications', href: '/notifications', icon: Bell },
      { label: 'Staff & Team RBAC', href: '/staff', icon: Users },
      { label: 'Security Center', href: '/security', icon: ShieldCheck },
      { label: 'Audit Logs', href: '/audit', icon: History },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.group}>
            <div className="px-3 text-2xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {group.group}
            </div>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn('h-4 w-4', isActive ? 'text-amber-400' : 'text-slate-400')} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          isActive
                            ? 'bg-amber-500 text-slate-950 font-semibold'
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

      {/* Storefront Quick Link Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between p-2 rounded-md bg-white border border-slate-200 text-xs">
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 truncate">rajesh-sarees.in</span>
            <span className="text-emerald-600 text-2xs font-medium">● Live & Online</span>
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
    </aside>
  );
}
