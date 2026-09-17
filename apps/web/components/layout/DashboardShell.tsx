'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TopNav } from './TopNav';
import { NavBar, VerticalNav } from './NavBar';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingCart,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EntitlementProvider } from '@/components/entitlements/EntitlementProvider';
import { UpgradePromptHost } from '@/components/entitlements/UpgradePrompt';
import { PlanStatusBanner } from '@/components/entitlements/PlanStatusBanner';
import type { EntitlementSnapshot, SessionSummary } from '@/lib/entitlement-types';

interface DashboardShellProps {
  children: React.ReactNode;
  entitlements: EntitlementSnapshot;
  session: SessionSummary;
  breadcrumbs?: { label: string; href?: string }[];
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function DashboardShell({
  children,
  entitlements,
  session,
  breadcrumbs,
  title,
  subtitle,
  action,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // The Store Builder is a full-bleed tool: it provides its own top toolbar,
  // mobile nav, and side panels, so hide the dashboard chrome for that route.
  const isBuilderRoute = pathname?.startsWith('/storefront/builder');

  return (
    <EntitlementProvider entitlements={entitlements} session={session}>
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 sm:pb-0">
      {/* Plan status banner — shows when EXPIRED/CANCELLED/SUSPENDED/PAST_DUE/trial expired */}
      {!isBuilderRoute && <PlanStatusBanner />}

      {/* Top Navigation */}
      {!isBuilderRoute && <TopNav onToggleMobileMenu={() => setMobileMenuOpen(true)} />}

      {/* Secondary Navigation Row (dashboard sections) */}
      {!isBuilderRoute && <NavBar />}

      {/* Body container */}
      <div className="flex-1 flex">
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex md:hidden">
            <div className="w-72 bg-white h-full flex flex-col shadow-2xl">
              <div className="p-4 flex items-center justify-between border-b border-slate-200">
                <span className="font-bold text-slate-900">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <VerticalNav />
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Workspace Canvas */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Breadcrumbs and Page Header (if provided) */}
          {!isBuilderRoute && (breadcrumbs || title) && (
            <div className="border-b border-slate-200 bg-white px-4 sm:px-8 py-4">
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                  {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb.label}>
                      {idx > 0 && <span>/</span>}
                      {crumb.href ? (
                        <Link href={crumb.href} className="hover:text-slate-700 transition">
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="font-medium text-slate-700">{crumb.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  {title && <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>}
                  {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
                </div>
                {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
              </div>
            </div>
          )}

          {/* Page Content Body */}
          <div
            className={
              isBuilderRoute
                ? 'flex-1 flex flex-col overflow-hidden'
                : 'flex-1 p-4 sm:p-8 w-full'
            }
          >
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (High Frequency Actions) */}
      {!isBuilderRoute && (
        <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 flex sm:hidden items-center justify-around h-16 px-2 shadow-lg">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 text-2xs font-medium text-slate-500 py-1 px-2 rounded"
        >
          <Menu className="h-5 w-5" />
          <span>Menu</span>
        </button>
        <Link
          href="/products"
          className={cn(
            'flex flex-col items-center gap-1 text-2xs font-medium py-1 px-2 rounded',
            pathname.startsWith('/products') ? 'text-amber-600 font-bold' : 'text-slate-500'
          )}
        >
          <Package className="h-5 w-5" />
          <span>Products</span>
        </Link>
        <Link
          href="/dashboard"
          className={cn(
            'flex flex-col items-center gap-1 text-2xs font-medium py-1 px-2 rounded',
            pathname === '/dashboard' ? 'text-amber-600 font-bold' : 'text-slate-500'
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link
          href="/orders"
          className={cn(
            'flex flex-col items-center gap-1 text-2xs font-medium py-1 px-2 rounded',
            pathname.startsWith('/orders') ? 'text-amber-600 font-bold' : 'text-slate-500'
          )}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Orders</span>
        </Link>
        <Link
          href="/orders?action=pos"
          className="flex flex-col items-center justify-center -mt-5 bg-amber-500 text-white h-12 w-12 rounded-full shadow-md active:scale-95 transition"
        >
          <PlusCircle className="h-6 w-6 stroke-[2.5]" />
        </Link>
      </nav>
      )}
      <UpgradePromptHost />
    </div>
    </EntitlementProvider>
  );
}
