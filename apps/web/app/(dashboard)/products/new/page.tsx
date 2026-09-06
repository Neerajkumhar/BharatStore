'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PackagePlus,
  ArrowLeft,
  Sparkles,
  Info,
  CheckCircle2,
  Tag,
  IndianRupee,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VariantMatrixGenerator, VariantRow } from '@/components/products/variant-matrix-generator';
import { COMMON_HSN_CODES, GST_SLABS } from '@bharatstore/shared/constants';

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);

  // Form states
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [hsnCode, setHsnCode] = useState('5007');
  const [gstRate, setGstRate] = useState<number>(5);
  const [baseCost, setBaseCost] = useState<number>(1200);
  const [mrp, setMrp] = useState<number>(3500);
  const [sellingPrice, setSellingPrice] = useState<number>(2499);
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // Variant Matrix
  const [variants, setVariants] = useState<VariantRow[]>([
    {
      sku: 'SILK-RED-STD',
      barcode: '',
      variantName: 'Red / Standard',
      weightGrams: 600,
      initialStock: 15,
      lowStockAlert: 3,
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setCategories(data.data);
          setCategoryId(data.data[0].id);
        }
      })
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  const handleHsnSelect = (presetCode: string) => {
    const preset = COMMON_HSN_CODES.find((h) => h.code === presetCode);
    if (preset) {
      setHsnCode(preset.code);
      setGstRate(preset.gstRate);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId || !hsnCode) {
      setError('Please fill in all required fields (Title, Category, HSN Code)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
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
          images: imageUrl ? [imageUrl] : [],
          variants,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      router.push('/products');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {/* Top Header */}
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
              <PackagePlus className="h-6 w-6 text-amber-600" />
              <span>Add New Product SKU</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Set up pricing, Indian HSN/SAC GST tax classification, and variant matrix.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/products">
            <Button variant="outline" type="button">
              Discard
            </Button>
          </Link>
          <Button variant="accent" type="submit" isLoading={isLoading} leftIcon={<CheckCircle2 className="h-4 w-4" />}>
            Save Product
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Product Details (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Product Information</CardTitle>
              <CardDescription>Title, category, and catalog description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Product Title"
                placeholder="e.g. Kanjeevaram Pure Silk Handloom Saree"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">Category</label>
                  <select
                    className="w-full h-10 px-3 border border-slate-300 rounded-md bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Product Main Image URL"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">Detailed Description</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400"
                  rows={4}
                  placeholder="Describe material, weave pattern, care instructions, and dimensions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & GST Tax Mapping */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pricing & GST Tax Classification</CardTitle>
                  <CardDescription>Indian GST HSN/SAC code mapping and pricing matrix</CardDescription>
                </div>
                <div className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-2xs font-mono font-bold rounded">
                  GST 2026 Engine
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Common HSN Preset Selector */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-2xs uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-600" />
                  Quick HSN Presets (Auto-fills Code & Tax Slab)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_HSN_CODES.map((preset) => (
                    <button
                      key={preset.code}
                      type="button"
                      onClick={() => handleHsnSelect(preset.code)}
                      className={`px-2.5 py-1 rounded text-2xs font-mono font-medium transition ${
                        hsnCode === preset.code
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      HSN {preset.code} ({preset.gstRate}%)
                    </button>
                  ))}
                </div>
              </div>

              {/* HSN & Rate Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="HSN / SAC Code"
                  placeholder="5007"
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                  required
                  helperText="4 to 8 digit Indian Harmonized System Nomenclature"
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">GST Slab Rate (%)</label>
                  <select
                    className="w-full h-10 px-3 border border-slate-300 rounded-md bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                  >
                    {GST_SLABS.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}% GST ({rate === 0 ? 'Exempt / Zero Rated' : `${rate / 2}% CGST + ${rate / 2}% SGST`})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Fields */}
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
                  label="MRP (Maximum Retail Price)"
                  type="number"
                  prefixSlot="₹"
                  value={mrp}
                  onChange={(e) => setMrp(Number(e.target.value))}
                  required
                />
                <Input
                  label="Base Purchase Cost (₹)"
                  type="number"
                  prefixSlot="₹"
                  value={baseCost}
                  onChange={(e) => setBaseCost(Number(e.target.value))}
                  helperText="Used for profit margin analysis"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Variants & Stock Matrix */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Variant & Initial Stock Matrix</CardTitle>
              <CardDescription>Generate multi-SKU combinations and initial stock inward balance</CardDescription>
            </CardHeader>
            <CardContent>
              <VariantMatrixGenerator
                baseTitle={title || 'PRODUCT'}
                variants={variants}
                onChange={setVariants}
              />
            </CardContent>
          </Card>

          {/* Visibility Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Storefront Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800">Publish immediately to Online Storefront</span>
                  <span className="text-2xs text-slate-400">Make product available for POS counter & online catalog</span>
                </div>
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
