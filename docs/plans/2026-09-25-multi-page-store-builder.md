# Multi-Page Store Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a tenant create multiple storefront pages (About, Contact, FAQ, etc.), show them in the store navbar, and edit each page's own sections/theme in the existing builder — on both live preview and the published site.

**Architecture:** Keep Home in `StorefrontTheme.draftConfig/publishedConfig` (unchanged). New pages are rows in the existing `StorefrontPage` model (already migrated, currently unused). A server-side helper `getStorefrontNavPages` resolves which pages appear in the navbar based on preview vs published context; the default layout header and the sticky-header/mega-menu section headers all consume it. The builder gains a page switcher: Home saves to the existing builder route, pages save to a new `StorefrontPage` CRUD API. Go-Live publishes all pages with non-empty drafts in the same request.

**Tech Stack:** Next.js 15 (App Router, RSC + route handlers), Prisma 6 (per-tenant `getTenantDb` + global `prisma`), Zod 3 (`pageConfigSchema`), vitest (hoisted to repo root), lucide-react.

---

## File Structure

**New files:**

| File | Responsibility |
|------|----------------|
| `apps/web/lib/storefront-nav.ts` | Slug validation constants + `validatePageSlug`, pure `toStorefrontNavItems` filter/order, DB wrapper `getStorefrontNavPages`, `StorefrontNavItem` type |
| `apps/web/lib/storefront-nav.test.ts` | Unit tests for `validatePageSlug` + `toStorefrontNavItems` |
| `apps/web/app/api/admin/storefront/pages/route.ts` | `GET` list (no configs) + `POST` create (+ audit) |
| `apps/web/app/api/admin/storefront/pages/[id]/route.ts` | `GET` detail (configs), `PUT` update, `DELETE` (+ audits) |
| `apps/web/app/store/[slug]/[pageSlug]/page.tsx` | Public page renderer (mirrors Home page) |
| `apps/web/components/builder/new-page-modal.tsx` | Create-page form (title, slug, nav label, show-in-menu, order) |

**Modified files:**

| File | Change |
|------|--------|
| `apps/web/app/store/[slug]/layout.tsx` | Resolve `getStorefrontNavPages` and pass `pages` to `StoreHeaderGate` |
| `apps/web/components/storefront/store-layout-chrome.tsx` | Thread `pages` prop `StoreHeaderGate` → `StoreHeader` |
| `apps/web/components/storefront/store-header.tsx` | Render page links (desktop + mobile slide-down) |
| `apps/web/components/storefront/section-component-map.ts` | Add `pages` to extra-prop types + `SECTIONS_NEEDING_PAGES` |
| `apps/web/components/storefront/storefront-renderer.tsx` | Resolve nav pages once, pass via `getSectionExtraProps` digest |
| `apps/web/components/storefront/sections/sticky-header-section.tsx` | Merge resolved pages into nav links |
| `apps/web/components/storefront/sections/mega-menu-section.tsx` | Render a Pages links row |
| `apps/web/app/api/admin/storefront/builder/publish/route.ts` | Publish all pages with non-empty drafts |
| `apps/web/components/builder/builder-toolbar.tsx` | Page switcher (select) + new-page trigger |
| `apps/web/app/(dashboard)/storefront/builder/page.tsx` | Page switcher state; route save/preview per page |

**Test/verification commands used throughout:**

```bash
# Unit tests for pure nav/slug logic (vitest is hoisted to repo root)
npx vitest run apps/web/lib/storefront-nav.test.ts

# Full gate at the end
npm run lint --workspace=apps/web
npm run build --workspace=apps/web
```

---

## Task 1: Nav helper + slug validation (lib, pure functions + thin DB wrapper)

**Files:**
- Create: `apps/web/lib/storefront-nav.ts`
- Test: `apps/web/lib/storefront-nav.test.ts`

- [x] **Step 1: Write the failing test**

