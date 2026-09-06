import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { updateProductSchema } from '@bharatstore/shared/schemas';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeRequest(request, PERMISSIONS.PRODUCTS_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

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
    const auth = await authorizeRequest(request, PERMISSIONS.PRODUCTS_WRITE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const beforeState = await tenantDb.product.findUnique({ where: { id } });

    const updated = await tenantDb.product.update({
      where: { id },
      data: {
        ...parsed.data,
        variants: undefined,
      },
      include: {
        variants: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail || 'unknown',
        action: 'product:update',
        resourceType: 'product',
        resourceId: id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        beforeState: beforeState ? { title: beforeState.title, sellingPrice: beforeState.sellingPrice } : undefined,
        afterState: { title: updated.title, sellingPrice: updated.sellingPrice },
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
    const auth = await authorizeRequest(request, PERMISSIONS.PRODUCTS_DELETE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const product = await tenantDb.product.update({
      where: { id },
      data: { isPublished: false },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail || 'unknown',
        action: 'product:delete',
        resourceType: 'product',
        resourceId: id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        afterState: { isPublished: false },
      },
    });

    return NextResponse.json({ success: true, message: 'Product unpublished successfully', data: product });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
