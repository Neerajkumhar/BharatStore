import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { sendNotificationSchema } from '@bharatstore/shared/schemas';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';
import { dispatchNotification } from '@/lib/notification-engine';

export async function POST(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.NOTIFICATIONS_WRITE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = auth.tenantId;
    const body = await request.json();
    const parsed = sendNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { templateId, type, channel, customerIds, title, body: rawBody, variablesData = {} } = parsed.data;
    const tenantDb = getTenantDb(tenantId);

    let sendTitle = title || 'Notification';
    let sendBody = rawBody || '';
    let sendType = type || 'SYSTEM';
    let sendChannel = channel || 'IN_APP';

    if (templateId) {
      const template = await tenantDb.notificationTemplate.findUnique({ where: { id: templateId } });
      if (!template || !template.isEnabled) {
        return NextResponse.json({ error: 'Selected template not found or disabled' }, { status: 400 });
      }
      sendTitle = template.subject || template.name;
      sendBody = template.body;
      sendType = template.type;
      sendChannel = template.channel;
    }

    const targetCustomerIds = customerIds && customerIds.length > 0 ? customerIds : [null];

    const results = [];
    for (const cid of targetCustomerIds) {
      const dispatchRes = await dispatchNotification({
        tenantId,
        customerId: cid,
        type: sendType as any,
        channel: sendChannel as any,
        title: sendTitle,
        message: sendBody,
        variablesData,
      });
      results.push(dispatchRes);
    }

    await prisma.auditLog.create({
      data: {
        tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail || 'unknown',
        action: 'notification:send',
        resourceType: 'notification',
        resourceId: results[0]?.notification?.id || 'batch',
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        afterState: { targetCount: targetCustomerIds.length, type: sendType, channel: sendChannel },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Dispatched notification to ${targetCustomerIds.length} recipient(s)`,
      data: results,
    });
  } catch (error: any) {
    console.error('Send batch notification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send notification' }, { status: 500 });
  }
}
