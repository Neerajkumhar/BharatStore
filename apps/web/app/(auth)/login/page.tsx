'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowRight, Lock, Phone, AlertCircle, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

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
        setError(data.error || 'Invalid credentials. Use the Demo Login button below.');
        return;
      }

      const target = data.user?.isSuperAdmin ? '/superadmin/overview' : redirectTo;
      window.location.href = target;
    } catch (err) {
      setIsLoading(false);
      setError('An unexpected network error occurred. Please try again.');
    }
  };

  const handleDemoFill = async () => {
    setIdentifier('owner@rajeshfabrics.com');
    setPassword('Password@123');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'owner@rajeshfabrics.com', password: 'Password@123' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        setError(data.error || 'Demo login failed');
        return;
      }

      const target = data.user?.isSuperAdmin ? '/superadmin/overview' : redirectTo;
      window.location.href = target;
    } catch (err) {
      setIsLoading(false);
      setError('An unexpected network error occurred during demo login.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 font-black text-xl shadow-md">
            भा
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            Bharat<span className="text-amber-600">Store</span>
          </span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign in to your merchant portal
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Or{' '}
          <Link href="/onboarding" className="font-semibold text-amber-600 hover:text-amber-500">
            register a new business in 2 minutes
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200 rounded-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email or Mobile (+91)
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter email or mobile number"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-2xs font-medium text-amber-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                <span>Remember this device</span>
              </label>
              <div className="flex items-center gap-1 text-2xs text-emerald-600 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Encrypted Session</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Login Box */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Quick Demonstration Access</span>
              </div>
              <p className="text-2xs text-amber-800 mb-2 leading-relaxed">
                Log in directly with the seeded demo merchant: <strong>Rajesh Saree Emporium</strong> (Varanasi).
              </p>
              <button
                type="button"
                onClick={handleDemoFill}
                className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-2xs transition"
              >
                1-Click Sign In as Sunil Verma (Owner)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-semibold text-slate-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
