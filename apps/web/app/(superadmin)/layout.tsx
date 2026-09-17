'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  BadgeCheck,
  ToggleLeft,
  Shield,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const superAdminNav = [
  {
    label: 'Platform',
    items: [
      { label: 'Overview', href: '/superadmin/overview', icon: LayoutDashboard },
      { label: 'Business Owners', href: '/superadmin/owners', icon: Users },
      { label: 'All Tenants', href: '/superadmin/tenants', icon: Building2 },
      { label: 'Plans & Pricing', href: '/superadmin/plans', icon: CreditCard },
      { label: 'Subscriptions', href: '/superadmin/subscriptions', icon: BadgeCheck },
      { label: 'Feature Flags', href: '/superadmin/features', icon: ToggleLeft },
      { label: 'Platform Audit', href: '/superadmin/platform/audit', icon: Shield },
      { label: 'Platform Health', href: '/superadmin/platform/health', icon: Activity },
      { label: 'Settings', href: '/superadmin/settings', icon: Settings },
    ],
  },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-slate-950 text-slate-300 min-h-screen sticky top-0 h-screen">
        <div className="p-4 flex items-center gap-2.5 border-b border-slate-800">
          <div className="h-9 w-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-sm">
            भा
          </div>
          <div className="leading-tight">
            <p className="text-sm font-extrabold text-white tracking-tight">BharatStore</p>
            <p className="text-2xs text-amber-400 font-bold uppercase tracking-wider">Platform Admin</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {superAdminNav.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-2xs font-bold uppercase tracking-widest text-slate-500">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname?.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition',
                        isActive
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/70 border border-transparent'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="relative" >
            <button
              onClick={() => setProfileOpen((open) => !open)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                SA
              </div>
              <div className="flex-1 text-left leading-tight min-w-0">
                <p className="text-xs font-bold text-white truncate">Platform Admin</p>
                <p className="text-2xs text-slate-500 truncate">superadmin@bharatstore.in</p>
              </div>
              <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-full rounded-xl border border-slate-700 bg-white shadow-lg py-1 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900">BharatStore Super Admin</p>
                  <p className="text-slate-500 text-2xs truncate">superadmin@bharatstore.in</p>
                </div>
                <Link
                  href="/superadmin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  <span>Platform Settings</span>
                </Link>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={async () => {
                    setProfileOpen(false);
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/superadmin/login';
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 font-medium text-left"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex lg:hidden">
          <div className="w-72 bg-slate-950 h-full flex flex-col shadow-2xl">
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">भा</div>
                <div className="leading-tight">
                  <p className="text-sm font-extrabold text-white">BharatStore</p>
                  <p className="text-2xs text-amber-400 font-bold uppercase">Platform Admin</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
              {superAdminNav.map((group) => (
                <div key={group.label}>
                  <p className="px-3 mb-1.5 text-2xs font-bold uppercase tracking-widest text-slate-500">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = pathname?.startsWith(item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition',
                            isActive
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/70 border border-transparent'
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <div className="p-3 border-t border-slate-800">
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/superadmin/login';
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-30 h-14 bg-slate-950 text-white flex items-center justify-between px-4 border-b border-slate-800">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800" title="Menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">भा</div>
            <span className="text-sm font-extrabold">Platform Admin</span>
          </div>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/superadmin/login';
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}