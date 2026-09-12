'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  Search,
  Plus,
  Boxes,
  Loader2,
  Tag,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PosCart, CartItem } from '@/components/pos/pos-cart';
import { ReceiptModal } from '@/components/pos/receipt-modal';

export default function PosPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Cart & Receipt state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [completedOrderData, setCompletedOrderData] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((res) => res.json()),
      fetch('/api/customers').then((res) => res.json()),
    ]).then(([catData, custData]) => {
      if (catData.success) setCategories(catData.data);
      if (custData.success) setCustomers(custData.data);
    });
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategory) params.set('categoryId', selectedCategory);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch (err) {
      console.error('Failed to load POS products', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const handleAddToCart = (product: any, variant: any) => {
    const existingIdx = cartItems.findIndex((item) => item.variantId === variant.id);
    const price = variant.priceOverride ? Number(variant.priceOverride) : Number(product.sellingPrice);

    if (existingIdx > -1) {
      const updated = [...cartItems];
      updated[existingIdx].quantity += 1;
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          variantId: variant.id,
          productTitle: product.title,
          variantName: variant.variantName,
          sku: variant.sku,
          price,
          gstRate: Number(product.gstRate),
          quantity: 1,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(variantId);
      return;
    }
    setCartItems(cartItems.map((item) => (item.variantId === variantId ? { ...item, quantity } : item)));
  };

  const handleRemoveItem = (variantId: string) => {
    setCartItems(cartItems.filter((item) => item.variantId !== variantId));
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-4 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-xs">
            POS
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Counter POS Terminal #01</h1>
            <p className="text-2xs text-slate-300">
              Varanasi Storefront ● Walk-in Fast Billing & Instant Receipt Generation
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Product Catalog Grid (Flex-1) */}
        <div className="flex-1 space-y-4 min-w-0 w-full">
          {/* Search & Category Filter Pills */}
          <Card>
            <CardContent className="p-3 space-y-3">
              <Input
                placeholder="Search catalog by title, SKU, or HSN code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                prefixSlot={<Search className="h-4 w-4 text-slate-400" />}
              />

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition ${
                    selectedCategory === ''
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition ${
                      selectedCategory === cat.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Product Items Grid */}
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500 gap-2 bg-white rounded-xl border border-slate-200">
              <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
              <span className="text-sm font-medium">Loading catalog SKUs...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-xl border border-slate-200 space-y-2">
              <Boxes className="h-8 w-8 mx-auto text-slate-300" />
              <p>No product SKUs available in catalog.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {products.map((product) =>
                product.variants?.map((variant: any) => {
                  const price = variant.priceOverride
                    ? Number(variant.priceOverride)
                    : Number(product.sellingPrice);
                  const isOutOfStock = variant.currentStock === 0;

                  return (
                    <div
                      key={variant.id}
                      onClick={() => !isOutOfStock && handleAddToCart(product, variant)}
                      className={`p-3 rounded-xl border bg-white shadow-xs transition select-none flex flex-col justify-between h-36 ${
                        isOutOfStock
                          ? 'opacity-50 border-slate-200 cursor-not-allowed'
                          : 'border-slate-200 hover:border-amber-500 hover:shadow-md cursor-pointer active:scale-[0.99]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-bold text-slate-900 text-xs line-clamp-1">
                            {product.title}
                          </h3>
                          <span className="text-2xs font-mono font-semibold bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                            {product.hsnCode}
                          </span>
                        </div>
                        <p className="text-2xs text-slate-500 font-mono truncate">
                          {variant.variantName} ({variant.sku})
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div>
                          <div className="font-extrabold text-sm font-tabular text-slate-900">
                            ₹{price.toLocaleString('en-IN')}
                          </div>
                          <div className="text-2xs text-slate-400">GST: {Number(product.gstRate)}%</div>
                        </div>

                        {isOutOfStock ? (
                          <Badge variant="destructive" size="sm">
                            Out of Stock
                          </Badge>
                        ) : (
                          <button
                            type="button"
                            className="h-8 w-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold hover:bg-amber-600 transition shadow-xs"
                          >
                            <Plus className="h-4 w-4 stroke-[2.5]" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Right Column: POS Cart Drawer (Fixed Width on Desktop) */}
        <PosCart
          cartItems={cartItems}
          customers={customers}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={() => setCartItems([])}
          onCheckoutSuccess={(orderData) => setCompletedOrderData(orderData)}
        />
      </div>

      {/* Printable Thermal/A4 Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(completedOrderData)}
        onClose={() => setCompletedOrderData(null)}
        orderData={completedOrderData}
      />
    </div>
  );
}
