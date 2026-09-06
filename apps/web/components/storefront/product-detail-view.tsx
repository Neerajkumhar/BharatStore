'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Check, Plus, Minus } from 'lucide-react';
import { useCart } from './cart-context';

export interface ProductDetailViewProps {
  slug: string;
  product: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    hsnCode?: string | null;
    gstRate: number;
    sellingPrice: number;
    mrp: number;
    images?: string[];
    categoryName?: string;
    variants: Array<{
      id: string;
      sku: string;
      variantName: string;
      priceOverride?: number | null;
      effectivePrice: number;
      weightGrams: number;
      currentStock: number;
    }>;
  };
}

export function ProductDetailView({ slug, product }: ProductDetailViewProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const currentPrice = selectedVariant ? selectedVariant.effectivePrice : product.sellingPrice;
  const currentStock = selectedVariant ? selectedVariant.currentStock : 0;
  const inStock = currentStock > 0;

  const discountPct =
    product.mrp > currentPrice
      ? Math.round(((product.mrp - currentPrice) / product.mrp) * 100)
      : 0;

  const handleAddToCart = () => {
    if (!selectedVariant || !inStock) return;

    addToCart({
      variantId: selectedVariant.id,
      productId: product.id,
      productTitle: product.title,
      variantName: selectedVariant.variantName,
      sku: selectedVariant.sku,
      unitPrice: currentPrice,
      mrp: product.mrp,
      quantity,
      maxStock: currentStock,
      image: product.images?.[0],
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push(`/store/${slug}/checkout`);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href={`/store/${slug}`} className="hover:text-slate-900 transition">
          Home
        </Link>
        <span>/</span>
        <Link href={`/store/${slug}/products`} className="hover:text-slate-900 transition">
          Products
        </Link>
        <span>/</span>
        <span className="text-slate-900 truncate max-w-xs">{product.title}</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-200">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                <ShoppingBag className="h-16 w-16 stroke-1" />
                <span className="text-xs font-bold text-slate-400 mt-2">BharatStore</span>
              </div>
            )}

            {discountPct > 0 && (
              <span className="absolute top-4 left-4 bg-amber-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-lg shadow-md">
                {discountPct}% OFF
              </span>
            )}
          </div>

          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`h-16 w-16 rounded-xl overflow-hidden border-2 transition ${idx === activeImageIndex ? 'border-amber-500 shadow-sm' : 'border-slate-200 opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Details & Variant Selection */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {product.categoryName && (
              <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-800 text-2xs font-extrabold rounded-md uppercase tracking-wider">
                {product.categoryName}
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.title}
            </h1>

            {selectedVariant && (
              <p className="text-2xs text-slate-500 font-mono">
                SKU: {selectedVariant.sku} {product.hsnCode && `• HSN: ${product.hsnCode}`}
              </p>
            )}

            {/* Price & MRP Row */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-extrabold text-slate-900">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {product.mrp > currentPrice && (
                <span className="text-base text-slate-400 line-through">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-2xs text-slate-500 font-medium">
                (Includes GST at {product.gstRate}%)
              </span>
            </div>

            {/* Variant Selector Matrix */}
            {product.variants.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Variant:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const isSelected = variant.id === selectedVariantId;
                    const variantInStock = variant.currentStock > 0;

                    return (
                      <button
                        key={variant.id}
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                          setQuantity(1);
                        }}
                        disabled={!variantInStock}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : variantInStock ? 'bg-white text-slate-800 border-slate-300 hover:border-slate-400' : 'bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed'}`}
                      >
                        <span>{variant.variantName}</span>
                        {variant.priceOverride && (
                          <span className={isSelected ? 'text-amber-400' : 'text-slate-500'}>
                            ₹{variant.priceOverride}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock Availability Badge */}
            <div className="pt-2">
              {inStock ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <Check className="h-4 w-4 bg-emerald-100 rounded-full p-0.5" />
                  <span>In Stock</span>
                  <span className="text-slate-400 font-normal">
                    ({currentStock} units available for immediate dispatch)
                  </span>
                </div>
              ) : (
                <div className="text-xs font-bold text-rose-600">
                  Currently Out of Stock
                </div>
              )}
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="pt-4 border-t border-slate-100 space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Description</h4>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons & Quantity */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-300 bg-slate-50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || !inStock}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 text-sm font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  disabled={quantity >= currentStock || !inStock}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 py-3.5 px-6 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-md"
              >
                <ShoppingBag className="h-4 w-4 text-amber-400" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="flex-1 py-3.5 px-6 bg-amber-500 text-slate-950 rounded-xl font-bold text-sm hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition text-center shadow-md"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
