'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Filter,
  FolderPlus,
  Boxes,
  Tag,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CategoryModal } from '@/components/products/category-modal';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

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
      console.error('Failed to load products', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const filteredProducts = products.filter((product) => {
    if (stockFilter === 'low') return product.isLowStock;
    if (stockFilter === 'out') return product.isOutOfStock;
    if (stockFilter === 'in') return !product.isOutOfStock;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="h-6 w-6 text-amber-600" />
            <span>Product Catalog</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your inventory SKUs, variant pricing, HSN codes & GST tax mapping.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            onClick={() => setIsCategoryModalOpen(true)}
            leftIcon={<FolderPlus className="h-4 w-4 text-slate-600" />}
          >
            Add Category
          </Button>
          <Link href="/products/new">
            <Button variant="accent" leftIcon={<Plus className="h-4 w-4 stroke-[2.5]" />}>
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Card */}
      <Card>
        <CardContent className="p-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by title, SKU, or HSN code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefixSlot={<Search className="h-4 w-4 text-slate-400" />}
            />
          </div>

          {/* Filters Group */}
          <div className="flex items-center gap-3">
            {/* Category Select Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:inline">
                Category:
              </span>
              <select
                className="h-10 px-3 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat._count?.products || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Status Pills */}
            <div className="flex items-center border border-slate-200 rounded-md bg-slate-100 p-0.5 text-xs font-medium">
              <button
                onClick={() => setStockFilter('all')}
                className={`px-2.5 py-1.5 rounded-sm transition ${
                  stockFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStockFilter('in')}
                className={`px-2.5 py-1.5 rounded-sm transition ${
                  stockFilter === 'in' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Stock
              </button>
              <button
                onClick={() => setStockFilter('low')}
                className={`px-2.5 py-1.5 rounded-sm transition ${
                  stockFilter === 'low' ? 'bg-amber-500 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Low Stock
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catalog Data Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
              <span className="text-sm font-medium">Loading catalog products...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Boxes className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">No products found</h3>
                <p className="text-xs text-slate-500">
                  {search || selectedCategory || stockFilter !== 'all'
                    ? 'No products match your active search filters.'
                    : 'Get started by creating your first product SKU with HSN tax mapping.'}
                </p>
              </div>
              <Link href="/products/new">
                <Button variant="accent" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                  Create First Product
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-2xs font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Product Title & HSN</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">MRP / Selling Price</th>
                    <th className="px-6 py-3.5">Variants</th>
                    <th className="px-6 py-3.5">Stock Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 font-mono text-2xs font-bold uppercase">
                            {product.images && product.images[0] ? (
                              <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover rounded-lg" />
                            ) : (
                              'SKU'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>{product.title}</span>
                              {!product.isPublished && (
                                <Badge variant="outline" size="sm">
                                  Draft
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-2xs text-slate-500 font-mono mt-0.5">
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                                HSN: {product.hsnCode}
                              </span>
                              <span>GST: {Number(product.gstRate)}%</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-700">
                        {product.category?.name || 'Uncategorized'}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold font-tabular text-slate-900">
                          ₹{Number(product.sellingPrice).toLocaleString('en-IN')}
                        </div>
                        {Number(product.mrp) > Number(product.sellingPrice) && (
                          <div className="text-2xs text-slate-400 line-through font-tabular">
                            MRP ₹{Number(product.mrp).toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          {product.variants?.length || 0} Variant{(product.variants?.length || 0) > 1 ? 's' : ''}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {product.isOutOfStock ? (
                          <Badge variant="destructive">Out of Stock (0)</Badge>
                        ) : product.isLowStock ? (
                          <Badge variant="warning" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Low Stock ({product.totalStock})</span>
                          </Badge>
                        ) : (
                          <Badge variant="success">
                            In Stock ({product.totalStock})
                          </Badge>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/products/${product.id}/edit`}>
                            <button
                              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                              title="Edit Product"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Creation Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={() => {
          fetchCategories();
          fetchProducts();
        }}
      />
    </div>
  );
}
