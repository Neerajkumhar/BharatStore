import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { createProductSchema } from '@bharatstore/shared/schemas';

async function getActiveTenantId(request: Request): Promise<string> {
  const headerTenantId = request.headers.get('x-tenant-id');
  if (headerTenantId) return headerTenantId;

  const firstTenant = await prisma.tenant.findFirst();
  if (!firstTenant) {
    throw new Error('No active tenant found in system');
  }
  return firstTenant.id;
}

export async function GET(request: Request) {
  try {
    const tenantId = await getActiveTenantId(request);
    const tenantDb = getTenantDb(tenantId);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const stockStatus = searchParams.get('stockStatus'); // 'low', 'out', 'in'

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { hsnCode: { contains: search, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      tenantDb.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          variants: true,
        },
      }),
      tenantDb.product.count({ where }),
    ]);

    // Calculate total stock per product and map stock status
    const data = products.map((product: any) => {
      const totalStock = product.variants.reduce((acc: number, v: any) => acc + v.currentStock, 0);
      const isLowStock = product.variants.some((v: any) => v.currentStock > 0 && v.currentStock <= v.lowStockAlert);
      const isOutOfStock = totalStock === 0;

      return {
        ...product,
        totalStock,
        isLowStock,
        isOutOfStock,
      };
    });

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = await getActiveTenantId(request);
    const tenantDb = getTenantDb(tenantId);
    const userId = request.headers.get('x-user-id') || null;

    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      title,
      categoryId,
      description,
      hsnCode,
      gstRate,
      baseCost,
      mrp,
      sellingPrice,
      isPublished,
      images,
      variants,
    } = parsed.data;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          tenantId,
          categoryId,
          title,
          slug,
          description: description || null,
          hsnCode,
          gstRate,
          baseCost,
          mrp,
          sellingPrice,
          isPublished,
          images,
        },
      });

      const createdVariants = [];
      for (const variantInput of variants) {
        const variant = await tx.productVariant.create({
          data: {
            tenantId,
            productId: product.id,
            sku: variantInput.sku,
            barcode: variantInput.barcode || null,
            variantName: variantInput.variantName,
            priceOverride: variantInput.priceOverride || null,
            weightGrams: variantInput.weightGrams,
            currentStock: variantInput.initialStock,
            lowStockAlert: variantInput.lowStockAlert,
          },
        });

        if (variantInput.initialStock > 0) {
          await tx.inventoryLedger.create({
            data: {
              tenantId,
              variantId: variant.id,
              changeQuantity: variantInput.initialStock,
              balanceAfter: variantInput.initialStock,
              eventType: 'INWARD',
              notes: 'Initial stock inward on product creation',
              createdById: userId,
            },
          });
        }

        createdVariants.push(variant);
      }

      return { product, variants: createdVariants };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
