import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { getRequestStoreLookupFromRequest, findStorefrontTenant } from '@/lib/storefront-resolver';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params;

    const lookup = getRequestStoreLookupFromRequest(request, slug);
    const tenant = await findStorefrontTenant(lookup, {
      select: { id: true, isActive: true },
    });

    if (!tenant || !tenant.isActive) {
      return NextResponse.json({ error: 'Storefront not found' }, { status: 404 });
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
      return NextResponse.json({ error: 'Product not found or unavailable' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        hsnCode: product.hsnCode,
        gstRate: Number(product.gstRate),
        sellingPrice: Number(product.sellingPrice),
        mrp: Number(product.mrp),
        images: product.images,
        category: product.category,
        variants: product.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          variantName: v.variantName,
          priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
          effectivePrice: v.priceOverride ? Number(v.priceOverride) : Number(product.sellingPrice),
          weightGrams: v.weightGrams,
          currentStock: v.currentStock,
          inStock: v.currentStock > 0,
        })),
        totalStock: product.variants.reduce((acc, v) => acc + v.currentStock, 0),
        inStock: product.variants.some((v) => v.currentStock > 0),
      },
    });
  } catch (error: any) {
    console.error('Fetch public product detail error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch product detail' }, { status: 500 });
  }
}
