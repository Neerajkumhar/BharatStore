'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export interface MegaMenuSectionProps {
  config: {
    title?: string;
    groups?: Array<{ title: string; items: string[] }>;
    promoTitle?: string;
    promoSubtitle?: string;
    promoImage?: string;
    layout?: 'classic' | 'bricks' | 'masonry' | 'tabs';
  };
  slug: string;
}

const defaultGroups = [
  { title: 'New Arrivals', items: ['Traditional Sarees', 'Kurtas & Tunics', 'Handloom Stoles', 'Artisan Footwear'] },
  { title: 'Bestseller Categories', items: ['Organic Oils', 'Spices & Herbs', 'Handcrafted Decor', 'Wellness Kits'] },
  { title: 'Festive Specials', items: ['Diwali Hampers', 'Pooja Essentials', 'Gift Boxes', 'Sweets & Nuts'] },
];

const tileColors = ['bg-slate-800', 'bg-slate-800/60', 'bg-amber-900/40'];

export function MegaMenuSection({ config, slug }: MegaMenuSectionProps) {
  const groups = config.groups?.length ? config.groups : defaultGroups;
  const layout = config.layout || 'classic';
  const [activeTab, setActiveTab] = useState(0);

  const promoBlock = (
    <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between space-y-4">
      <div>
        <span className="text-3xs font-extrabold uppercase tracking-widest text-amber-400">Featured Offer</span>
        <h4 className="text-base font-bold text-white mt-1">{config.promoTitle || 'Season Special Drop'}</h4>
        <p className="text-xs text-slate-300 mt-1">{config.promoSubtitle || 'Flat 40% off on handmade couture & heritage crafts.'}</p>
      </div>
      <Link
        href={`/store/${slug}/products`}
        className="inline-flex items-center justify-center gap-2 py-2 px-4 bg-amber-500 text-white font-extrabold text-xs rounded-xl hover:bg-amber-600 transition shadow-xs"
      >
        <span>Shop Deal</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );

  const renderGroups = () => {
    switch (layout) {
      case 'bricks':
        return (
          <div className="grid sm:grid-cols-2 gap-4">
            {groups.map((group, idx) => (
              <div key={idx} className={`${tileColors[idx % tileColors.length]} border border-slate-700/60 rounded-xl p-4`}>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-400 border-b border-slate-700/60 pb-2 mb-3">
                  {group.title}
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {group.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <Link href={`/store/${slug}/products`} className="hover:text-amber-400 transition flex items-center justify-between group">
                        <span>{item}</span>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition -translate-x-1 group-hover:translate-x-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );

      case 'masonry':
        return (
          <div className="md:col-span-3">
            <div className="columns-1 sm:columns-3 gap-6 [column-fill:_balance]">
              {groups.map((group, idx) => (
                <div key={idx} className="break-inside-avoid mb-6 space-y-3">
                  <h4 className="text-sm font-extrabold text-white border-b border-slate-800 pb-2 flex items-center justify-between">
                    {group.title}
                    <span className="text-3xs font-mono text-slate-500">{String(idx + 1).padStart(2, '0')}</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {group.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link href={`/store/${slug}/products`} className="hover:text-amber-400 transition flex items-center justify-between group">
                          <span>{item}</span>
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition -translate-x-1 group-hover:translate-x-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      case 'tabs':
        return (
          <div className="md:col-span-3">
            <div className="flex flex-wrap gap-2 mb-5">
              {groups.map((group, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                    activeTab === idx
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {group.title}
                </button>
              ))}
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
              <h4 className="text-sm font-extrabold text-white mb-3">{groups[activeTab]?.title}</h4>
              <ul className="grid sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {groups[activeTab]?.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <Link
                      href={`/store/${slug}/products`}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 hover:text-amber-400 transition"
                    >
                      <span>{item}</span>
                      <ArrowRight className="h-3 w-3 text-slate-500" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'classic':
      default:
        return (
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {groups.map((group, idx) => (
              <div key={idx} className="space-y-3">
                <h4 className="text-sm font-extrabold text-white border-b border-slate-800 pb-2">
                  {group.title}
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {group.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <Link
                        href={`/store/${slug}/products`}
                        className="hover:text-amber-400 transition flex items-center justify-between group"
                      >
                        <span>{item}</span>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition -translate-x-1 group-hover:translate-x-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <section className="bg-slate-900 text-white py-8 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 mb-6 flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span>{config.title || 'Explore Catalog Departments'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {renderGroups()}
          {promoBlock}
        </div>
      </div>
    </section>
  );
}