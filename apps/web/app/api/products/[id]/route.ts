import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { updateProductSchema } from '@bharatstore/shared/schemas';

async function getActiveTenantId(request: Request): Promise<string> {
  const headerTenantId = request.headers.get('x-tenant-id');
  if (headerTenantId) return headerTenantId;

  const firstTenant = await prisma.tenant.findFirst();
  if (!firstTenant) {
    throw new Error('No active tenant found in system');
  }
  return firstTenant.id;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = await getActiveTenantId(request);
    const tenantDb = getTenantDb(tenantId);

    const product = await tenantDb.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          include: {
            inventoryLogs: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = await getActiveTenantId(request);
    const tenantDb = getTenantDb(tenantId);

    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await tenantDb.product.update({
      where: { id },
      data: {
        ...parsed.data,
        variants: undefined, // Variants are updated via separate endpoints or transaction if provided
      },
      include: {
        variants: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = await getActiveTenantId(request);
    const tenantDb = getTenantDb(tenantId);

    // Soft-delete by unpublishing to preserve inventory history
    const product = await tenantDb.product.update({
      where: { id },
      data: { isPublished: false },
    });

    return NextResponse.json({ success: true, message: 'Product unpublished successfully', data: product });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