Create `apps/web/lib/storefront-nav.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { validatePageSlug, RESERVED_PAGE_SLUGS, toStorefrontNavItems } from './storefront-nav';

function row(overrides: Record<string, unknown> = {}) {
  return {
    slug: 'about-us',
    title: 'About Us',
    navLabel: null,
    showInMenu: true,
    status: 'PUBLISHED',
    draftConfig: { sections: [{ id: 's1' }] },
    publishedConfig: { sections: [{ id: 's1' }] },
    order: 0,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('validatePageSlug', () => {
  it('accepts lowercase kebab-case slugs', () => {
    expect(validatePageSlug('about-us')).toBeNull();
    expect(validatePageSlug('faq2026')).toBeNull();
    expect(validatePageSlug('a')).toBeNull();
  });

  it('rejects empty, spaces, uppercase, underscores, unicode', () => {
    expect(validatePageSlug('')).not.toBeNull();
    expect(validatePageSlug('About Us')).not.toBeNull();
    expect(validatePageSlug('about_us')).not.toBeNull();
    expect(validatePageSlug('about ús')).not.toBeNull();
  });

  it('rejects reserved commerce routes', () => {
    for (const slug of RESERVED_PAGE_SLUGS) {
      expect(validatePageSlug(slug), slug).not.toBeNull();
    }
  });
});

describe('toStorefrontNavItems', () => {
  it('drops non-menu rows', () => {
    const items = toStorefrontNavItems([row({ showInMenu: false })], true);
    expect(items).toEqual([]);
  });

  it('live site: only PUBLISHED rows with non-empty publishedConfig', () => {
    const published = row({});
    const noSections = row({ slug: 'empty', publishedConfig: { sections: [] } });
    const draft = row({ slug: 'draft', status: 'DRAFT' });
    const items = toStorefrontNavItems([draft, noSections, published], false);
    expect(items.map((i) => i.slug)).toEqual(['about-us']);
  });

  it('preview: includes DRAFT rows with non-empty draftConfig', () => {
    const draft = row({ slug: 'draft', status: 'DRAFT' });
    const emptyDraft = row({ slug: 'fresh', status: 'DRAFT', draftConfig: { sections: [] } });
    const items = toStorefrontNavItems([emptyDraft, draft], true);
    expect(items.map((i) => i.slug)).toEqual(['draft']);
  });

  it('labels fall back from navLabel to title', () => {
    const items = toStorefrontNavItems([row({ navLabel: 'Our Story' })], false);
    expect(items[0].label).toBe('Our Story');
    const fallback = toStorefrontNavItems([row({ navLabel: null })], false);
    expect(fallback[0].label).toBe('About Us');
  });

  it('sorts by order asc then createdAt asc', () => {
    const a = row({ slug: 'a', order: 2, createdAt: new Date('2026-01-01') });
    const b = row({ slug: 'b', order: 1, createdAt: new Date('2026-01-02') });
    const c = row({ slug: 'c', order: 1, createdAt: new Date('2026-01-03') });
    const items = toStorefrontNavItems([a, b, c], false);
    expect(items.map((i) => i.slug)).toEqual(['b', 'c', 'a']);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run apps/web/lib/storefront-nav.test.ts`
Expected: FAIL — module `./storefront-nav` not found (`Cannot find module`).

- [x] **Step 3: Write the minimal implementation**

Create `apps/web/lib/storefront-nav.ts`:

```ts
import { getTenantDb } from '@bharatstore/database';

export interface StorefrontNavItem {
  label: string;
  slug: string;
}

interface NavPageRow {
  slug: string;
  title: string;
  navLabel: string | null;
  showInMenu: boolean;
  status: string;
  draftConfig: unknown;
  publishedConfig: unknown;
  order: number;
  createdAt: Date;
}

export const PAGE_SLUG_REGEX = /^[a-z0-9-]+$/;

export const RESERVED_PAGE_SLUGS: ReadonlySet<string> = new Set([
  'products',
  'checkout',
  'orders',
  'order-confirmation',
]);

export function validatePageSlug(slug: string): string | null {
  if (!slug) return 'Slug is required.';
  if (!PAGE_SLUG_REGEX.test(slug)) {
    return 'Slug can only contain lowercase letters, numbers and hyphens.';
  }
  if (RESERVED_PAGE_SLUGS.has(slug)) {
    return `"${slug}" is a reserved route and cannot be used as a page slug.`;
  }
  return null;
}

export function toStorefrontNavItems(
  pages: NavPageRow[],
  isPreview: boolean
): StorefrontNavItem[] {
  return pages
    .filter((p) => p.showInMenu === true)
    .filter((p) => {
      if (isPreview) {
        return (p.status === 'PUBLISHED' || p.status === 'DRAFT') &&
          hasSections(p.draftConfig);
      }
      return p.status === 'PUBLISHED' && hasSections(p.publishedConfig);
    })
    .sort((a, b) => a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime())
    .map((p) => ({
      label: p.navLabel?.trim() ? p.navLabel.trim() : p.title,
      slug: p.slug,
    }));
}

function hasSections(config: unknown): boolean {
  const sections = (config as { sections?: { length: number } } | null)?.sections;
  return Array.isArray(sections) && sections.length > 0;
}

export async function getStorefrontNavPages(
  tenantId: string,
  isPreview: boolean
): Promise<StorefrontNavItem[]> {
  const tenantDb = getTenantDb(tenantId);
  const pages = await tenantDb.storefrontPage.findMany({
    where: { tenantId },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
  return toStorefrontNavItems(pages as NavPageRow[], isPreview);
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run apps/web/lib/storefront-nav.test.ts`
Expected: 3 suites pass (13 tests).

- [x] **Step 5: Commit**

```bash
git add apps/web/lib/storefront-nav.ts apps/web/lib/storefront-nav.test.ts
git commit -m "feat: storefront nav pages helper with slug validation"
```

