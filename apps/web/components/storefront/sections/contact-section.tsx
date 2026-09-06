'use client';

import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

interface ContactSectionProps {
  config: {
    title?: string;
    showPhone?: boolean;
    showEmail?: boolean;
    showAddress?: boolean;
    showHours?: boolean;
  };
  storeData?: {
    phone?: string;
    email?: string;
    address?: string;
    businessHours?: string;
  };
  theme?: { accentColor?: string };
}

export function ContactSection({ config, storeData, theme }: ContactSectionProps) {
  const accent = theme?.accentColor || '#d97706';

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{config.title || 'Get in Touch'}</h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {config.showPhone && storeData?.phone && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <Phone className="h-5 w-5 shrink-0" style={{ color: accent }} />
            <div>
              <p className="text-2xs font-bold text-slate-400 uppercase">Phone</p>
              <p className="text-sm font-semibold text-slate-900">{storeData.phone}</p>
            </div>
          </div>
        )}
        {config.showEmail && storeData?.email && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <Mail className="h-5 w-5 shrink-0" style={{ color: accent }} />
            <div>
              <p className="text-2xs font-bold text-slate-400 uppercase">Email</p>
              <p className="text-sm font-semibold text-slate-900">{storeData.email}</p>
            </div>
          </div>
        )}
        {config.showAddress && storeData?.address && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <MapPin className="h-5 w-5 shrink-0" style={{ color: accent }} />
            <div>
              <p className="text-2xs font-bold text-slate-400 uppercase">Address</p>
              <p className="text-sm font-semibold text-slate-900">{storeData.address}</p>
            </div>
          </div>
        )}
        {config.showHours && storeData?.businessHours && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <Clock className="h-5 w-5 shrink-0" style={{ color: accent }} />
            <div>
              <p className="text-2xs font-bold text-slate-400 uppercase">Hours</p>
              <p className="text-sm font-semibold text-slate-900">{storeData.businessHours}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
