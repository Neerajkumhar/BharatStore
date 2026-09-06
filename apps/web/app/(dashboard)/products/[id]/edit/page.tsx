'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Edit3,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Trash2,
  Tag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { COMMON_HSN_CODES, GST_SLABS } from '@bharatstore/shared/constants';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [product, setProduct] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [gstRate, setGstRate] = useState<number>(5);
  const [baseCost, setBaseCost] = useState<number>(0);
  const [mrp, setMrp] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [isPublished, setIsPublished] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      });

    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const p = data.data;
          setProduct(p);
          setTitle(p.title);
          setCategoryId(p.categoryId);
          setDescription(p.description || '');
          setHsnCode(p.hsnCode);
          setGstRate(Number(p.gstRate));
          setBaseCost(Number(p.baseCost));
          setMrp(Number(p.mrp));
          setSellingPrice(Number(p.sellingPrice));
          setIsPublished(p.isPublished);
        } else {
          setError('Product not found');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          categoryId,
          description,
          hsnCode,
          gstRate,
          baseCost,
          mrp,
          sellingPrice,
          isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update product');
      }

      router.push('/products');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
        <span className="text-sm font-medium">Fetching product details...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/products">
            <button
              type="button"
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition text-slate-600"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Edit3 className="h-6 w-6 text-amber-600" />
              <span>Edit Product SKU</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Update details for <span className="font-semibold text-slate-800">{product?.title}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/products">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button variant="accent" type="submit" isLoading={isSaving} leftIcon={<CheckCircle2 className="h-4 w-4" />}>
            Save Changes
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Product Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">Category</label>
                <select
                  className="w-full h-10 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">Description</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & GST Tax Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="HSN Code"
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                  required
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">GST Slab Rate (%)</label>
                  <select
                    className="w-full h-10 px-3 border border-slate-300 rounded-md bg-white text-sm font-semibold text-slate-900 focus:outline-none"
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                  >
                    {GST_SLABS.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}% GST
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <Input
                  label="Selling Price (₹)"
                  type="number"
                  prefixSlot="₹"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  required
                />
                <Input
                  label="MRP (₹)"
                  type="number"
                  prefixSlot="₹"
                  value={mrp}
                  onChange={(e) => setMrp(Number(e.target.value))}
                  required
                />
                <Input
                  label="Base Cost (₹)"
                  type="number"
                  prefixSlot="₹"
                  value={baseCost}
                  onChange={(e) => setBaseCost(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Existing Variants */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Existing SKUs & Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product?.variants?.map((v: any) => (
                <div key={v.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{v.variantName}</div>
                    <div className="font-mono text-2xs text-slate-500">SKU: {v.sku}</div>
                  </div>
                  <Badge variant={v.currentStock > 0 ? 'success' : 'destructive'} size="sm">
                    Stock: {v.currentStock}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
