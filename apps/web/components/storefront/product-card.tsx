'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Eye, Star, Tag, Plus, Check } from 'lucide-react';
import { type CardVariant } from '@bharatstore/shared/constants';
import { useCart } from './cart-context';

export type ProductCardVariant = CardVariant;

export interface ProductCardProps {
  slug: string;
  variant?: ProductCardVariant;
  product: {
    id: string;
    title: string;
    slug: string;
    sellingPrice: number;
    mrp: number;
    images?: string[];
    categoryName?: string;
    variants: Array<{
      id: string;
      sku: string;
      variantName: string;
      priceOverride?: number | null;
      currentStock: number;
    }>;
  };
  onQuickView?: (product: any) => void;
}

export function ProductCard({ slug, variant = 'classic', product, onQuickView }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id || ''
  );

  const selectedVar = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const totalStock = product.variants.reduce((acc, v) => acc + v.currentStock, 0);
  const inStock = totalStock > 0;
  const isLowStock = inStock && totalStock <= 5;

  const effectivePrice = selectedVar?.priceOverride ? selectedVar.priceOverride : product.sellingPrice;
  const discountPct = product.mrp > effectivePrice
    ? Math.round(((product.mrp - effectivePrice) / product.mrp) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedVar || !inStock) return;

    addToCart({
      variantId: selectedVar.id,
      productId: product.id,
      productTitle: product.title,
      variantName: selectedVar.variantName,
      sku: selectedVar.sku,
      unitPrice: effectivePrice,
      mrp: product.mrp,
      quantity: 1,
      maxStock: selectedVar.currentStock,
      image: product.images?.[0],
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const mainImage = product.images?.[0];
  const secondaryImage = product.images?.[1] || mainImage;

  // Render variant styles
  switch (variant) {
    case 'editorial':
      return (
        <div className="group relative flex flex-col space-y-3 cursor-pointer">
          <Link href={`/store/${slug}/products/${product.id}`} className="block overflow-hidden bg-slate-100 aspect-3/4 relative rounded-xl">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ShoppingBag className="h-10 w-10 stroke-1" />
              </div>
            )}
            {discountPct > 0 && (
              <span className="absolute top-3 left-3 bg-slate-900 text-white text-2xs font-extrabold px-2.5 py-1 uppercase tracking-widest rounded">
                -{discountPct}%
              </span>
            )}
          </Link>
          <div className="flex justify-between items-baseline pt-1">
            <Link href={`/store/${slug}/products/${product.id}`}>
              <h4 className="text-sm font-semibold text-slate-900 group-hover:underline underline-offset-4 tracking-tight">
                {product.title}
              </h4>
            </Link>
            <span className="text-sm font-bold text-slate-900 shrink-0 ml-2">
              ₹{effectivePrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      );

    case 'luxury':
      return (
        <div className="group relative flex flex-col space-y-4 p-4 bg-white border border-slate-100 rounded-none hover:shadow-xl transition-all duration-300">
          <Link href={`/store/${slug}/products/${product.id}`} className="block aspect-4/5 overflow-hidden bg-stone-50 relative">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.title}
                className="w-full h-full object-cover transition-opacity duration-700 group-hover:opacity-90"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300">
                <ShoppingBag className="h-12 w-12 stroke-1" />
              </div>
            )}
          </Link>
          <div className="text-center space-y-1.5">
            {product.categoryName && (
              <p className="text-3xs uppercase tracking-widest text-amber-700 font-semibold">
                {product.categoryName}
              </p>
            )}
            <Link href={`/store/${slug}/products/${product.id}`}>
              <h4 className="text-sm font-serif text-stone-900 group-hover:text-amber-800 transition">
                {product.title}
              </h4>
            </Link>
            <p className="text-xs font-mono text-stone-600">
              ₹{effectivePrice.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      );

    case 'overlay':
      return (
        <div className="group relative rounded-2xl overflow-hidden bg-slate-900 aspect-4/5 shadow-md">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-75"
            />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
              <ShoppingBag className="h-12 w-12" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-4 flex flex-col justify-end text-white">
            {product.categoryName && (
              <span className="text-3xs font-extrabold uppercase tracking-widest text-amber-400 mb-1">
                {product.categoryName}
              </span>
            )}
            <h4 className="text-sm font-bold truncate mb-1">{product.title}</h4>
            <div className="flex items-center justify-between mt-1">
              <span className="text-base font-black text-amber-400">
                ₹{effectivePrice.toLocaleString('en-IN')}
              </span>
              <button
                onClick={handleQuickAdd}
                disabled={!inStock}
                className="p-2.5 rounded-full bg-white text-slate-950 hover:bg-amber-400 transition shadow-md disabled:opacity-50"
              >
                {added ? <Check className="h-4 w-4 text-emerald-600" /> : <ShoppingBag className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      );

    case 'compact':
      return (
        <div className="flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition group">
          <Link href={`/store/${slug}/products/${product.id}`} className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 relative">
            {mainImage ? (
              <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ShoppingBag className="h-5 w-5" />
              </div>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/store/${slug}/products/${product.id}`}>
              <h4 className="text-xs font-bold text-slate-900 truncate hover:text-amber-600">
                {product.title}
              </h4>
            </Link>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xs font-extrabold text-slate-900">
                ₹{effectivePrice.toLocaleString('en-IN')}
              </span>
              {product.mrp > effectivePrice && (
                <span className="text-3xs text-slate-500 line-through">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleQuickAdd}
            disabled={!inStock}
            className="p-2 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-900 hover:text-white transition shrink-0"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      );

    case 'deal':
      return (
        <div className="bg-gradient-to-b from-amber-500/10 to-white border-2 border-amber-400/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group">
          <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
            {mainImage ? (
              <img src={mainImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ShoppingBag className="h-8 w-8" />
              </div>
            )}
            {discountPct > 0 && (
              <span className="absolute top-2 left-2 bg-red-600 text-white text-3xs font-black px-2 py-0.5 rounded-full shadow-xs uppercase">
                SAVE {discountPct}%
              </span>
            )}
          </div>
          <div className="p-3.5 space-y-2">
            <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">{product.title}</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-amber-600">₹{effectivePrice.toLocaleString('en-IN')}</span>
              {product.mrp > effectivePrice && (
                <span className="text-xs text-slate-500 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
              )}
            </div>
            <button
              onClick={handleQuickAdd}
              disabled={!inStock}
              className="w-full py-2 bg-amber-500 text-white font-black text-xs rounded-xl hover:bg-amber-600 transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Tag className="h-3.5 w-3.5" />
              <span>Claim Deal</span>
            </button>
          </div>
        </div>
      );

    case 'quick-add':
      return (
        <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col justify-between hover:shadow-md transition">
          <Link href={`/store/${slug}/products/${product.id}`} className="block aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3 relative">
            {mainImage ? (
              <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ShoppingBag className="h-8 w-8" />
              </div>
            )}
          </Link>
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 truncate">{product.title}</h4>
            <p className="text-sm font-extrabold text-slate-900">₹{effectivePrice.toLocaleString('en-IN')}</p>
            {product.variants.length > 1 && (
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="w-full text-3xs border border-slate-200 rounded-lg p-1 font-medium bg-slate-50"
              >
                {product.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.variantName} ({v.currentStock > 0 ? `In Stock` : 'Out'})
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={handleQuickAdd}
              disabled={!inStock}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1"
            >
              {added ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <ShoppingBag className="h-3.5 w-3.5 text-amber-400" />}
              <span>{added ? 'Added!' : 'Quick Add'}</span>
            </button>
          </div>
        </div>
      );

    case 'minimal':
      return (
        <div className="group flex flex-col cursor-pointer">
          <Link href={`/store/${slug}/products/${product.id}`} className="block overflow-hidden bg-slate-100 aspect-square rounded-lg relative">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ShoppingBag className="h-8 w-8 stroke-1" />
              </div>
            )}
          </Link>
          <div className="pt-2.5 space-y-1">
            {product.categoryName && (
              <p className="text-3xs font-semibold uppercase tracking-widest text-slate-500">{product.categoryName}</p>
            )}
            <Link href={`/store/${slug}/products/${product.id}`}>
              <h4 className="text-xs font-semibold text-slate-900 leading-snug group-hover:text-slate-600 transition line-clamp-2">
                {product.title}
              </h4>
            </Link>
            <p className="text-sm font-extrabold text-slate-900">
              ₹{effectivePrice.toLocaleString('en-IN')}
              {product.mrp > effectivePrice && (
                <span className="ml-1.5 text-2xs font-medium text-slate-500 line-through">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
            </p>
          </div>
        </div>
      );

    case 'featured':
      return (
        <div className="group relative rounded-3xl overflow-hidden bg-slate-900 shadow-lg h-full">
          <Link href={`/store/${slug}/products/${product.id}`} className="block absolute inset-0">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                <ShoppingBag className="h-12 w-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
          </Link>
          <div className="relative h-full flex flex-col justify-end p-5 text-white">
            {product.categoryName && (
              <span className="text-3xs font-extrabold uppercase tracking-widest text-amber-400 mb-1.5">
                {product.categoryName}
              </span>
            )}
            <h4 className="text-lg font-black leading-snug line-clamp-2">{product.title}</h4>
            <div className="flex items-center gap-2 mt-2">
              {discountPct > 0 && (
                <span className="text-3xs font-black uppercase bg-amber-500 text-white px-2 py-0.5 rounded-full">
                  {discountPct}% OFF
                </span>
              )}
              <span className="text-xl font-black">₹{effectivePrice.toLocaleString('en-IN')}</span>
              {product.mrp > effectivePrice && (
                <span className="text-xs text-slate-500 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={handleQuickAdd}
                disabled={!inStock}
                className="flex-1 py-2.5 bg-white text-slate-950 rounded-xl text-xs font-black hover:bg-amber-400 hover:text-slate-950 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {added ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <ShoppingBag className="h-3.5 w-3.5" />}
                <span>{added ? 'Added!' : 'Add to Cart'}</span>
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product); }}
                aria-label="Quick view"
                className="p-2.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      );

    case 'classic':
    default:
      return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
          <div>
            <Link href={`/store/${slug}/products/${product.id}`} className="block relative aspect-4/3 bg-slate-100 overflow-hidden">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                  <ShoppingBag className="h-10 w-10 stroke-1" />
                  <span className="text-2xs font-bold text-slate-400 mt-1">BharatStore</span>
                </div>
              )}
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                {discountPct > 0 && (
                  <span className="bg-amber-500 text-white text-2xs font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                    {discountPct}% OFF
                  </span>
                )}
              </div>
              <div className="absolute top-2.5 right-2.5 z-10">
                {!inStock ? (
                  <span className="bg-rose-600 text-white text-2xs font-bold px-2 py-0.5 rounded-md shadow-xs">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-2xs font-bold px-2 py-0.5 rounded-md shadow-xs">
                    Only {totalStock} left
                  </span>
                ) : null}
              </div>
            </Link>
            <div className="p-4 space-y-2">
              {product.categoryName && (
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                  {product.categoryName}
                </span>
              )}
              <Link href={`/store/${slug}/products/${product.id}`} className="block">
                <h3 className="text-sm font-bold text-slate-900 hover:text-amber-600 transition line-clamp-2">
                  {product.title}
                </h3>
              </Link>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-base font-extrabold text-slate-900">
                  ₹{effectivePrice.toLocaleString('en-IN')}
                </span>
                {product.mrp > effectivePrice && (
                  <span className="text-xs text-slate-500 line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 pt-0 flex items-center gap-2">
            <Link
              href={`/store/${slug}/products/${product.id}`}
              className="flex-1 py-2 px-3 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-200 transition text-center flex items-center justify-center gap-1"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>View</span>
            </Link>
            <button
              onClick={handleQuickAdd}
              disabled={!inStock}
              className="flex-1 py-2 px-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-1 shadow-xs"
            >
              {added ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <ShoppingBag className="h-3.5 w-3.5 text-amber-400" />}
              <span>{added ? 'Added!' : 'Add'}</span>
            </button>
          </div>
        </div>
      );
  }
}