## Task 2: Create-page API (list + create)

**Files:**
- Create: `apps/web/app/api/admin/storefront/pages/route.ts`

- [x] **Step 1: Write the route**

Create `apps/web/app/api/admin/storefront/pages/route.ts`:

```ts
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
    const existing = await tenantDb.storefrontPage.findUnique({
      where: { tenantId_slug: { tenantId: auth.tenantId, slug } },
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
```

- [x] **Step 2: Verify it compiles (REST smoke test against running server is optional here)**

The route is verified end-to-end in Task 11. For a quick syntax sanity check:

Run: `npx tsc --noEmit -p apps/web/tsconfig.json`
Expected: no new type errors introduced by this file.

- [x] **Step 3: Commit**

```bash
git add apps/web/app/api/admin/storefront/pages/route.ts
git commit -m "feat: storefront pages list + create API"
```

---

## Task 3: Page detail API (get / update / delete)

**Files:**
- Create: `apps/web/app/api/admin/storefront/pages/[id]/route.ts`

- [x] **Step 1: Write the route**

Create `apps/web/app/api/admin/storefront/pages/[id]/route.ts`:

```ts
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
          const clash = await tenantDb.storefrontPage.findUnique({
            where: { tenantId_slug: { tenantId: auth.tenantId, slug } },
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
```

Notes:
- `body` shape accepted by PUT: `{ config?: pageConfigSchema, meta?: { title?, navLabel?, showInMenu?, order?, slug? } }`, and/or `{ config }` alone (the shape the builder sends, matching the Home builder route). Either works in isolation.
- `findPage` is scoped by `tenantId` so a cross-tenant id returns 404, not 403.

- [x] **Step 2: Verify compile**

Run: `npx tsc --noEmit -p apps/web/tsconfig.json`
Expected: no new type errors.

- [x] **Step 3: Commit**

```bash
git add apps/web/app/api/admin/storefront/pages/[id]/route.ts
git commit -m "feat: storefront page detail API (get/update/delete)"
```

---

## Task 4: Public page route

**Files:**
- Create: `apps/web/app/store/[slug]/[pageSlug]/page.tsx`

- [x] **Step 1: Write the server component page**

Create `apps/web/app/store/[slug]/[pageSlug]/page.tsx`, mirroring the Home page's tenant resolution and `storeData` shape:

```ts
import React from 'react';
import { notFound } from 'next/navigation';
import { getTenantDb } from '@bharatstore/database';
import { getRequestStoreLookup, findStorefrontTenant } from '@/lib/storefront-resolver';
import { StorefrontRenderer } from '@/components/storefront/storefront-renderer';

export default async function StorefrontPageRoute({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; pageSlug: string }>;
  searchParams?: Promise<{ preview?: string; draft?: string }>;
}) {
  const { slug, pageSlug } = await params;
  const sParams = (await searchParams) || {};
  const isPreviewMode = sParams.preview === 'true' || sParams.draft === 'true';

  const lookup = await getRequestStoreLookup(slug);
  const tenant = await findStorefrontTenant(lookup, {
    include: { storefrontTheme: true },
  });

  if (!tenant || !tenant.isActive) {
    notFound();
  }

  const tenantDb = getTenantDb(tenant.id);
  const page = await tenantDb.storefrontPage.findUnique({
    where: { tenantId_slug: { tenantId: tenant.id, slug: pageSlug } },
  });

  if (!page) {
    notFound();
  }

  const isPublished = page.status === 'PUBLISHED';
  if (!isPublished && !isPreviewMode) {
    notFound();
  }

  const activeConfig = (isPreviewMode
    ? page.draftConfig || page.publishedConfig
    : page.publishedConfig || page.draftConfig) as any;

  if (!activeConfig || !activeConfig.sections || activeConfig.sections.length === 0) {
    notFound();
  }

  const theme = tenant.storefrontTheme;

  return (
    <StorefrontRenderer
      config={activeConfig}
      slug={slug}
      tenantId={tenant.id}
      isPreview={isPreviewMode}
      storeData={{
        tradeName: tenant.tradeName,
        phone: theme?.contactPhone || tenant.phone,
        email: theme?.contactEmail || tenant.email || undefined,
        address: tenant.addressLine1,
        city: tenant.city,
        pincode: tenant.pincode,
        gstin: tenant.gstin || undefined,
        businessHours: theme?.businessHours || undefined,
        socialLinks: (theme?.socialLinks as any) || {},
      }}
    />
  );
}
```

Note: `getRequestStoreLookup` + `findStorefrontTenant` already handle subdomain/custom-domain routing, so `/store/{slug}/{pageSlug}` works identically on `{subdomain}.{platform}/{pageSlug}` and `{customDomain}/{pageSlug}` (the middleware rewrites those to `/store/{storeKey}/{pageSlug}`). Static routes (`products`, `checkout`, `orders`, `order-confirmation`) win over this dynamic segment; the create-API rejects those slugs as an extra guard.

