'use client';

import React from 'react';
import Link from 'next/link';
import { Sofa, ArrowRight } from 'lucide-react';
import { AnimationWrapper, type AnimationType } from '../primitives/animation-wrapper';

export interface ShopByRoomSectionProps {
  config: {
    title?: string;
    subtitle?: string | null;
    rooms?: Array<{ name: string; items: string[] }>;
    animation?: AnimationType;
  };
  slug: string;
}

const roomTones = [
  'bg-stone-500',
  'bg-amber-600',
  'bg-sky-700',
  'bg-emerald-700',
];

export function ShopByRoomSection({ config, slug }: ShopByRoomSectionProps) {
  const rooms = config.rooms?.length
    ? config.rooms
    : [
        { name: 'Living Room', items: ['Sofas', 'Rugs', 'Coffee Tables', 'Lighting'] },
        { name: 'Bedroom', items: ['Beds', 'Bedsheets', 'Wardrobes', 'Nightstands'] },
        { name: 'Kitchen', items: ['Cookware', 'Storage', 'Utensils', 'Countertops'] },
        { name: 'Study', items: ['Desks', 'Chairs', 'Shelves', 'Desk Lamps'] },
      ];

  return (
    <section className="py-12 bg-stone-50 border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1.5">
          <span className="inline-flex items-center gap-1.5 text-2xs font-extrabold uppercase tracking-widest text-amber-700">
            <Sofa className="h-3.5 w-3.5" />
            Interiors
          </span>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            {config.title || 'Shop by Room'}
          </h2>
          {config.subtitle && (
            <p className="text-xs text-stone-500 font-medium">{config.subtitle}</p>
          )}
        </div>

        <AnimationWrapper animation={config.animation || 'none'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rooms.slice(0, 4).map((room, idx) => (
              <Link
                key={idx}
                href={`/store/${slug}/products`}
                className="group relative overflow-hidden rounded-2xl bg-stone-900 text-white p-5 min-h-44 flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <span className={`absolute -top-6 -right-6 h-24 w-24 rounded-full blur-2xl opacity-30 ${roomTones[idx % roomTones.length]}`} />
                <div className="relative">
                  <h3 className="text-lg font-black">{room.name}</h3>
                  <ul className="mt-3 space-y-1.5">
                    {room.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="text-3xs text-stone-300 font-medium flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-amber-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <span className="relative inline-flex items-center gap-1 text-3xs font-black uppercase tracking-widest text-amber-400 group-hover:gap-2 transition-all">
                  Shop Now <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
}