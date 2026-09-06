import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { updatePreferenceSchema } from '@bharatstore/shared/schemas';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.NOTIFICATIONS_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (customerId) {
      let pref = await tenantDb.notificationPreference.findUnique({
        where: { tenantId_customerId: { tenantId: auth.tenantId, customerId } },
      });

      if (!pref) {
        // Return default configuration
        pref = {
          id: 'default',
          tenantId: auth.tenantId,
          customerId,
          orderUpdates: true,
          paymentUpdates: true,
          marketing: true,
          businessAlerts: true,
          preferredChannel: 'IN_APP',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return NextResponse.json({ success: true, data: pref });
    }

    const preferences = await tenantDb.notificationPreference.findMany({
      take: 100,
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, data: preferences });
  } catch (error: any) {
    console.error('Fetch preferences error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.NOTIFICATIONS_WRITE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = auth.tenantId;
    const body = await request.json();
    const parsed = updatePreferenceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { customerId, orderUpdates, paymentUpdates, marketing, businessAlerts, preferredChannel } = parsed.data;

    const data: any = {};
    if (orderUpdates !== undefined) data.orderUpdates = orderUpdates;
    if (paymentUpdates !== undefined) data.paymentUpdates = paymentUpdates;
    if (marketing !== undefined) data.marketing = marketing;
    if (businessAlerts !== undefined) data.businessAlerts = businessAlerts;
    if (preferredChannel !== undefined) data.preferredChannel = preferredChannel;

    let preference;
    if (customerId) {
      preference = await prisma.notificationPreference.upsert({
        where: {
          tenantId_customerId: {
            tenantId,
            customerId,
          },
        },
        create: {
          tenantId,
          customerId,
          ...data,
        },
        update: data,
      });
    } else {
      return NextResponse.json({ error: 'Customer ID required for customer preference update' }, { status: 400 });
    }

    await prisma.auditLog.create({
      data: {
        tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail || 'unknown',
        action: 'notification:preference_update',
        resourceType: 'notification_preference',
        resourceId: preference.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        afterState: { customerId, ...data },
      },
    });

    return NextResponse.json({ success: true, data: preference });
  } catch (error: any) {
    console.error('Update preference error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update preference' }, { status: 500 });
  }
}
