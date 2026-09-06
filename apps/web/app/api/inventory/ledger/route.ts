import { NextResponse } from 'next/server';
import { getTenantDb } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.INVENTORY_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const variantId = searchParams.get('variantId');
    const eventType = searchParams.get('eventType');

    const where: any = {};
    if (variantId) where.variantId = variantId;
    if (eventType) where.eventType = eventType;

    const [logs, total] = await Promise.all([
      tenantDb.inventoryLedger.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          variant: {
            include: {
              product: {
                select: { id: true, title: true, hsnCode: true, images: true },
              },
            },
          },
          createdBy: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
      tenantDb.inventoryLedger.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch inventory ledger error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch inventory ledger' }, { status: 500 });
  }
}
