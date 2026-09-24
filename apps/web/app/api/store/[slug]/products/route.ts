import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { getRequestStoreLookupFromRequest, findStorefrontTenant } from '@/lib/storefront-resolver';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get('categoryId') || undefined;
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const lookup = getRequestStoreLookupFromRequest(request, slug);
    const tenant = await findStorefrontTenant(lookup, {
      select: { id: true, isActive: true },
    });

    if (!tenant || !tenant.isActive) {
      return NextResponse.json({ error: 'Storefront not found' }, { status: 404 });
    }

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
              barcode: true,
              variantName: true,
              priceOverride: true,
              weightGrams: true,
              currentStock: true,
              lowStockAlert: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: products.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        hsnCode: p.hsnCode,
        gstRate: Number(p.gstRate),
        sellingPrice: Number(p.sellingPrice),
        mrp: Number(p.mrp),
        baseCost: Number(p.baseCost),
        images: p.images,
        isPublished: p.isPublished,
        category: p.category,
        variants: p.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          variantName: v.variantName,
          priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
          weightGrams: v.weightGrams,
          currentStock: v.currentStock,
          inStock: v.currentStock > 0,
        })),
        totalStock: p.variants.reduce((acc, v) => acc + v.currentStock, 0),
        inStock: p.variants.some((v) => v.currentStock > 0),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch public products error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}
