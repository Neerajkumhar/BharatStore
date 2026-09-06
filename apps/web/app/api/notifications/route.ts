import { NextResponse } from 'next/server';
import { getTenantDb } from '@bharatstore/database';
import { createNotificationSchema } from '@bharatstore/shared/schemas';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';
import { dispatchNotification } from '@/lib/notification-engine';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.NOTIFICATIONS_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');
    const channel = searchParams.get('channel');
    const status = searchParams.get('status');
    const isRead = searchParams.get('isRead');
    const customerId = searchParams.get('customerId');
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) where.type = type;
    if (channel) where.channel = channel;
    if (status) where.status = status;
    if (isRead !== null && isRead !== undefined && isRead !== '') {
      where.isRead = isRead === 'true';
    }
    if (customerId) where.customerId = customerId;

    const [notifications, totalCount, unreadCount] = await Promise.all([
      tenantDb.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: {
          customer: {
            select: { id: true, name: true, phone: true, email: true },
          },
        },
      }),
      tenantDb.notification.count({ where }),
      tenantDb.notification.count({ where: { isRead: false } }),
    ]);

    return NextResponse.json({
      success: true,
      data: notifications,
      meta: {
        totalCount,
        unreadCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
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
    const parsed = createNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await dispatchNotification({
      tenantId,
      ...parsed.data,
    });

    if (result.blocked) {
      return NextResponse.json({
        success: false,
        blocked: true,
        reason: result.reason,
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.notification });
  } catch (error: any) {
    console.error('Create notification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create notification' }, { status: 500 });
  }
}
