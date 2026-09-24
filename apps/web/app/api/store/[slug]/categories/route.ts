import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { getRequestStoreLookupFromRequest, findStorefrontTenant } from '@/lib/storefront-resolver';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const lookup = getRequestStoreLookupFromRequest(request, slug);
    const tenant = await findStorefrontTenant(lookup, {
      select: { id: true, isActive: true },
    });

    if (!tenant || !tenant.isActive) {
      return NextResponse.json({ error: 'Storefront not found' }, { status: 404 });
    }

    const categories = await prisma.category.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: { where: { isPublished: true } } },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        productCount: c._count.products,
      })),
    });
  } catch (error: any) {
    console.error('Fetch public categories error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}
