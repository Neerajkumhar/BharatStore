'use client';

import { ArrowUpRight } from 'lucide-react';
import { AnimationWrapper } from '@/components/storefront/primitives/animation-wrapper';
import { SectionHeading } from './section-heading';

const businesses = [
  {
    name: 'Retail Store',
    desc: 'Counter, GST, and Khata in one place',
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=600&q=80',
    alt: 'Indian retail store interior with shelves and products',
  },
  {
    name: 'Wholesaler',
    desc: 'Bulk orders and credit-ledger billing',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=600&q=80',
    alt: 'Wholesale warehouse with stacked packaged goods',
  },
  {
    name: 'Fashion',
    desc: 'Seasonal inventory and online storefront',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
    alt: 'Fashion boutique with clothing displays on racks',
  },
  {
    name: 'Grocery',
    desc: 'Fast POS with fast-moving SKUs',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    alt: 'Fresh produce and grocery display in a store',
  },
  {
    name: 'Beauty',
    desc: 'Catalog, coupons, and repeat sales',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    alt: 'Beauty and cosmetic products displayed on shelves',
  },
  {
    name: 'Local Artisan',
    desc: 'Sell handmade goods direct to customers',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
    alt: 'Handmade artisan crafts and products',
  },
];

export function BusinessUseCases() {
  return (
    <section id="use-cases" className="py-20 sm:py-28 bg-slate-950 border-t border-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-landing-dots opacity-30 mask-fade-b" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Who it’s for"
          title={
            <>
              Built for businesses across{' '}
              <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">Bharat.</span>
            </>
          }
          subtitle="From a single counter to a multi-location wholesale operation."
          variant="dark"
          className="mb-14"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {businesses.map((biz, i) => (
            <AnimationWrapper key={i} animation="fade-up">
              <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-500/50 transition-all duration-300 cursor-pointer">
                <img
                  src={biz.image}
                  alt={biz.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent transition-all duration-300" />
                <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                  <ArrowUpRight className="h-4 w-4 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-sm sm:text-base font-bold text-white">{biz.name}</h3>
                  <p className="text-2xs text-slate-300 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {biz.desc}
                  </p>
                </div>
              </div>
            </AnimationWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}