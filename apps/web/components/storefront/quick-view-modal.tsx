'use client';

import React, { useState } from 'react';
import { X, ShoppingBag, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useCart } from './cart-context';

export interface QuickViewModalProps {
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
  } | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product?.variants[0]?.id || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const selectedVar = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const effectivePrice = selectedVar?.priceOverride ? selectedVar.priceOverride : product.sellingPrice;
  const inStock = selectedVar ? selectedVar.currentStock > 0 : false;
  const mainImage = product.images?.[0];

  const handleAdd = () => {
    if (!selectedVar || !inStock) return;
    addToCart({
      variantId: selectedVar.id,
      productId: product.id,
      productTitle: product.title,
      variantName: selectedVar.variantName,
      sku: selectedVar.sku,
      unitPrice: effectivePrice,
      mrp: product.mrp,
      quantity,
      maxStock: selectedVar.currentStock,
      image: mainImage,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row">
        <button
          onClick={onClose}
          aria-label="Close Quick View"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Product Image */}
        <div className="md:w-1/2 bg-slate-100 aspect-square relative overflow-hidden">
          {mainImage ? (
            <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ShoppingBag className="h-16 w-16" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-4">
          <div>
            {product.categoryName && (
              <span className="text-3xs font-extrabold uppercase tracking-widest text-amber-600">
                {product.categoryName}
              </span>
            )}
            <h3 className="text-lg font-bold text-slate-900 mt-1">{product.title}</h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl font-black text-slate-900">₹{effectivePrice.toLocaleString('en-IN')}</span>
              {product.mrp > effectivePrice && (
                <span className="text-sm text-slate-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
              )}
            </div>

            {/* Variant Selector */}
            {product.variants.length > 0 && (
              <div className="mt-4 space-y-2">
                <label className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                  Select Variant
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        selectedVariantId === v.id
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {v.variantName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 bg-slate-50 hover:bg-slate-100 font-bold"
                >
                  -
                </button>
                <span className="px-3 py-1 font-bold text-xs">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 bg-slate-50 hover:bg-slate-100 font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleAdd}
              disabled={!inStock}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition flex items-center justify-center gap-2 shadow-md"
            >
              {added ? <Check className="h-4 w-4 text-emerald-400" /> : <ShoppingBag className="h-4 w-4 text-amber-400" />}
              <span>{added ? 'Added to Cart!' : inStock ? 'Add to Cart' : 'Out of Stock'}</span>
            </button>

            <div className="grid grid-cols-3 gap-2 text-center text-3xs font-semibold text-slate-500 pt-1">
              <div className="flex items-center justify-center gap-1"><Truck className="h-3.5 w-3.5 text-amber-500" /> Fast Delivery</div>
              <div className="flex items-center justify-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> GST Invoice</div>
              <div className="flex items-center justify-center gap-1"><RefreshCw className="h-3.5 w-3.5 text-amber-500" /> Easy Return</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
