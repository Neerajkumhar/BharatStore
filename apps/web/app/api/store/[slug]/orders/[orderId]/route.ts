import { NextResponse } from 'next/server';
import { prisma } from '@bharatstore/database';
import { getRequestStoreLookupFromRequest, findStorefrontTenant } from '@/lib/storefront-resolver';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; orderId: string }> }
) {
  try {
    const { slug, orderId } = await params;

    const lookup = getRequestStoreLookupFromRequest(request, slug);
    const tenant = await findStorefrontTenant(lookup, {
      select: { id: true, tradeName: true, phone: true, email: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Storefront not found' }, { status: 404 });
    }

    const order = await prisma.order.findFirst({
      where: {
        tenantId: tenant.id,
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: {
        customer: true,
        items: true,
        payments: true,
        invoices: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        subtotal: Number(order.subtotal),
        taxTotal: Number(order.taxTotal),
        grandTotal: Number(order.grandTotal),
        notes: order.notes,
        customer: {
          name: order.customer?.name || 'Guest Customer',
          phone: order.customer?.phone || '',
          email: order.customer?.email || '',
        },
        items: order.items.map((item) => ({
          id: item.id,
          productTitle: item.productTitle,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.lineTotal),
        })),
        invoice: order.invoices[0]
          ? {
              id: order.invoices[0].id,
              invoiceNumber: order.invoices[0].invoiceNumber,
              invoiceType: order.invoices[0].invoiceType,
            }
          : null,
        store: {
          tradeName: tenant.tradeName,
          phone: tenant.phone,
          email: tenant.email,
        },
      },
    });
  } catch (error: any) {
    console.error('Fetch order status error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch order details' }, { status: 500 });
  }
}
