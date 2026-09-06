import { NextResponse } from 'next/server';
import { getTenantDb, prisma, Prisma } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';
import { getTemplateSections } from '@bharatstore/shared/constants';

export async function POST(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.STOREFRONT_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const templateId = body.templateId as string | undefined;

    const tenantDb = getTenantDb(auth.tenantId);

    let resetConfig;
    if (templateId) {
      const sections = getTemplateSections(templateId);
      resetConfig = { sections, templateId, updatedAt: new Date().toISOString() };
    }

    const configValue = resetConfig || Prisma.DbNull;

    const updatedTheme = await tenantDb.storefrontTheme.upsert({
      where: { tenantId: auth.tenantId },
      create: {
        tenantId: auth.tenantId,
        draftConfig: configValue,
        publishedConfig: Prisma.DbNull,
        isPublished: true,
        publishedAt: new Date(),
      },
      update: {
        draftConfig: configValue,
        publishedConfig: Prisma.DbNull,
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail || 'unknown',
        action: 'storefront:builder:reset',
        resourceType: 'storefront_theme',
        resourceId: updatedTheme.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        afterState: { templateId: templateId || 'none', resetAt: new Date().toISOString() },
      },
    });

    return NextResponse.json({
      success: true,
      data: { draftConfig: updatedTheme.draftConfig },
    });
  } catch (error: any) {
    console.error('Reset storefront error:', error);
    return NextResponse.json({ error: error.message || 'Failed to reset storefront' }, { status: 500 });
  }
}
