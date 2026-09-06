import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeRequest(request, PERMISSIONS.ORDERS_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const order = await tenantDb.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        payments: true,
        invoices: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Fetch order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch order details' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeRequest(request, PERMISSIONS.ORDERS_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const body = await request.json();
    const { status, paymentStatus } = body;

    const beforeState = await tenantDb.order.findUnique({ where: { id } });

    const updated = await tenantDb.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
      },
    });

    // Trigger Notification on Status Change (Guard against duplicate notification for same status)
    if (status && beforeState && beforeState.status !== status) {
      const typeMap: Record<string, any> = {
        CONFIRMED: 'ORDER_CONFIRMED',
        PACKED: 'ORDER_PACKED',
        DISPATCHED: 'ORDER_DISPATCHED',
        DELIVERED: 'ORDER_DELIVERED',
      };
      const notifType = typeMap[status];

      if (notifType) {
        const existingNotif = await tenantDb.notification.findFirst({
          where: {
            relatedEntityType: 'order',
            relatedEntityId: id,
            type: notifType,
          },
        });

        if (!existingNotif) {
          const { dispatchNotification } = await import('@/lib/notification-engine');
          await dispatchNotification({
            tenantId: auth.tenantId,
            customerId: updated.customerId,
            type: notifType,
            channel: 'IN_APP',
            title: `Order ${updated.orderNumber} ${status.toLowerCase()}`,
            message: `Your order ${updated.orderNumber} has been updated to ${status.toLowerCase()}.`,
            relatedEntityType: 'order',
            relatedEntityId: id,
            variablesData: {
              orderNumber: updated.orderNumber,
              orderStatus: status,
            },
          });
        }
      }
    }

    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail || 'unknown',
        action: 'order:update_status',
        resourceType: 'order',
        resourceId: id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        beforeState: beforeState ? { status: beforeState.status, paymentStatus: beforeState.paymentStatus } : undefined,
        afterState: { status: updated.status, paymentStatus: updated.paymentStatus },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Update order status error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order status' }, { status: 500 });
  }
}
