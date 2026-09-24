import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@bharatstore/database';
import { getRequestStoreLookup, findStorefrontTenant } from '@/lib/storefront-resolver';
import { ArrowRight, ShoppingBag, Layers, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { ProductCard } from '@/components/storefront/product-card';
import { StorefrontRenderer } from '@/components/storefront/storefront-renderer';

export default async function StorefrontHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string; draft?: string }>;
}) {
  const { slug } = await params;
  const sParams = (await searchParams) || {};
  const isPreviewMode = sParams.preview === 'true' || sParams.draft === 'true';

  const lookup = await getRequestStoreLookup(slug);
  const tenant = await findStorefrontTenant(lookup, {
    include: { storefrontTheme: true },
  });

  if (!tenant || !tenant.isActive) {
    notFound();
  }

  const theme = tenant.storefrontTheme;

  // Use draftConfig if previewing or if publishedConfig is not yet set
  const activeConfig = (isPreviewMode
    ? theme?.draftConfig || theme?.publishedConfig
    : theme?.publishedConfig || theme?.draftConfig) as any;

  if (activeConfig && activeConfig.sections && activeConfig.sections.length > 0) {
    return (
      <StorefrontRenderer
        config={activeConfig}
        slug={slug}
        tenantId={tenant.id}
        isPreview={isPreviewMode}
        storeData={{
          tradeName: tenant.tradeName,
          phone: theme?.contactPhone || tenant.phone,
          email: theme?.contactEmail || tenant.email || undefined,
          address: tenant.addressLine1,
          city: tenant.city,
          pincode: tenant.pincode,
          gstin: tenant.gstin || undefined,
          businessHours: theme?.businessHours || undefined,
          socialLinks: (theme?.socialLinks as any) || {},
        }}
      />
    );
  }

  // Fallback: hardcoded storefront (backward compatible)
  const [categories, featuredProducts] = await Promise.all([
    prisma.category.findMany({
      where: { tenantId: tenant.id },
      take: 6,
      include: {
        _count: { select: { products: { where: { isPublished: true } } } },
      },
    }),
    prisma.product.findMany({
      where: { tenantId: tenant.id, isPublished: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
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
  ]);

  const heroTitle = theme?.heroTitle || `Welcome to ${tenant.tradeName}`;
  const heroSubtitle = theme?.heroSubtitle || 'Quality products delivered straight to your doorstep';

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-16 px-4 sm:px-6 lg:px-8 shadow-md">
        {theme?.heroBannerUrl && (
          <div className="absolute inset-0 z-0 opacity-20">
            <img src={theme.heroBannerUrl} alt="Hero Banner" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-full text-2xs font-semibold text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Official Online Store</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {heroTitle}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>

          <div className="pt-4 flex items-center justify-center gap-3">
            <Link
              href={`/store/${slug}/products`}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition shadow-lg"
            >
              <span>Explore Products</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Shop by Category</h2>
              <p className="text-xs text-slate-500 mt-0.5">Browse curated product collections</p>
            </div>
            <Link
              href={`/store/${slug}/products`}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/store/${slug}/products?categoryId=${cat.id}`}
                className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:border-amber-500 hover:shadow-md transition-all group flex flex-col items-center space-y-2"
              >
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition truncate w-full">
                  {cat.name}
                </h3>
                <span className="text-2xs text-slate-500 font-medium">
                  {cat._count.products} Products
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Featured Products</h2>
            <p className="text-xs text-slate-500 mt-0.5">Fresh stock available for direct ordering</p>
          </div>
          <Link
            href={`/store/${slug}/products`}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
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
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 space-y-2">
            <ShoppingBag className="h-10 w-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium">No products published in storefront catalog yet.</p>
          </div>
        )}
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600">
              <ShieldCheck className="h-4 w-4" />
              <span>Direct Store Guarantee</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Fast Local Delivery with Instant Tax Invoice
            </h3>
            <p className="text-xs text-slate-500">
              All orders are processed directly by {tenant.tradeName}. Pay securely via Cash, UPI, or Khata credit.
            </p>
          </div>

          <Link
            href={`/store/${slug}/products`}
            className="shrink-0 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            Browse Store Catalog
          </Link>
        </div>
      </section>
    </div>
  );
}
