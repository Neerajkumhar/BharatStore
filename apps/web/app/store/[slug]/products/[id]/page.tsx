import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@bharatstore/database';
import { ProductDetailView } from '@/components/storefront/product-detail-view';

export default async function StorefrontProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true, tradeName: true, isActive: true },
  });

  if (!tenant || !tenant.isActive) {
    notFound();
  }

  const product = await prisma.product.findFirst({
    where: {
      tenantId: tenant.id,
      isPublished: true,
      OR: [{ id }, { slug: id }],
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      variants: {
        select: {
          id: true,
          sku: true,
          barcode: true,
          variantName: true,
          priceOverride: true,
          weightGrams: true,
          currentStock: true,
          lowStockAlert: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const formattedProduct = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    hsnCode: product.hsnCode,
    gstRate: Number(product.gstRate),
    sellingPrice: Number(product.sellingPrice),
    mrp: Number(product.mrp),
    images: product.images,
    categoryName: product.category.name,
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      variantName: v.variantName,
      priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
      effectivePrice: v.priceOverride ? Number(v.priceOverride) : Number(product.sellingPrice),
      weightGrams: v.weightGrams,
      currentStock: v.currentStock,
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductDetailView slug={slug} product={formattedProduct} />
    </div>
  );
}
