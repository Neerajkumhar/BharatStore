import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { requireFeature } from '@/lib/plan-enforcement';
import { PERMISSIONS, FEATURE_FLAGS } from '@bharatstore/shared/constants';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeRequest(request, PERMISSIONS.INVOICES_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const featureDenied = await requireFeature(auth.tenantId, FEATURE_FLAGS.GST_INVOICING);
    if (featureDenied) return featureDenied;

    const tenantDb = getTenantDb(auth.tenantId);

    const invoice = await tenantDb.invoice.findFirst({
      where: { id, tenantId: auth.tenantId },
      include: {
        order: {
          include: {
            customer: true,
            items: true,
            payments: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: auth.tenantId },
      include: {
        storefrontTheme: {
          select: { logoUrl: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        invoice,
        order: invoice.order,
        tenant,
      },
    });
  } catch (error: any) {
    console.error('Fetch invoice error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch invoice' }, { status: 500 });
  }
}