- [x] **Step 2: Verify compile + page renders**

Run: `npx tsc --noEmit -p apps/web/tsconfig.json`
Expected: no new errors.

Manual smoke (needs dev server + seeded tenant `rajesh-fabrics` — see Task 11 for server start):
- `GET /api/admin/storefront/pages` POST a page `slug: about` — then `/store/rajesh-fabrics/about?preview=true` renders the (empty) page → 404 (empty config), and after adding a section in the builder (Task 10) it renders. This is the end-to-end check in Task 11.

- [x] **Step 3: Commit**

```bash
git add apps/web/app/store/[slug]/[pageSlug]/page.tsx
git commit -m "feat: public storefront page route"
```

---

## Task 5: Nav injection into the default layout header

**Files:**
- Modify: `apps/web/app/store/[slug]/layout.tsx`
- Modify: `apps/web/components/storefront/store-layout-chrome.tsx`
- Modify: `apps/web/components/storefront/store-header.tsx`

- [x] **Step 1: Resolve pages in the layout and pass to the header gate**

Edit `apps/web/app/store/[slug]/layout.tsx`:
1. Add import: `import { getStorefrontNavPages } from '@/lib/storefront-nav';`
2. After the `hasHeaderSection` const (line ~51), resolve nav pages:

```ts
  // Resolve navbar pages for the default header. Hidden when the store has not
  // been published yet (except preview), so dead links never appear live.
  const navPages = theme?.isPublished || isPreviewMode
    ? await getStorefrontNavPages(tenant.id, isPreviewMode)
    : [];
```

3. Pass `pages={navPages}` to `<StoreHeaderGate ... />` inside the layout return.

- [x] **Step 2: Thread `pages` through the header gate**

Edit `apps/web/components/storefront/store-layout-chrome.tsx`:
1. Add to `StoreHeaderGateProps`:
```ts
  pages?: Array<{ label: string; slug: string }>;
```
2. Destructure `pages` in `StoreHeaderGate` and pass it to `<StoreHeader ... pages={pages} />`.

- [x] **Step 3: Render page links in the default header**

Edit `apps/web/components/storefront/store-header.tsx`:
1. Add to `StoreHeaderProps`:
```ts
  pages?: Array<{ label: string; slug: string }>;
```
2. Destructure `pages` and compute links:
```ts
  const pageLinks = (pages || []).map((p) => ({ label: p.label, slug: p.slug }));
```
3. Desktop — insert the page links between the search form and the header actions. Add a `<nav className="hidden lg:flex items-center gap-1 shrink-0" aria-label="Store pages">` rendering, for each page, a `<Link href={`/store/${slug}/${p.slug}`} className="text-xs font-bold text-slate-700 hover:text-amber-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition whitespace-nowrap">{p.label}</Link>`.
4. Mobile — add a hamburger button (lucide `Menu`, `MenuIcon` import) next to the mobile search toggle that opens a slide-down panel listing the pages (and the existing "All Products" link). Use a `showMobileNav` state mirroring `showMobileSearch`; the panel renders `<nav className="px-3 py-2 border-t border-slate-100 bg-slate-50 space-y-1">` with a `Link` per page that closes the panel (`onClick={() => setShowMobileNav(false)}`).

- [x] **Step 4: Verify render + compile**

Run: `npx tsc --noEmit -p apps/web/tsconfig.json`
Expected: no new errors.

Manual: default header on `/store/rajesh-fabrics` shows page links for published pages; mobile menu lists them. Confirmed end-to-end in Task 11.

- [x] **Step 5: Commit**

```bash
git add apps/web/app/store/[slug]/layout.tsx apps/web/components/storefront/store-layout-chrome.tsx apps/web/components/storefront/store-header.tsx
git commit -m "feat: show nav pages in default store header"
```

---

## Task 6: Inject pages into section headers (sticky-header + mega-menu)

**Files:**
- Modify: `apps/web/components/storefront/section-component-map.ts`
- Modify: `apps/web/components/storefront/storefront-renderer.tsx`
- Modify: `apps/web/components/storefront/sections/sticky-header-section.tsx`
- Modify: `apps/web/components/storefront/sections/mega-menu-section.tsx`

- [x] **Step 1: Add `pages` to the extra-prop contract**

Edit `apps/web/components/storefront/section-component-map.ts`:

1. Add a type-only import at the top:
```ts
import type { StorefrontNavItem } from '@/lib/storefront-nav';
```
2. Add `pages?: StorefrontNavItem[];` to both `SectionRenderExtraProps` and `SectionRenderDigest`.
3. Add a set beside the existing ones (after `SECTIONS_NEEDING_DATA`/`SECTIONS_NEEDING_STORE_DATA`):
```ts
const SECTIONS_NEEDING_PAGES = new Set<string>([
  SECTION_TYPES.STICKY_HEADER,
  SECTION_TYPES.MEGA_MENU,
]);
```
4. In `getSectionExtraProps`, after the existing lines that set `extra.products` / `extra.categories`:
```ts
  if (SECTIONS_NEEDING_PAGES.has(digest.type) && digest.pages) extra.pages = digest.pages;
```

