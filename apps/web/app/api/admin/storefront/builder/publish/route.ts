import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';
import { buildLiveUrl } from '@/lib/storefront-resolver';
import { syncLegacyThemeFromConfig } from '@/lib/storefront-config';
import {
  normalizeSubdomain,
  normalizeCustomDomain,
  validateSubdomain,
  validateCustomDomain,
} from '@/lib/storefront-domain';

export async function POST(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.STOREFRONT_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantDb = getTenantDb(auth.tenantId);

    // Optional Go-Live payload: subdomain, custom domain + store details
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // no body → publish existing draft as-is
    }

    const subdomain = normalizeSubdomain(body?.subdomain);
    const customDomain = normalizeCustomDomain(body?.customDomain);

    const subdomainError = validateSubdomain(subdomain);
    if (subdomainError) return NextResponse.json({ error: subdomainError }, { status: 400 });

    const customDomainError = validateCustomDomain(customDomain);
    if (customDomainError) return NextResponse.json({ error: customDomainError }, { status: 400 });

    // Uniqueness checks (exclude self)
    if (subdomain) {
      const clash = await prisma.tenant.findFirst({
        where: { subdomain, id: { not: auth.tenantId } },
        select: { id: true },
      });
      if (clash) {
        return NextResponse.json(
          { error: `Subdomain "${subdomain}" is already taken by another store.` },
          { status: 409 }
        );
      }
    }

    if (customDomain) {
      const clash = await prisma.tenant.findFirst({
        where: { customDomain, id: { not: auth.tenantId } },
        select: { id: true },
      });
      if (clash) {
        return NextResponse.json(
          { error: `Custom domain "${customDomain}" is already connected to another store.` },
          { status: 409 }
        );
      }
    }

    // 1. Persist Go-Live store details + domain selection on the tenant
    const tenantPatch: any = {};
    if (subdomain) tenantPatch.subdomain = subdomain;
    if (customDomain) tenantPatch.customDomain = customDomain;

    const tenantFields = [
      'tradeName', 'slug', 'phone', 'email', 'addressLine1',
      'city', 'stateCode', 'pincode', 'gstin',
    ];
    for (const field of tenantFields) {
      if (body?.tenant && typeof body.tenant[field] === 'string' && body.tenant[field].trim() !== '') {
        tenantPatch[field] = body.tenant[field].trim();
      }
    }

    if (Object.keys(tenantPatch).length > 0) {
      await prisma.tenant.update({
        where: { id: auth.tenantId },
        data: tenantPatch,
      });
    }

    // 2. Publish draft config to live storefront
    const theme = await tenantDb.storefrontTheme.findUnique({
      where: { tenantId: auth.tenantId },
    });

    if (!theme || !theme.draftConfig) {
      return NextResponse.json({ error: 'No draft configuration to publish. Build your storefront in the builder first.' }, { status: 400 });
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

    // Keep the legacy StorefrontTheme columns (settings page, fallback hero,
    // layout) in sync with the published builder theme.
    await syncLegacyThemeFromConfig(auth.tenantId, theme.draftConfig as any);

    const liveTenant = await prisma.tenant.findUnique({
      where: { id: auth.tenantId },
      select: { subdomain: true, customDomain: true, slug: true },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorEmail: auth.userEmail || 'unknown',
        action: 'storefront:builder:go-live',
        resourceType: 'storefront_theme',
        resourceId: theme.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        beforeState: previousPublished ? { hasConfig: true } : { hasConfig: false },
        afterState: {
          sectionCount: (theme.draftConfig as any)?.sections?.length || 0,
          subdomain,
          customDomain,
          publishedAt: new Date().toISOString(),
        },
      },
    });

    const liveUrl = buildLiveUrl(liveTenant ?? { slug: (body?.tenant as any)?.slug });

    return NextResponse.json({
      success: true,
      data: {
        publishedConfig: updatedTheme.publishedConfig,
        publishedAt: updatedTheme.publishedAt,
        subdomain,
        customDomain,
        liveUrl,
      },
    });
  } catch (error: any) {
    console.error('Publish storefront error:', error);
    return NextResponse.json({ error: error.message || 'Failed to publish storefront' }, { status: 500 });
  }
}