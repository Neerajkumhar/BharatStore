import { NextResponse } from 'next/server';
import { getTenantDb } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';
import { pageConfigSchema } from '@bharatstore/shared/schemas';
import { saveStorefrontDraft } from '@/lib/storefront-config';

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.STOREFRONT_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);
    const theme = await tenantDb.storefrontTheme.findUnique({
      where: { tenantId: auth.tenantId },
    });

    return NextResponse.json({
      success: true,
      data: {
        draftConfig: theme?.draftConfig || null,
        publishedConfig: theme?.publishedConfig || null,
        theme: theme ? {
          primaryColor: theme.primaryColor,
          accentColor: theme.accentColor,
          logoUrl: theme.logoUrl,
          themeName: theme.themeName,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Fetch builder config error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch builder config' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.STOREFRONT_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = pageConfigSchema.safeParse(body.config);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid configuration', details: parsed.error.flatten() }, { status: 400 });
    }

    const config = await saveStorefrontDraft({
      tenantId: auth.tenantId,
      actorId: auth.userId,
      actorEmail: auth.userEmail,
      config: parsed.data,
      auditAction: 'storefront:builder:update_draft',
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      data: { draftConfig: config.draftConfig },
    });
  } catch (error: any) {
    console.error('Update builder config error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update builder config' }, { status: 500 });
  }
}
