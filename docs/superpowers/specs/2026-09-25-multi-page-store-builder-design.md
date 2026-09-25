# Design: Multi-Page Store Builder (Pages + Navbar + Per-Page Sections)

**Date:** 2026-09-25
**Status:** Approved in brainstorm; pending implementation plan

## Problem

Today a tenant's public store is a single Home page built in the storefront builder. Its
config lives in `StorefrontTheme.draftConfig` / `StorefrontTheme.publishedConfig`. The
builder has no concept of multiple pages, the public navbar is a static header with no
links to custom pages, and there is no way to create content pages (About, Contact, FAQ,
policies) or edit them with different sections.

A `StorefrontPage` Prisma model already exists (with `slug`, `title`, `navLabel`,
`showInMenu`, `isHome`, `status`, `draftConfig`, `publishedConfig`, `order`) and its
migration has already been applied, but nothing reads or writes it.

## Goals

1. Let a store create multiple pages (e.g. About, Contact, FAQ, custom).
2. Show those pages in the store navbar (default header + sticky-header/mega-menu section
   headers), ordered, with a per-page show/hide toggle.
3. Edit any existing or new page in the store builder, composing it from the existing
   section library (`about-section`, `contact-section`, `faq-section`, `newsletter-section`,
   hero variants, product grids, etc.), each page with its own sections/theme.
4. Pages must work identically on live preview (`?preview=true`) and the published website,
   including on stores served via subdomain/custom-domain routing.

## Non-Goals (deferred)

- Customer accounts, customer order history, and customer-facing invoice download
  ("customer ID" portal). Decided as a separate future subsystem.
- Sitemap / SEO page metadata generation.
- Multi-language pages.

## Approach Decision

**Keep Home in the storefront theme config.** No migration of existing styled stores.
New pages are rows in `StorefrontPage`. This preserves backward compatibility — existing
stores render exactly as before. The Home builder flow is unchanged (it continues to read
and write `StorefrontTheme` config via the existing `/api/admin/storefront/builder`
endpoint). `StorefrontPage.isHome` remains unused in this iteration.

Both Home config and page config share the same shape (`sections`, `theme`, `seo`,
`templateId`), so `StorefrontRenderer` renders pages with zero changes.

## Public URLs

- New page route: `app/store/[slug]/[pageSlug]/page.tsx` serving at `/store/{slug}/{pageSlug}`.
- Reserved commerce segments `products`, `checkout`, `orders`, `order-confirmation` are
  static routes and take precedence over the dynamic `[pageSlug]` segment; the create-API
  additionally rejects these slugs.
- Home stays at `/store/{slug}`.
- Domain routing needs no change: the middleware already rewrites
  `{subdomain}.{platform}/{pageSlug}` and `{customDomain}/{pageSlug}` → `/store/{storeKey}/{pageSlug}`
  (see `resolveTenantRequest` in `apps/web/middleware.ts`).
- Preview: `/store/{slug}/{pageSlug}?preview=true` (or `?draft=true`) — consistent with Home.

## Design Details

### 1. Data model

Reuse `StorefrontPage` as-is (already migrated). No schema change.

### 2. Shared nav helper (server)

New `apps/web/lib/storefront-nav.ts`:

```
getStorefrontNavPages(tenantId: string, isPreview: boolean):
  -> Promise<Array<{ label: string; slug: string; }>>
```

- Filters `showInMenu = true`, orders by `order ASC`, then `createdAt ASC`.
- **Published site:** only `status === 'PUBLISHED'` pages **and** `publishedConfig?.sections?.length > 0`
  (prevents dead navbar links to blank pages).
- **Preview:** PUBLISHED + DRAFT pages (so new pages appear in the navbar while building),
  provided the draft has sections.
- Label: `navLabel || title`.
- Returns the home link implicitly represented by the store root (headers already link the
  brand/logo to `/store/{slug}`).

### 3. Navbar injection (server-resolved, no client fetch)

- **Default header:** `app/store/[slug]/layout.tsx` (server) already resolves the tenant
  and preview flag (`x-store-preview` header). It fetches `getStorefrontNavPages(...)` and
  passes the `pages` prop through `StoreHeaderGate` → `StoreHeader`
  (`apps/web/components/storefront/store-header.tsx`). Desktop renders inline links;
  mobile renders the same links in a slide-down menu. Nav label shows "Home" is NOT added
  here because the logo already links home; page list is exactly `showInMenu` pages.
- **Section headers:** `StorefrontRenderer` (server) already renders sections and passes
  `getSectionExtraProps`. It resolves `getStorefrontNavPages(tenantId, isPreview)` once and
  injects `pages` via extra props into `StickyHeaderSection` and `MegaMenuSection`:
  - `StickyHeaderSection` (`apps/web/components/storefront/sections/sticky-header-section.tsx`):
    merge resolved `pages` into its nav `links` (pages first, then any `config.navLinks`).
  - `MegaMenuSection` (`apps/web/components/storefront/sections/mega-menu-section.tsx`):
    render a "Pages" row/link column of resolved pages in the mega menu bar.
  Type unions for the shared prop added in `section-component-map.ts`
  (`apps/web/components/storefront/section-component-map.ts`).

### 4. Builder: page switcher + per-page editing

`apps/web/app/(dashboard)/storefront/builder/page.tsx`:

- New "Pages" control in `BuilderToolbar` (`apps/web/components/builder/builder-toolbar.tsx`):
  a dropdown listing **Home** + all pages + "+ New Page".
- Selecting a page loads that page's `draftConfig` into `builderState` (same shape as Home).
  Selecting Home continues to load the theme `draftConfig` exactly as today.
