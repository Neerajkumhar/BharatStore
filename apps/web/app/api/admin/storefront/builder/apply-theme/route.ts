import { NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';
import { buildTemplatePageConfig } from '@bharatstore/shared/constants';
import { applyThemeRequestSchema } from '@bharatstore/shared/schemas';
import { saveStorefrontDraft } from '@/lib/storefront-config';

export async function POST(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.STOREFRONT_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = applyThemeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }

    let config;
    try {
      config = buildTemplatePageConfig(parsed.data.templateId);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'Unknown template' }, { status: 404 });
    }

    await saveStorefrontDraft({
      tenantId: auth.tenantId,
      actorId: auth.userId,
      actorEmail: auth.userEmail,
      config,
      auditAction: 'storefront:builder:apply_theme',
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      data: {
        templateId: config.templateId,
        sectionCount: config.sections.length,
        draftConfig: config,
      },
    });
  } catch (error: any) {
    console.error('Apply theme error:', error);
    return NextResponse.json({ error: error.message || 'Failed to apply theme' }, { status: 500 });
  }
}