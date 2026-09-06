import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';

export async function POST(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.STOREFRONT_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);
    const theme = await tenantDb.storefrontTheme.findUnique({
      where: { tenantId: auth.tenantId },
    });

    if (!theme || !theme.draftConfig) {
      return NextResponse.json({ error: 'No draft configuration to publish' }, { status: 400 });
    }

    const previousPublished = theme.publishedConfig;
    const updatedTheme = await tenantDb.storefrontTheme.update({
      where: { tenantId: auth.tenantId },
      data: {
        publishedConfig: theme.draftConfig,
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail || 'unknown',
        action: 'storefront:builder:publish',
        resourceType: 'storefront_theme',
        resourceId: theme.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        beforeState: previousPublished ? { hasConfig: true } : { hasConfig: false },
        afterState: { sectionCount: (theme.draftConfig as any)?.sections?.length || 0, publishedAt: new Date().toISOString() },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        publishedConfig: updatedTheme.publishedConfig,
        publishedAt: updatedTheme.publishedAt,
      },
    });
  } catch (error: any) {
    console.error('Publish storefront error:', error);
    return NextResponse.json({ error: error.message || 'Failed to publish storefront' }, { status: 500 });
  }
}
