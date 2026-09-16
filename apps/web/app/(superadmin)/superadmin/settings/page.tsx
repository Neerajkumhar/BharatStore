'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  ShieldCheck,
  LogOut,
  Mail,
  User,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

interface MeResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    fullName: string | null;
    isSuperAdmin: boolean;
    createdAt: string;
  };
}

export default function SuperAdminSettingsPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse['data'] | null>(null);

  useEffect(() => {
    fetch('/api/superadmin/me')
      .then((r) => r.json())
      .then((d) => d.success && setMe(d.data))
      .catch(console.error);
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/superadmin/login');
  };

  return (
    <div className="p-4 sm:p-8 space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-amber-500" />
          Platform Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">Administrator account and platform access.</p>
      </div>

      {/* Admin profile */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-900">Administrator Account</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white font-black flex items-center justify-center text-lg">
              {(me?.fullName || me?.email || 'SA').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-black text-slate-900">{me?.fullName || 'Super Admin'}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Mail className="h-3 w-3" /> {me?.email}
              </p>
              <span className="inline-block mt-1 text-2xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
                PLATFORM SUPER ADMIN
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-2xs text-slate-400 mb-1">
                <User className="h-3 w-3" /> User ID
              </div>
              <p className="text-sm font-mono font-bold text-slate-800 truncate">{me?.id ?? '—'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-2xs text-slate-400 mb-1">
                <KeyRound className="h-3 w-3" /> Member Since
              </div>
              <p className="text-sm font-bold text-slate-800">
                {me?.createdAt ? new Date(me.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        <a
          href="/superadmin/platform/audit"
          className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition group"
        >
          <span className="text-sm font-semibold text-slate-700">View my activity in audit log</span>
          <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-amber-500" />
        </a>
        <button onClick={logout} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-rose-50 transition group">
          <span className="text-sm font-bold text-rose-600">Log out & end admin session</span>
          <LogOut className="h-4 w-4 text-slate-300 group-hover:text-rose-500" />
        </button>
      </div>
    </div>
  );
}