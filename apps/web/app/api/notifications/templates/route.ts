import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { createTemplateSchema } from '@bharatstore/shared/schemas';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.NOTIFICATIONS_READ);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);
    const templates = await tenantDb.notificationTemplate.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: templates });
  } catch (error: any) {
    console.error('Fetch templates error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch templates' }, { status: 500 });
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
    const parsed = createTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, type, channel, subject, body: templateBody, variables, isEnabled } = parsed.data;

    const existing = await prisma.notificationTemplate.findUnique({
      where: {
        tenantId_name: {
          tenantId,
          name,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Template with name "${name}" already exists` },
        { status: 400 }
      );
    }

    const template = await prisma.notificationTemplate.create({
      data: {
        tenantId,
        name,
        type,
        channel,
        subject: subject || null,
        body: templateBody,
        variables,
        isEnabled,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail || 'unknown',
        action: 'notification:template_create',
        resourceType: 'notification_template',
        resourceId: template.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        afterState: { name: template.name, type: template.type, channel: template.channel },
      },
    });

    return NextResponse.json({ success: true, data: template });
  } catch (error: any) {
    console.error('Create template error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create template' }, { status: 500 });
  }
}
