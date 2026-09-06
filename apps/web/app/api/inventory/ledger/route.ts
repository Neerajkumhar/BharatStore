import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';

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
