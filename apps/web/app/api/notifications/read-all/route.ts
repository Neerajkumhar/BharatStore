import { NextResponse } from 'next/server';
import { getTenantDb } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function POST(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.NOTIFICATIONS_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const updated = await tenantDb.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
      count: updated.count,
    });
  } catch (error: any) {
    console.error('Mark read all error:', error);
    return NextResponse.json({ error: error.message || 'Failed to mark all notifications read' }, { status: 500 });
  }
}