- [x] **Step 2: Resolve pages in the renderer and pass them**

Edit `apps/web/components/storefront/storefront-renderer.tsx`:

1. Add import: `import { getStorefrontNavPages } from '@/lib/storefront-nav';`
2. In the `StorefrontRenderer` function body, right after `const sections = ...` (before building the section data promises), resolve once:
```ts
  const navPages = await getStorefrontNavPages(tenantId, isPreview === true);
```
3. In the map loop, include `pages: navPages` in the digest passed to `getSectionExtraProps`:
```ts
        const extraProps = getSectionExtraProps({
          type: section.type,
          data,
          theme: sectionTheme,
          storeData,
          pages: navPages,
        });
```

- [x] **Step 3: Merge pages into sticky-header links**

Edit `apps/web/components/storefront/sections/sticky-header-section.tsx`:

1. Add to `StickyHeaderSectionProps`:
```ts
  pages?: Array<{ label: string; slug: string }>;
```
2. Destructure `pages` in the function signature.
3. Replace the `const links = ...` block (currently lines 30-37) with:
```ts
  const pageLinks = (pages || []).map((p) => ({ label: p.label, url: `/store/${slug}/${p.slug}` }));
  const ctaLinks = config.navLinks?.length
    ? config.navLinks
    : [
        { label: 'Home', url: `/store/${slug}` },
        { label: 'Shop Catalog', url: `/store/${slug}/products` },
        { label: 'Categories', url: `/store/${slug}#categories` },
        { label: 'Deals & Offers', url: `/store/${slug}#deals` },
      ];
  const links = pageLinks.length ? [...pageLinks, ...ctaLinks] : ctaLinks;
```
The desktop nav (`renderNav`) and the mobile drawer already iterate `links`, so both get the pages automatically.

- [x] **Step 4: Render a Pages row in mega-menu**

Edit `apps/web/components/storefront/sections/mega-menu-section.tsx`:

1. Add to `MegaMenuSectionProps`:
```ts
  pages?: Array<{ label: string; slug: string }>;
```
2. Destructure `pages` in the function signature.
3. Inside the `<section>` returned by the component, immediately after the title `<h3>` block (the `Explore Catalog Departments` heading), add:
```ts
        {pages && pages.length > 0 && (
          <nav aria-label="Store pages" className="flex flex-wrap gap-2 mb-6">
            {pages.map((p) => (
              <Link
                key={p.slug}
                href={`/store/${slug}/${p.slug}`}
                className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-amber-400 transition"
              >
                {p.label}
              </Link>
            ))}
          </nav>
        )}
```

- [x] **Step 5: Verify compile**

Run: `npx tsc --noEmit -p apps/web/tsconfig.json`
Expected: no new errors.

Manual check: configs using sticky-header/mega-menu show the nav pages; pages render at `/store/{slug}/{pageSlug}?preview=true`. (Confirmed end-to-end in Task 11.)

- [x] **Step 6: Commit**

```bash
git add apps/web/components/storefront/section-component-map.ts apps/web/components/storefront/storefront-renderer.tsx apps/web/components/storefront/sections/sticky-header-section.tsx apps/web/components/storefront/sections/mega-menu-section.tsx
git commit -m "feat: inject nav pages into section headers"
```

---

## Task 7: Publish all pages in Go-Live

**Files:**
- Modify: `apps/web/app/api/admin/storefront/builder/publish/route.ts`

- [x] **Step 1: Publish pages after theme publish**

Edit `apps/web/app/api/admin/storefront/builder/publish/route.ts`. After the theme update + `syncLegacyThemeFromConfig(...)` call (after line ~110), add:

```ts
    // 3. Publish every page whose draft has sections. Pages with an empty
    //    draft are skipped so they never surface as empty pages or dead navbar
    //    links. Per-page preview keeps working regardless.
    const pages = await tenantDb.storefrontPage.findMany({
      where: { tenantId: auth.tenantId },
    });
    let publishedPageCount = 0;
    for (const p of pages) {
      const draftSections = (p.draftConfig as any)?.sections;
      if (Array.isArray(draftSections) && draftSections.length > 0) {
        await tenantDb.storefrontPage.update({
          where: { id: p.id },
          data: { publishedConfig: p.draftConfig, status: 'PUBLISHED' },
        });
        publishedPageCount += 1;
      }
    }

    if (publishedPageCount > 0) {
      await prisma.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          actorId: auth.userId || null,
          actorEmail: auth.userEmail || 'unknown',
          action: 'storefront:pages:publish',
          resourceType: 'storefront_page',
          resourceId: pages.find((p) => p.status === 'PUBLISHED')?.id ?? auth.tenantId,
          ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
          afterState: { publishedPageCount },
        },
      });
    }
