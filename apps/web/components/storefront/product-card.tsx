'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Check, AlertTriangle, Eye } from 'lucide-react';
import { useCart } from './cart-context';

export interface ProductCardProps {
  slug: string;
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
}

export function ProductCard({ slug, product }: ProductCardProps) {
  const { addToCart } = useCart();

  const primaryVariant = product.variants[0];
  const totalStock = product.variants.reduce((acc, v) => acc + v.currentStock, 0);
  const inStock = totalStock > 0;
  const isLowStock = inStock && totalStock <= 5;

  const effectivePrice = primaryVariant?.priceOverride
    ? primaryVariant.priceOverride
    : product.sellingPrice;

  const discountPct =
    product.mrp > effectivePrice
      ? Math.round(((product.mrp - effectivePrice) / product.mrp) * 100)
      : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!primaryVariant || !inStock) return;

    addToCart({
      variantId: primaryVariant.id,
      productId: product.id,
      productTitle: product.title,
      variantName: primaryVariant.variantName,
      sku: primaryVariant.sku,
      unitPrice: effectivePrice,
      mrp: product.mrp,
      quantity: 1,
      maxStock: primaryVariant.currentStock,
      image: product.images?.[0],
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
      <div>
        {/* Product Image Container */}
        <Link href={`/store/${slug}/products/${product.id}`} className="block relative aspect-4/3 bg-slate-100 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
              <ShoppingBag className="h-10 w-10 stroke-1" />
              <span className="text-2xs font-bold text-slate-400 mt-1">BharatStore</span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {discountPct > 0 && (
              <span className="bg-amber-500 text-slate-950 text-2xs font-extrabold px-2 py-0.5 rounded-md shadow-xs">
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

        {/* Content Details */}
        <div className="p-4 space-y-2">
          {product.categoryName && (
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
              {product.categoryName}
            </span>
          )}

          <Link href={`/store/${slug}/products/${product.id}`} className="block">
            <h3 className="text-sm font-bold text-slate-900 hover:text-amber-600 transition line-clamp-2">
              {product.title}
            </h3>
          </Link>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-base font-extrabold text-slate-900">
              ₹{effectivePrice.toLocaleString('en-IN')}
            </span>
            {product.mrp > effectivePrice && (
              <span className="text-xs text-slate-400 line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
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
          <ShoppingBag className="h-3.5 w-3.5 text-amber-400" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}