- Auto-save / save routing (in `scheduleSave`, `handleSave`, `handlePublish`, `handlePreview`):
  - Home → existing `PUT /api/admin/storefront/builder` (theme draft).
  - Page → new `PUT /api/admin/storefront/pages/[id]` (page draft + meta).
- Preview button opens `/store/{slug}/{pageSlug}?preview=true` for the active page, or the
  existing Home preview for Home.
- "+ New Page" opens a small form (title, slug, nav label, show-in-menu, order) and creates
  the page via `POST /api/admin/storefront/pages`, seeded with an empty `draftConfig`
  (`{ sections: [], theme: copy of Home theme, seo: {}, templateId: home templateId }`) so
  new pages inherit the store's design language. Then the builder switches to it.
- Undo/redo, section add/duplicate/visibility/reorder/theme stay fully functional per page
  because they operate on the in-memory `builderState` (the active page's config).
- `BuilderCanvas` / `EditableSectionList` need no change; they render whatever config is
  active.

### 5. Admin pages API (all under `PERMISSIONS.STOREFRONT_MANAGE`)

New route `apps/web/app/api/admin/storefront/pages/route.ts`:

- `GET` — list all pages for the tenant: `{ id, title, slug, navLabel, showInMenu, order, status, updatedAt }` (no config bodies).
- `POST` — create a page. Validates:
  - `title` non-empty (≤ 200 chars), `slug` matches `^[a-z0-9-]+$` (client already
    lowercases), slug not in reserved set (`products`, `checkout`, `orders`,
    `order-confirmation`), and not colliding with an existing page for the tenant
    (the `@@unique([tenantId, slug])` constraint backs this up).
  - Seeded `draftConfig` per section 4. Writes an `AuditLog` entry.
- New route `apps/web/app/api/admin/storefront/pages/[id]/route.ts`:
  - `PUT` — update meta (`title`, `navLabel`, `showInMenu`, `order`) and/or `draftConfig`.
    Validates `draftConfig` with the existing `pageConfigSchema` when present. Writes an
    `AuditLog` entry with `afterState: { sectionCount, status }`.
  - `DELETE` — delete the page (admin/owner only, and cannot delete Home since Home is not
    a StorefrontPage row). `AuditLog` entry.

### 6. Public page route (server component)

`apps/web/app/store/[slug]/[pageSlug]/page.tsx`:

1. Resolve `{ slug, pageSlug }` from params.
2. `getRequestStoreLookup` + `findStorefrontTenant` (same as Home).
3. 404 if tenant inactive.
4. `isPreviewMode` from search params (`preview`/`draft`).
5. Fetch `storefrontPage.findUnique({ where: { tenantId_slug: { tenantId, slug: pageSlug } } })`.
6. 404 if not found, or if `status !== 'PUBLISHED'` and not preview.
7. Active config = `draftConfig` when preview, else `publishedConfig || draftConfig`.
8. Render `StorefrontRenderer` with the page config, `storeData` built exactly like Home
   (`store/[slug]/page.tsx`).
9. Missing/empty config → `notFound()`.
- The shared `store/[slug]/layout.tsx` already provides header/footer/cart chrome around it.

### 7. Publish flow

- Existing Go-Live modal/route (`go-live-publish-modal.tsx`,
  `apps/web/app/api/admin/storefront/builder/publish/route.ts`) publishes the store
  (sets `StorefrontTheme.isPublished = true` + `publishedConfig`).
- Extend the publish route: after theme publish, set every page
  `status = 'PUBLISHED'`, `publishedConfig = draftConfig` in the same request. This makes
  "Publish store" publish all pages in one click, matching Home's semantics.
  Pages whose draft has **zero sections are skipped** (stay DRAFT) so they never surface
  as empty pages or dead navbar links.
- Per-page draft is always available via preview even before store publish.

### 8. Error handling & validation summary

- 404 with `notFound()` for missing/unpublished/inactive stores and pages (except preview).
- Slug/NAV validation enforced server-side; unique constraint is the backstop.
- All mutation routes enforce authorization + write `AuditLog`; pattern matches
  `storefront-config.ts` / existing builder routes.
- Route responses follow the existing `{ success, data } / { error }` convention.

## Files Touched (planned)

New:

- `apps/web/app/store/[slug]/[pageSlug]/page.tsx`
- `apps/web/lib/storefront-nav.ts`
- `apps/web/app/api/admin/storefront/pages/route.ts`
- `apps/web/app/api/admin/storefront/pages/[id]/route.ts`
- (from section-header injection) updated types in `section-component-map.ts`

Modified:

- `apps/web/app/(dashboard)/storefront/builder/page.tsx` — page switcher, save/preview routing
- `apps/web/components/builder/builder-toolbar.tsx` — pages dropdown + new-page modal trigger
- `apps/web/app/store/[slug]/layout.tsx` — resolve + pass nav pages to header
- `apps/web/components/storefront/store-layout-chrome.tsx` — thread `pages` prop
- `apps/web/components/storefront/store-header.tsx` — render page links (desktop + mobile)
- `apps/web/components/storefront/storefront-renderer.tsx` — resolve nav pages, inject via extra props
- `apps/web/components/storefront/sections/sticky-header-section.tsx` — merge nav pages into links
- `apps/web/components/storefront/sections/mega-menu-section.tsx` — pages row in menu bar
- `apps/web/app/api/admin/storefront/builder/publish/route.ts` — publish all pages

## Testing

- Unit: slug + reserved-name validation; `getStorefrontNavPages` filtering/ordering
  (preview vs published).
- Integration (API): pages CRUD lifecycle + publish flow, using the existing seeded tenant
  (`rajesh-fabrics`).
- Manual: build a page, verify navbar (default header, sticky-header, mega-menu), verify
  preview + published + subdomain-host access.
- `npm run build` and lint must pass.