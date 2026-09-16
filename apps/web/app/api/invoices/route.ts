import { NextResponse } from 'next/server';
import { getTenantDb } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.INVOICES_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const where: any = {};
    if (type && type !== 'ALL') where.invoiceType = type;
    if (search && search.trim().length > 0) {
      where.OR = [
        { invoiceNumber: { contains: search.trim(), mode: 'insensitive' } },
        { order: { orderNumber: { contains: search.trim(), mode: 'insensitive' } } },
        { order: { customer: { name: { contains: search.trim(), mode: 'insensitive' } } } },
        { order: { customer: { phone: { contains: search.trim() } } } },
      ];
    }

    const [invoices, total, aggregate, typeCounts] = await Promise.all([
      tenantDb.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            include: { customer: true },
          },
        },
      }),
      tenantDb.invoice.count({ where }),
      tenantDb.invoice.aggregate({
        _sum: { grandTotal: true, totalCgst: true, totalSgst: true, totalIgst: true },
      }),
      tenantDb.invoice.groupBy({ by: ['invoiceType'], _count: true }),
    ]);

    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalInvoices: total,
        totalInvoiceValue: aggregate._sum.grandTotal || 0,
        totalCgst: aggregate._sum.totalCgst || 0,
        totalSgst: aggregate._sum.totalSgst || 0,
        totalIgst: aggregate._sum.totalIgst || 0,
        typeCounts,
      },
    });
  } catch (error: any) {
    console.error('Fetch invoices error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch invoices' }, { status: 500 });
  }
}