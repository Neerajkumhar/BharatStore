import { NextResponse } from 'next/server';
import { getTenantDb } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';
import { z } from 'zod';

const updateCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required').optional(),
  parentId: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  displayOrder: z.number().int().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeRequest(request, PERMISSIONS.CATEGORIES_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const existing = await tenantDb.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { parentId, ...rest } = parsed.data;

    // Block circular nesting: a category cannot be its own parent
    if (parentId && parentId === id) {
      return NextResponse.json({ error: 'A category cannot be its own parent' }, { status: 400 });
    }

    if (parentId) {
      const parent = await tenantDb.category.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json({ error: 'Parent category not found' }, { status: 404 });
      }
    }

    const category = await tenantDb.category.update({
      where: { id },
      data: {
        ...rest,
        parentId: parentId === undefined ? undefined : parentId || null,
      },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeRequest(request, PERMISSIONS.CATEGORIES_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const existing = await tenantDb.category.findUnique({
      where: { id },
      include: {
        _count: { select: { children: true, products: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (existing._count.children > 0) {
      return NextResponse.json(
        { error: `Cannot delete "${existing.name}" — it has ${existing._count.children} sub-category(-ies). Move or delete them first.` },
        { status: 409 }
      );
    }

    if (existing._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete "${existing.name}" — ${existing._count.products} product(s) are assigned to it. Reassign them first.` },
        { status: 409 }
      );
    }

    await tenantDb.category.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 });
  }
}