import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@bharatstore/database';
import { getRequestStoreLookup, findStorefrontTenant } from '@/lib/storefront-resolver';
import { ProductCard } from '@/components/storefront/product-card';
import { Filter, Layers, Search, ShoppingBag } from 'lucide-react';

export default async function StorefrontProductCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ categoryId?: string; search?: string; sort?: string; page?: string }>;
}) {
  const { slug } = await params;
  const sParams = await searchParams;

  const categoryId = sParams.categoryId || undefined;
  const search = sParams.search || undefined;
  const sort = sParams.sort || 'newest';
  const page = parseInt(sParams.page || '1', 10);
  const limit = 12;

  const lookup = await getRequestStoreLookup(slug);
  const tenant = await findStorefrontTenant(lookup, {
    select: { id: true, tradeName: true, isActive: true },
  });

  if (!tenant || !tenant.isActive) {
    notFound();
  }

  // Fetch Categories for Sidebar / Tabs
  const categories = await prisma.category.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { products: { where: { isPublished: true } } } },
    },
  });

  // Build Prisma query conditions
  const where: any = {
    tenantId: tenant.id,
    isPublished: true,
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { variants: { some: { sku: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') {
    orderBy = { sellingPrice: 'asc' };
  } else if (sort === 'price_desc') {
    orderBy = { sellingPrice: 'desc' };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: {
          select: {
            id: true,
            sku: true,
            variantName: true,
            priceOverride: true,
            weightGrams: true,
            currentStock: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Store Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            {total} Products available in {tenant.tradeName}
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Sort by:</span>
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 text-xs font-semibold">
            <Link
              href={`/store/${slug}/products?${new URLSearchParams({ ...(categoryId && { categoryId }), ...(search && { search }), sort: 'newest' }).toString()}`}
              className={`px-3 py-1.5 rounded-lg transition ${sort === 'newest' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Newest
            </Link>
            <Link
              href={`/store/${slug}/products?${new URLSearchParams({ ...(categoryId && { categoryId }), ...(search && { search }), sort: 'price_asc' }).toString()}`}
              className={`px-3 py-1.5 rounded-lg transition ${sort === 'price_asc' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Price: Low to High
            </Link>
            <Link
              href={`/store/${slug}/products?${new URLSearchParams({ ...(categoryId && { categoryId }), ...(search && { search }), sort: 'price_desc' }).toString()}`}
              className={`px-3 py-1.5 rounded-lg transition ${sort === 'price_desc' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Price: High to Low
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Categories Filter */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              <Filter className="h-4 w-4 text-amber-500" />
              <span>Categories</span>
            </div>

            <div className="space-y-1">
              <Link
                href={`/store/${slug}/products`}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${!categoryId ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <span>All Categories</span>
                <span className="text-2xs opacity-75">{total}</span>
              </Link>

              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/store/${slug}/products?categoryId=${cat.id}`}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${categoryId === cat.id ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <span>{cat.name}</span>
                  <span className="text-2xs opacity-75">{cat._count.products}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-6">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const formattedProduct = {
                  id: product.id,
                  title: product.title,
                  slug: product.slug,
                  sellingPrice: Number(product.sellingPrice),
                  mrp: Number(product.mrp),
                  images: product.images,
                  categoryName: product.category.name,
                  variants: product.variants.map((v) => ({
                    id: v.id,
                    sku: v.sku,
                    variantName: v.variantName,
                    priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
                    currentStock: v.currentStock,
                  })),
                };

                return <ProductCard key={product.id} slug={slug} product={formattedProduct} />;
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <ShoppingBag className="h-12 w-12 mx-auto text-slate-300 stroke-1" />
              <h3 className="text-base font-bold text-slate-800">No products match your criteria</h3>
              <p className="text-xs text-slate-500">Try clearing your category filter or search terms.</p>
              <Link
                href={`/store/${slug}/products`}
                className="inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition mt-2"
              >
                Reset Filters
              </Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-200">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <Link
                  key={pNum}
                  href={`/store/${slug}/products?${new URLSearchParams({ ...(categoryId && { categoryId }), ...(search && { search }), sort, page: pNum.toString() }).toString()}`}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${pNum === page ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                >
                  {pNum}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
