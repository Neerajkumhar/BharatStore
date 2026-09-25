import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';
import { validatePageSlug } from '@/lib/storefront-nav';

const LIST_SELECT = {
  id: true,
  title: true,
  slug: true,
  navLabel: true,
  showInMenu: true,
  order: true,
  status: true,
  updatedAt: true,
} as const;

export async function GET(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.STOREFRONT_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenantDb = getTenantDb(auth.tenantId);
    const pages = await tenantDb.storefrontPage.findMany({
      where: { tenantId: auth.tenantId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: LIST_SELECT,
    });
    return NextResponse.json({ success: true, data: { pages } });
  } catch (error: any) {
    console.error('List storefront pages error:', error);
    return NextResponse.json({ error: error.message || 'Failed to list pages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.STOREFRONT_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';
    const navLabel = typeof body.navLabel === 'string' && body.navLabel.trim() !== ''
      ? body.navLabel.trim()
      : null;
    const showInMenu = body.showInMenu !== false;
    const requestedOrder = typeof body.order === 'number' ? body.order : null;

    if (!title || title.length > 200) {
      return NextResponse.json({ error: 'Title is required and must be 200 characters or fewer.' }, { status: 400 });
    }
    const slugError = validatePageSlug(slug);
    if (slugError) return NextResponse.json({ error: slugError }, { status: 400 });

    const tenantDb = getTenantDb(auth.tenantId);
    const existing = await tenantDb.storefrontPage.findFirst({
      where: { slug },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: `A page with slug "${slug}" already exists.` }, { status: 409 });
    }

    // Seed from the Home theme so new pages inherit the store's design language.
    const theme = await tenantDb.storefrontTheme.findUnique({ where: { tenantId: auth.tenantId } });
    const homeConfig = (theme?.draftConfig as { theme?: unknown; templateId?: string | null } | null) ?? null;
    const draftConfig = {
      sections: [],
      theme: homeConfig?.theme ? JSON.parse(JSON.stringify(homeConfig.theme)) : {},
      seo: {},
      templateId: homeConfig?.templateId ?? null,
    };

    const maxOrder = await tenantDb.storefrontPage.aggregate({
      where: { tenantId: auth.tenantId },
      _max: { order: true },
    });

    const page = await tenantDb.storefrontPage.create({
      data: {
        tenantId: auth.tenantId,
        title,
        slug,
        navLabel,
        showInMenu,
        order: requestedOrder ?? (maxOrder._max.order ?? 0) + 1,
        draftConfig,
      },
      select: LIST_SELECT,
    });

    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        actorId: auth.userId || null,
        actorEmail: auth.userEmail || 'unknown',
        action: 'storefront:pages:create',
        resourceType: 'storefront_page',
        resourceId: page.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        afterState: { slug: page.slug, status: 'DRAFT', showInMenu: page.showInMenu },
      },
    });

    return NextResponse.json({ success: true, data: { page } }, { status: 201 });
  } catch (error: any) {
    console.error('Create storefront page error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create page' }, { status: 500 });
  }
}