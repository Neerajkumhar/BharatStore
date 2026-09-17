'use client';

import React from 'react';
import { UserCog, X } from 'lucide-react';

export function ImpersonationBanner({ tenantName, impersonatedBy }: { tenantName?: string; impersonatedBy?: string }) {
  const exitImpersonation = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/superadmin/overview';
  };

  return (
    <div className="bg-indigo-950 text-indigo-100 px-4 py-2 text-xs flex items-center gap-3">
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <UserCog className="h-3.5 w-3.5 text-indigo-300 shrink-0" />
        <span className="truncate">
          <strong className="font-bold text-white">{tenantName || 'Tenant'}</strong>
          {' — You are viewing this business in '}
          <strong className="text-amber-300 font-bold">Super Admin Impersonation Mode</strong>
          {impersonatedBy && <span className="text-indigo-300"> (by {impersonatedBy})</span>}
        </span>
      </div>
      <button
        onClick={exitImpersonation}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white font-semibold shrink-0"
      >
        <X className="h-3 w-3" />
        Exit & Return to Admin
      </button>
    </div>
  );
}