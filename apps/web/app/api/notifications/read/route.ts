import { NextResponse } from 'next/server';
import { getTenantDb } from '@bharatstore/database';
import { markReadSchema } from '@bharatstore/shared/schemas';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function POST(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.NOTIFICATIONS_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);
    const body = await request.json();
    const parsed = markReadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { notificationIds, all } = parsed.data;
    const now = new Date();

    if (all) {
      await tenantDb.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true, readAt: now },
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (!notificationIds || notificationIds.length === 0) {
      return NextResponse.json({ error: 'No notification IDs provided' }, { status: 400 });
    }

    await tenantDb.notification.updateMany({
      where: { id: { in: notificationIds } },
      data: { isRead: true, readAt: now },
    });

    return NextResponse.json({ success: true, message: 'Notifications marked as read' });
  } catch (error: any) {
    console.error('Mark read error:', error);
    return NextResponse.json({ error: error.message || 'Failed to mark notifications read' }, { status: 500 });
  }
}
