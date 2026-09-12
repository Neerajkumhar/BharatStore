'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, CreditCard, FileText, Headphones, RefreshCw, Instagram, MessageCircle } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  ShieldCheck, Truck, CreditCard, FileText, Headphones, RefreshCw,
};

interface ValueProp {
  icon: string;
  title: string;
  description: string;
}

interface FooterSectionProps {
  config: {
    showValueProps?: boolean;
    showSocialLinks?: boolean;
    showCopyright?: boolean;
    valueProps?: ValueProp[];
  };
  slug: string;
  storeData?: {
    tradeName?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    pincode?: string;
    gstin?: string;
    businessHours?: string;
    socialLinks?: { instagram?: string; whatsapp?: string; facebook?: string };
  };
  theme?: { accentColor?: string };
}

export function FooterSection({ config, slug, storeData, theme }: FooterSectionProps) {
  const accent = theme?.accentColor || '#d97706';
  const tradeName = storeData?.tradeName || 'Store';
  const valueProps = config.valueProps || [
    { icon: 'ShieldCheck', title: 'Genuine Products', description: 'Direct store inventory' },
    { icon: 'Truck', title: 'Fast Dispatch', description: 'Quick local fulfillment' },
    { icon: 'CreditCard', title: 'Flexible Payment', description: 'UPI, Cash & Khata' },
    { icon: 'FileText', title: 'GST Invoice', description: 'B2B & B2C compliant' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {config.showValueProps && valueProps.length > 0 && (
          <div className={`grid grid-cols-2 ${valueProps.length > 3 ? 'md:grid-cols-4' : `md:grid-cols-${valueProps.length}`} gap-4 pb-8 border-b border-slate-800 text-center`}>
            {valueProps.map((vp, i) => {
              const Icon = iconMap[vp.icon] || ShieldCheck;
              return (
                <div key={i} className="p-3 rounded-xl bg-slate-800/60 flex flex-col items-center space-y-1">
                  <Icon className="h-5 w-5" style={{ color: accent }} />
                  <span className="text-xs font-bold text-white">{vp.title}</span>
                  <span className="text-2xs text-slate-400">{vp.description}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 flex items-center justify-center rounded-lg text-sm font-extrabold text-slate-950" style={{ backgroundColor: accent }}>
                {tradeName.slice(0, 1).toUpperCase()}
              </div>
              <span className="text-base font-bold text-white">{tradeName}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Official online store for {tradeName}.
            </p>
            {storeData?.gstin && <p className="text-2xs text-slate-400 font-mono">GSTIN: {storeData.gstin}</p>}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Customer Care</h4>
            {storeData?.phone && <p className="text-xs text-slate-300">Phone: {storeData.phone}</p>}
            {storeData?.email && <p className="text-xs text-slate-300">Email: {storeData.email}</p>}
            {storeData?.businessHours && <p className="text-xs text-slate-400 mt-1">Hours: {storeData.businessHours}</p>}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Store Address</h4>
            {storeData?.address && (
              <p className="text-xs text-slate-300">{storeData.address}, {storeData.city} - {storeData.pincode}</p>
            )}
            {config.showSocialLinks && storeData?.socialLinks && (
              <div className="flex items-center gap-3 pt-2">
                {storeData.socialLinks.instagram && (
                  <a href={storeData.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {storeData.socialLinks.whatsapp && (
                  <a href={`https://wa.me/${storeData.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
            <div className="pt-2">
              <Link href={`/store/${slug}/products`} className="text-xs font-bold hover:underline" style={{ color: accent }}>
                Browse Catalog &rarr;
              </Link>
            </div>
          </div>
        </div>

        {config.showCopyright && (
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-2xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} {tradeName}. All rights reserved.</p>
            <p className="flex items-center gap-1">
              <span>Powered by</span>
              <span className="font-bold" style={{ color: accent }}>BharatStore D2C Platform</span>
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}
