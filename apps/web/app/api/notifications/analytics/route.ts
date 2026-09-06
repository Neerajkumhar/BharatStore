import { NextResponse } from 'next/server';
import { getTenantDb } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.NOTIFICATIONS_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    const [
      totalCount,
      deliveredCount,
      sentCount,
      pendingCount,
      failedCount,
      unreadCount,
      byChannel,
      byType,
    ] = await Promise.all([
      tenantDb.notification.count(),
      tenantDb.notification.count({ where: { status: 'DELIVERED' } }),
      tenantDb.notification.count({ where: { status: 'SENT' } }),
      tenantDb.notification.count({ where: { status: 'PENDING' } }),
      tenantDb.notification.count({ where: { status: 'FAILED' } }),
      tenantDb.notification.count({ where: { isRead: false } }),
      tenantDb.notification.groupBy({
        by: ['channel'],
        _count: { id: true },
      }),
      tenantDb.notification.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
    ]);

    const deliveryRate = totalCount > 0 ? Number(((deliveredCount / totalCount) * 100).toFixed(1)) : 100;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCount,
          deliveredCount,
          sentCount,
          pendingCount,
          failedCount,
          unreadCount,
          deliveryRate,
        },
        channelDistribution: byChannel.map((c: any) => ({ channel: c.channel, count: c._count.id })),
        typeDistribution: byType.map((t: any) => ({ type: t.type, count: t._count.id })),
      },
    });
  } catch (error: any) {
    console.error('Fetch notification analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch notification analytics' }, { status: 500 });
  }
}
