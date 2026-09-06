import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { createCustomerSchema } from '@bharatstore/shared/schemas';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.CUSTOMERS_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { gstin: { contains: search, mode: 'insensitive' } },
      ];
    }

    const customers = await tenantDb.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    console.error('Fetch customers error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.CUSTOMERS_WRITE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = auth.tenantId;
    const tenantDb = getTenantDb(tenantId);

    const body = await request.json();
    const parsed = createCustomerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, phone, email, gstin, creditLimit, notes } = parsed.data;

    const existing = await tenantDb.customer.findFirst({
      where: { phone },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Customer with this phone number already exists', data: existing },
        { status: 400 }
      );
    }

    const customer = await tenantDb.customer.create({
      data: {
        tenantId,
        name,
        phone,
        email: email || null,
        gstin: gstin || null,
        creditLimit,
        notes: notes || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail || 'unknown',
        action: 'customer:create',
        resourceType: 'customer',
        resourceId: customer.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        afterState: { name: customer.name, phone: customer.phone },
      },
    });

    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    console.error('Create customer error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create customer' }, { status: 500 });
  }
}
