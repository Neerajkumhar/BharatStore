'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Store,
  ChevronDown,
  Search,
  Bell,
  Plus,
  ShieldCheck,
  Building2,
  LogOut,
  Sparkles,
} from 'lucide-react';

export function TopNav() {
  const [businessMenuOpen, setBusinessMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  function closeAllMenus() {
    setBusinessMenuOpen(false);
    setProfileMenuOpen(false);
    setNotificationsOpen(false);
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        closeAllMenus();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeAllMenus();
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
    <header
      ref={headerRef}
      className="h-16 border-b border-slate-200 bg-white sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6"
    >
      {/* Brand & Business Switcher */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900 tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-amber-400 font-black text-base shadow-xs">
            भा
          </div>
          <span className="text-base font-extrabold tracking-tight">
            Bharat<span className="text-amber-600">Store</span>
          </span>
        </Link>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* Business Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(false);
              setProfileMenuOpen(false);
              setBusinessMenuOpen((open) => !open);
            }}
            aria-label="Switch business: Rajesh Saree Emporium"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-left text-xs sm:text-sm font-medium text-slate-800"
          >
            <Building2 className="h-4 w-4 text-amber-600" />
<div className="flex flex-col leading-tight hidden sm:flex">
              <span className="font-semibold text-slate-900 truncate max-w-[140px] sm:max-w-[180px]">
                Rajesh Saree Emporium
              </span>
              <span className="text-2xs text-slate-500 font-normal">GSTIN: 09AAECR1234F1Z5</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
          </button>

          {businessMenuOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-2xs uppercase tracking-wider text-slate-500 font-bold">Active Organization</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">Rajesh Saree Emporium</p>
                <p className="text-xs text-emerald-700 font-medium">● Varanasi, UP (09)</p>
              </div>
              <div className="p-1">
                <Link
                  href="/onboarding"
                  onClick={() => setBusinessMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-md transition"
                >
                  <Plus className="h-3.5 w-3.5 text-amber-600" />
                  <span>Register Another Business</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search & Action Area */}
      <div className="flex items-center gap-3">
        {/* Search Trigger */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Search orders, SKU, phone"
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100/60 text-slate-600 text-xs w-64 hover:border-slate-300 transition cursor-pointer focus-visible:outline-none"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search orders, SKU, phone...</span>
          <kbd className="ml-auto font-mono text-2xs bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
            ⌘K
          </kbd>
        </div>

        {/* Quick New POS Sale Button */}
        <Link
          href="/orders?action=pos"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Walk-in Sale (POS)</span>
        </Link>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileMenuOpen(false);
              setBusinessMenuOpen(false);
              setNotificationsOpen((open) => !open);
            }}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition relative"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900">Notifications</span>
                <Link
                  href="/notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-2xs text-amber-600 font-semibold hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                <div className="py-2 flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    🔔
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Notification Center Active</p>
                    <p className="text-slate-500 text-2xs mt-0.5">
                      Real-time customer engagement and order alerts configured.
                    </p>
                    <Link
                      href="/notifications"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-amber-600 text-2xs font-semibold mt-1 inline-block"
                    >
                      Open Notification Dashboard →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setBusinessMenuOpen(false);
              setNotificationsOpen(false);
              setProfileMenuOpen((open) => !open);
            }}
            aria-label="Account menu"
            className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-slate-100 transition"
          >
            <div className="h-7 w-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
              SK
            </div>
            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-slate-900">Sunil Verma</span>
              <span className="text-2xs text-amber-600 font-bold uppercase">Owner</span>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden lg:block" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-lg py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900">Sunil Kumar Verma</p>
                <p className="text-slate-500 text-2xs truncate">sunil@bharatstore.in</p>
              </div>
              <Link
                href="/security"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                <span>Security Center</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                <span>Business Settings</span>
              </Link>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={async () => {
                  setProfileMenuOpen(false);
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/login';
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition font-medium text-left"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
