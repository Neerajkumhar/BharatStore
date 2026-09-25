import { NextResponse } from 'next/server';
import { getTenantDb, prisma } from '@bharatstore/database';
import { authorizeRequest } from '@/lib/authorization';
import { PERMISSIONS } from '@bharatstore/shared/constants';
import { pageConfigSchema } from '@bharatstore/shared/schemas';
import { validatePageSlug } from '@/lib/storefront-nav';

type RouteContext = { params: Promise<{ id: string }> };

async function findPage(tenantDb: any, tenantId: string, id: string) {
  return tenantDb.storefrontPage.findFirst({ where: { id, tenantId } });
}

export async function GET(request: Request, ctx: RouteContext) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.STOREFRONT_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await ctx.params;
    const tenantDb = getTenantDb(auth.tenantId);
    const page = await findPage(tenantDb, auth.tenantId, id);
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: { page } });
  } catch (error: any) {
    console.error('Get storefront page error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load page' }, { status: 500 });
  }
}

export async function PUT(request: Request, ctx: RouteContext) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.STOREFRONT_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await ctx.params;
    const tenantDb = getTenantDb(auth.tenantId);
    const page = await findPage(tenantDb, auth.tenantId, id);
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const data: Record<string, unknown> = {};

    let sectionCount: number | undefined;
    if (body.config !== undefined) {
      const parsed = pageConfigSchema.safeParse(body.config);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid page configuration', details: parsed.error.flatten() }, { status: 400 });
      }
      data.draftConfig = { ...parsed.data, updatedAt: new Date().toISOString() };
      sectionCount = parsed.data.sections.length;
    }

    if (body.meta !== undefined && body.meta !== null) {
      if (typeof body.meta.title === 'string') {
        const title = body.meta.title.trim();
        if (!title || title.length > 200) {
          return NextResponse.json({ error: 'Title is required and must be 200 characters or fewer.' }, { status: 400 });
        }
        data.title = title;
      }
      if (body.meta.navLabel === null || typeof body.meta.navLabel === 'string') {
        data.navLabel = body.meta.navLabel === null ? null : body.meta.navLabel.trim() || null;
      }
      if (typeof body.meta.showInMenu === 'boolean') data.showInMenu = body.meta.showInMenu;
      if (typeof body.meta.order === 'number') data.order = body.meta.order;
      if (typeof body.meta.slug === 'string') {
        const slug = body.meta.slug.trim().toLowerCase();
        if (slug !== page.slug) {
          const slugError = validatePageSlug(slug);
          if (slugError) return NextResponse.json({ error: slugError }, { status: 400 });
          const clash = await tenantDb.storefrontPage.findFirst({
            where: { slug },
            select: { id: true },
          });
          if (clash && clash.id !== id) {
            return NextResponse.json({ error: `A page with slug "${slug}" already exists.` }, { status: 409 });
          }
          data.slug = slug;
        }
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const updated = await tenantDb.storefrontPage.update({ where: { id }, data });

    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        actorId: auth.userId || null,
        actorEmail: auth.userEmail || 'unknown',
        action: 'storefront:pages:update',
        resourceType: 'storefront_page',
        resourceId: updated.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        afterState: { sectionCount: sectionCount ?? undefined, status: updated.status },
      },
    });

    return NextResponse.json({ success: true, data: { page: updated } });
  } catch (error: any) {
    console.error('Update storefront page error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update page' }, { status: 500 });
  }
}

export async function DELETE(request: Request, ctx: RouteContext) {
  try {
    const auth = await authorizeRequest(request, PERMISSIONS.STOREFRONT_MANAGE);
    if (!auth.authorized || !auth.tenantId) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await ctx.params;
    const tenantDb = getTenantDb(auth.tenantId);
    const page = await findPage(tenantDb, auth.tenantId, id);
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    await tenantDb.storefrontPage.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        actorId: auth.userId || null,
        actorEmail: auth.userEmail || 'unknown',
        action: 'storefront:pages:delete',
        resourceType: 'storefront_page',
        resourceId: page.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        beforeState: { slug: page.slug, status: page.status },
      },
    });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error: any) {
    console.error('Delete storefront page error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete page' }, { status: 500 });
  }
}