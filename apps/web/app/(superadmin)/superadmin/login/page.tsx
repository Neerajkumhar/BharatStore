'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowRight, AlertCircle, Crown, User, Lock, Sparkles } from 'lucide-react';

function SuperAdminLoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/superadmin/overview';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        setError(data.error || 'Invalid credentials.');
        return;
      }

      if (!data.user?.isSuperAdmin) {
        setIsLoading(false);
        setError('This account does not have Platform Admin privileges.');
        return;
      }

      window.location.href = redirectTo;
    } catch (err) {
      setIsLoading(false);
      setError('An unexpected network error occurred. Please try again.');
    }
  };

  const handleDemoFill = async () => {
    setIdentifier('superadmin@bharatstore.in');
    setPassword('Password@123');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'superadmin@bharatstore.in', password: 'Password@123' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        setError(data.error || 'Demo login failed');
        return;
      }

      if (!data.user?.isSuperAdmin) {
        setIsLoading(false);
        setError('This account does not have Platform Admin privileges.');
        return;
      }

      window.location.href = redirectTo;
    } catch (err) {
      setIsLoading(false);
      setError('An unexpected network error occurred during demo login.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Decorative gradient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="h-11 w-11 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
            भा
          </div>
          <div className="text-left leading-tight">
            <span className="block text-xl font-black text-white tracking-tight">
              Bharat<span className="text-amber-400">Store</span>
            </span>
            <span className="block text-2xs text-slate-400 font-semibold uppercase tracking-widest">Platform Admin</span>
          </div>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-2xs font-bold uppercase tracking-wider mb-3">
          <Crown className="h-3 w-3" />
          Super Admin Access Only
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Platform Administration Console
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Manage all business owners, tenants, plans and subscriptions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl py-8 px-6 sm:px-10 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-400 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                <span className="inline-flex items-center gap-1"><User className="h-3 w-3" /> Email Address</span>
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin email"
                className="w-full px-3 py-2.5 text-sm bg-slate-950 border border-slate-700 text-white placeholder-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> Password</span>
                </label>
                <Link href="/login" className="text-2xs font-medium text-amber-400 hover:underline">
                  Not a super admin?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 text-sm bg-slate-950 border border-slate-700 text-white placeholder-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold rounded-lg shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Platform Admin'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Login Box */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Quick Demonstration Access</span>
              </div>
              <p className="text-2xs text-slate-400 mb-2 leading-relaxed">
                Login with the seeded platform super admin account.
              </p>
              <button
                type="button"
                onClick={handleDemoFill}
                className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition"
              >
                1-Click Sign In as Super Admin
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-1.5 justify-center text-2xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>All platform admin actions are audit-logged</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-sm font-semibold text-slate-500">Loading...</div>}>
      <SuperAdminLoginForm />
    </Suspense>
  );
}