```

Also include `publishedPageCount` in the existing theme audit log's `afterState` (add `publishedPageCount` to the object passed to `prisma.auditLog.create` for `storefront:builder:go-live`) and in the success response (`data: { ..., publishedPageCount }`).

- [x] **Step 2: Verify compile**

Run: `npx tsc --noEmit -p apps/web/tsconfig.json`
Expected: no new errors.

- [x] **Step 3: Commit**

```bash
git add apps/web/app/api/admin/storefront/builder/publish/route.ts
git commit -m "feat: publish all storefront pages in go-live"
```

---

## Task 8: Builder toolbar — page switcher + new-page trigger

**Files:**
- Modify: `apps/web/components/builder/builder-toolbar.tsx`

- [x] **Step 1: Add page-switcher props**

Edit `apps/web/components/builder/builder-toolbar.tsx`. Add to `BuilderToolbarProps`:

```ts
  pages: Array<{ id: string; title: string; navLabel?: string | null }>;
  activePageValue: string;
  onSelectPage: (value: string) => void;
  onNewPage: () => void;
```

Destructure them in the function signature with safe defaults:

```ts
  pages = [],
  activePageValue = 'home',
  onSelectPage,
  onNewPage,
```

- [x] **Step 2: Render the page select**

Edit the left group — insert directly after the `<h1>Store Builder</h1>` (after the undo/redo container). Add:

```tsx
        <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 pl-2">
          <select
            value={activePageValue}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '__new__') onNewPage?.();
              else onSelectPage?.(v);
            }}
            aria-label="Select page to edit"
            className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/30 max-w-[140px]"
          >
            <option value="home">Home Page</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>{p.navLabel || p.title}</option>
            ))}
            <option value="__new__">+ New Page…</option>
          </select>
        </div>
```

- [x] **Step 3: Verify compile**

Run: `npx tsc --noEmit -p apps/web/tsconfig.json`
Expected: no new errors.

- [x] **Step 4: Commit**

```bash
git add apps/web/components/builder/builder-toolbar.tsx
git commit -m "feat: page switcher in builder toolbar"
```

---

## Task 9: New-page modal

**Files:**
- Create: `apps/web/components/builder/new-page-modal.tsx`

- [x] **Step 1: Write the modal component**

Create `apps/web/components/builder/new-page-modal.tsx`:

```tsx
'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PageMeta {
  id: string;
  title: string;
  slug: string;
  navLabel: string | null;
  showInMenu: boolean;
  order: number;
  status: string;
  updatedAt: string;
}

interface NewPageForm {
  title: string;
  slug: string;
  navLabel: string;
  showInMenu: boolean;
  order: number;
}

interface NewPageModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (page: PageMeta) => void;
  defaultOrder: number;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function NewPageModal({ open, onClose, onCreated, defaultOrder }: NewPageModalProps) {
  const [form, setForm] = useState<NewPageForm>({ title: '', slug: '', navLabel: '', showInMenu: true, order: defaultOrder });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const updateTitle = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: f.slug === '' || f.slug === slugify(f.title) ? slugify(title) : f.slug,
    }));
  };

  const submit = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/storefront/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug || slugify(form.title),
          navLabel: form.navLabel || null,
          showInMenu: form.showInMenu,
          order: form.order,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to create page.');
        return;
      }
      onCreated(json.data.page);
      setForm({ title: '', slug: '', navLabel: '', showInMenu: true, order: defaultOrder });
      onClose();
    } catch {
      setError('Failed to create page.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500';
  const labelCls = 'block text-2xs font-bold text-slate-600 uppercase tracking-wide mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="text-sm font-black tracking-tight">Create New Page</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-md text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className={labelCls}>Page Title</label>
            <input value={form.title} onChange={(e) => updateTitle(e.target.value)} placeholder="e.g. About Us" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })} placeholder="about-us" className={inputCls} />
            <p className="text-2xs text-slate-400 mt-1">Lowercase letters, numbers and hyphens. Shown as /store/&#123;slug&#125;/&#123;pageSlug&#125;</p>
          </div>
          <div>
            <label className={labelCls}>Nav Label (optional)</label>
            <input value={form.navLabel} onChange={(e) => setForm({ ...form, navLabel: e.target.value })} placeholder="Defaults to title" className={inputCls} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input type="checkbox" checked={form.showInMenu} onChange={(e) => setForm({ ...form, showInMenu: e.target.checked })} className="h-4 w-4 rounded border-slate-300 focus:ring-amber-500" />
              Show in store navbar
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span>Order</span>
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 0 })} className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-lg" />
            </label>
          </div>
          {error && <p className="text-xs font-bold text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">
              Cancel
            </button>
            <button onClick={submit} disabled={saving || !form.title.trim()} className="px-4 py-2 text-xs font-black bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition disabled:opacity-50">
              {saving ? 'Creating…' : 'Create Page'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [x] **Step 2: Verify compile**

Run: `npx tsc --noEmit -p apps/web/tsconfig.json`
Expected: no new errors.

- [x] **Step 3: Commit**

```bash
git add apps/web/components/builder/new-page-modal.tsx
git commit -m "feat: new-page modal in storefront builder"
```

---

## Task 10: Builder page wiring (save/preview routing per page)

**Files:**
- Modify: `apps/web/app/(dashboard)/storefront/builder/page.tsx`

- [x] **Step 1: Add page-state + import the modal**

Edit `apps/web/app/(dashboard)/storefront/builder/page.tsx`:

1. Add import: `import { NewPageModal } from '@/components/builder/new-page-modal';`
2. Add the `PageMeta` interface next to the `BuilderState` interface:
```ts
interface PageMeta {
  id: string;
  title: string;
  slug: string;
  navLabel: string | null;
  showInMenu: boolean;
  order: number;
  status: string;
  updatedAt: string;
}
```
3. In the component, add state after the existing `saveTimeoutRef`:
```ts
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [activePage, setActivePage] = useState<{ type: 'home' } | { type: 'page'; id: string; slug: string }>({ type: 'home' });
  const [showNewPageModal, setShowNewPageModal] = useState(false);
```

- [x] **Step 2: Load the pages list on mount**

In the existing `load()` function, after the `storeRes`/`storeJson` block (before the `} catch`), add:

```ts
        const pagesRes = await fetch('/api/admin/storefront/pages');
        const pagesJson = await pagesRes.json();
        if (pagesJson.success) setPages(pagesJson.data.pages || []);
```

- [x] **Step 3: Add draft-load and persist helpers**

Add these helpers right after the `handleSave`/`handlePublish`/`handlePreview` handlers (before `handleAddSection`):

```ts
  // Load a page's draft into the builder (switching away from Home).
  const loadPageDraft = async (pageId: string) => {
    const res = await fetch(`/api/admin/storefront/pages/${pageId}`);
    const json = await res.json();
    if (json.success && json.data.page) {
      const d = json.data.page.draftConfig;
      setBuilderState({
        sections: d?.sections || [],
        theme: d?.theme || {},
        seo: d?.seo || {},
        templateId: d?.templateId || null,
      });
      setHistoryStack([]);
      setRedoStack([]);
    }
  };

  // Reload the Home theme draft (switching back from a page).
  const loadHomeDraft = async () => {
    const res = await fetch('/api/admin/storefront/builder');
    const json = await res.json();
    if (json.success && json.data.draftConfig) {
      setBuilderState({
        sections: json.data.draftConfig.sections || [],
        theme: json.data.draftConfig.theme || {},
        seo: json.data.draftConfig.seo || {},
        templateId: json.data.draftConfig.templateId || null,
      });
      setHistoryStack([]);
      setRedoStack([]);
    }
  };

  // Save the active page's builder state to its own draft. Home → theme
  // builder route; a page → pages/[id] route with { config } (same shape).
  const persistCurrentDraft = useCallback(async (): Promise<boolean> => {
    const url = activePage.type === 'home'
      ? '/api/admin/storefront/builder'
      : `/api/admin/storefront/pages/${activePage.id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: builderState }),
    });
    return res.ok && (await res.json())?.success === true;
  }, [builderState, activePage]);

  const handleSelectPage = async (value: string) => {
    await persistCurrentDraft();
    if (value === 'home') {
      await loadHomeDraft();
      setActivePage({ type: 'home' });
    } else {
      const p = pages.find((x) => x.id === value);
      if (!p) return;
      await loadPageDraft(p.id);
      setActivePage({ type: 'page', id: p.id, slug: p.slug });
    }
  };

  const handlePageCreated = async (page: PageMeta) => {
    setPages((prev) => [...prev, page].sort((a, b) => a.order - b.order));
    setActivePage({ type: 'page', id: page.id, slug: page.slug });
    await loadPageDraft(page.id);
  };
```

- [x] **Step 4: Route auto-save, save, publish, and preview through the active page**

Edit the existing handlers:

1. Replace the body of `scheduleSave`'s timeout (currently `fetch('/api/admin/storefront/builder', { method: 'PUT', ... body: JSON.stringify({ config: builderState }) })`) with:
```ts
        const ok = await persistCurrentDraft();
        setSaveState(ok ? 'saved' : 'unsaved');
```
and update its `useCallback` deps to `[persistCurrentDraft]`.

2. `handleSave` — replace its inner `fetch(...)` with:
```ts
    const ok = await persistCurrentDraft();
    setSaveState(ok ? 'saved' : 'unsaved');
```

3. `handlePublish` — replace its inner `await fetch('/api/admin/storefront/builder', {...})` with `await persistCurrentDraft();` (keep the try/catch and `setSaveState` around it).

4. `handlePreview` — replace its inner `await fetch('/api/admin/storefront/builder', {...})` with `await persistCurrentDraft();`, then change the open target line (currently `window.open(`/store/${slug}?preview=true`, '_blank');`) to:
```ts
    const pagePath = activePage.type === 'home' ? '' : `/${activePage.slug}`;
    if (slug) window.open(`/store/${slug}${pagePath}?preview=true`, '_blank');
```

- [x] **Step 5: Wire the toolbar props + modal**

Edit the `<BuilderToolbar ... />` JSX — add:

```tsx
        pages={pages}
        activePageValue={activePage.type === 'home' ? 'home' : activePage.id}
        onSelectPage={(value) => handleSelectPage(value)}
        onNewPage={() => setShowNewPageModal(true)}
```

And immediately after the `<GoLivePublishModal ... />` block, add:

```tsx
      <NewPageModal
        open={showNewPageModal}
        onClose={() => setShowNewPageModal(false)}
        onCreated={handlePageCreated}
        defaultOrder={pages.length}
      />
```

- [x] **Step 6: Verify compile + behavior**

Run: `npx tsc --noEmit -p apps/web/tsconfig.json`
Expected: no new errors.

Manual check (dev server + seeded tenant):
- Builder toolbar select shows "Home Page"; create a page "About Us" → it is added and selected; canvas shows empty sections.
- Add a section, hit Live Preview → opens `/store/rajesh-fabrics/about?preview=true` and renders it.
- Switch back to Home → the Home sections return unchanged.
- Auto-save fires against the page route (verify row `draft_config` in `storefront_pages` updated).

- [x] **Step 7: Commit**

```bash
git add apps/web/app/'(dashboard)'/storefront/builder/page.tsx
git commit -m "feat: per-page editing, save and preview in storefront builder"
```

---

## Task 11: End-to-end verification, lint, build, commit

**Files:**
- None (verification only)

- [x] **Step 1: Run the unit tests**

Run: `npx vitest run apps/web/lib/storefront-nav.test.ts`
Expected: all 13 tests pass.

- [x] **Step 2: Run the full gate**

Run:
```bash
npm run lint --workspace=apps/web
npm run build --workspace=apps/web
```
Expected: lint clean; build succeeds (no route conflicts between `store/[slug]/[pageSlug]` and static sub-routes).

- [x] **Step 3: Manual QA (dev server + seeded tenant `rajesh-fabrics`)**

Start the stack if not running:
```bash
npm run db:generate
npm run db:migrate
npm run docker:up
npm run dev
```
Seed if empty: `npm run db:seed` (creates `rajesh-fabrics`, password `Password@123`).

Walk through:
1. Login as owner of `rajesh-fabrics` → Storefront → Builder.
2. Toolbar: "+ New Page…" → title "About Us" → Create. Page appears in selector.
3. Add 2-3 sections (e.g. about-section, faq-section). Save. Live Preview → `/store/rajesh-fabrics/about?preview=true` renders those sections with the default header now showing the "About Us" nav link.
4. Create a hidden page (`showInMenu: false`) and a DRAFT-only empty test page → confirm they do NOT appear in the navbar but DO render at their preview URL with sections.
5. Go-Live (Publish) → confirm all non-empty pages now render without `?preview=true`, the empty page stays 404, and no dead links exist in the navbar.
6. Republish once more after editing a page → the updated page is live.
7. Subdomain/custom-domain check (optional, if configured): the page resolves at `{subdomain}.{platform}/about` (middleware rewrites to `/store/{storeKey}/about`).
8. Delete a page from the DB via the API (`DELETE /api/admin/storefront/pages/{id}` as owner) → its navbar link disappears, `/store/rajesh-fabrics/{slug}` 404s.

- [x] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: multi-page store builder"
```

---

## Self-Review Notes

- **Spec coverage:** public route (T4), nav helper (T1), default-header nav (T5), sticky-header + mega-menu injection (T6), builder switcher + new page (T8–T10), pages CRUD API (T2–T3), publish flow (T7), validation/reserved slugs (T1–T3), audit logs (T2–T3, T7). Non-Goals untouched. `StorefrontPage.isHome` left unused.
- **DRY:** slug validation + reserved set live once in `storefront-nav.ts` and are reused by the POST + PUT routes. Nav filtering has a single pure implementation (`toStorefrontNavItems`) shared by the DB wrapper.
- **Decision added during planning (not in spec):** `GET /api/admin/storefront/pages/[id]` returns the page draft/published config so the builder can load a page without fetching every config in the list route (spec keeps list bodies-free).
- **Regressions to watch:** the `store/[slug]/[pageSlug]` dynamic segment must not shadow static routes (`products`, `checkout`, `orders`, `order-confirmation`) — Next.js resolves static over dynamic, and the create-API rejects those slugs.
- **Commit style:** follow repo's conventional-commit style used across existing commits.