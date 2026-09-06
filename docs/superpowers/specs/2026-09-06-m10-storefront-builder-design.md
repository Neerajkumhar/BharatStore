# M10: No-Code Storefront Builder & Template System — Design

**Date:** 2026-09-06
**Milestone:** 10
**Baseline:** `b16516c` (M9 complete — 84 routes, 53/53 tests, 0 TS errors)

## Goal

Let a BharatStore merchant build and customize their public storefront without writing code:
select a template, customize sections, reorder/enable/disable them, preview, save drafts, and
publish to `/store/[slug]`. Must feel like a polished commerce website builder.

The existing `/store/[slug]` must become capable of rendering builder-generated configuration.
We do **not** create a second storefront.

## 1. Core Principle: Structured Config, No Arbitrary Code

A storefront page is a structured, validated configuration:

```text
Storefront
  └── Page (per-tenant)
       ├── Section { type, order, enabled, config }
       ├── Section
       └── Section
```

- Merchants cannot enter arbitrary JavaScript or raw HTML.
- Page-builder components come from an **approved component registry**.
- All section configs are validated with **Zod** on both write (API) and read (renderer).

## 2. Architecture Decision: Extend StorefrontTheme (No New Models)

The existing `StorefrontTheme` model is one-row-per-tenant, already uses a JSON pattern
(`socialLinks`), and the admin + public storefront routes already read/write it.

**Add two JSON columns to `StorefrontTheme`:**

| Column | Purpose |
|--------|---------|
| `pageConfig` (Json?) | The **published** sections array — rendered publicly at `/store/[slug]`. |
| `pageConfigDraft` (Json?) | The merchant's **draft** sections array — only visible in the builder/preview. |

**Why this over separate `StorefrontPage` / `StorefrontSection` tables:**
- The builder is single-page per tenant (not multi-page).
- Single-row fetch for the whole storefront (no N+1, one DB query).
- Matches existing `socialLinks` JSON convention && existing theme row already keyed by tenant.
- Draft/publish becomes a single atomic write (`draft → published`, clear draft).
- No migration of existing tenant data; additive nullable columns.

**Trade-off accepted:** Config is stored as a JSON blob, so cross-section integrity (e.g. a
`product-grid` referencing a now-deleted category) is validated at render time with graceful
fallbacks, not by FK constraints.

## 3. Component Registry

A typed registry in `apps/web/lib/storefront/registry.ts` (or `packages`-appropriate location)
mapping `SectionType → { schema, defaultConfig, Component, key }`.

Initial 12 section types:

| type | purpose / config |
|------|------------------|
| `hero` | title, subtitle, image, CTA text, CTA dest, alignment, height, visibility |
| `announcement` | text, link, visibility |
| `categories` | title, count, layout (pull real categories) |
| `featured-products` | title, selection mode (newest/featured/category/manual), count, layout |
| `product-grid` | title, category, selection, count, layout |
| `banner` | heading, description, image, CTA, dest (optionally link to a campaign) |
| `about` | title, description, image |
| `trust` | configurable badge list (Secure Payments / GST Invoice / Easy Support / Quality) |
| `testimonials` | merchant-managed items {quote, author, role} |
| `faq` | configurable {question, answer} items, order |
| `contact` | reuse storefront support info |
| `footer` | business description, contact, socials, policy links, copyright |

**Validation:** every section has a Zod schema. Unknown/unrecognized types are ignored safely at
render time (never execute arbitrary code).

## 4. Template System

Templates are **configuration/data**, not six separate applications. A template = a function (or
static const) returning a default sections array given a tenant's real data (tradeName, phone,
etc.) — i.e., templates provide **structure**, not fake commerce records. Commerce components
(`categories`, `featured-products`, `product-grid`, `banner`→campaign) resolve **real** BharatStore
catalog/marketing data at render time.

Initial 6 templates (in `apps/web/lib/storefront/templates.ts`):
1. `minimal` — clean commerce
2. `fashion` — clothing / sarees / apparel / accessories
3. `electronics` — electronics / mobile accessories / gadgets
4. `grocery` — food / grains / household
5. `beauty` — cosmetics / skincare / salon
6. `general` — flexible for any SME

Each template entry: `{ id, name, description, category, preview (metadata), sections(). }`

**Template safety:** selecting a template **modifies the draft only**. The current published
version is never touched by template selection. Merchant must explicitly Publish. Confirm before
overwriting an existing non-empty draft.

## 5. Draft & Publish Semantics + Version Safety

- **Save Draft** → `pageConfigDraft` updated. Not visible publicly.
- **Preview** → render `pageConfigDraft` (in-builder).
- **Publish** → single atomic write: `pageConfig = pageConfigDraft; pageConfigDraft = null`.
- If a write fails, the previous `pageConfig` stays intact (transaction/SQL-level atomicity).

Templates and drafts never touch `pageConfig` directly.

## 6. Theme Customization

Controlled (Zod-validated, no raw CSS/JS), extending existing theme fields:
- **Brand:** store name, logo, favicon (where supported).
- **Colors:** primary, accent, background, text — stored/limited to safe hex values.
- **Typography:** small curated set of safe font choices (no arbitrary external font URLs).
- **Appearance:** border radius, button style, card style — from a closed set of options.

**Color application (important fix):** the current public storefront stores `primaryColor` /
`accentColor` but renders hard-coded Tailwind colors. The builder will inject theme colors as
**CSS variables** on the storefront root wrapper so they actually drive rendering, with safe
server-side-validated hex values only.

## 7. Builder API

Follow the existing admin route convention (`authorizeRequest` + `getTenantDb` + Zod) under
`apps/web/app/api/admin/storefront/builder/`:

```
GET    /api/admin/storefront/builder        load draft + published + theme + templates
PUT    /api/admin/storefront/builder        save draft sections + theme (validated)
POST   /api/admin/storefront/builder/publish  atomic publish draft → published
POST   /api/admin/storefront/builder/reset    restore draft from a template / clear draft
GET    /api/admin/storefront/templates        list templates (already covered by GET, may be inline)
```

All mutation routes: authenticated, `authorizeRequest(requiredPermission)`, tenant-scoped via
`getTenantDb(tenantId)`, Zod validated. **Backend authorization is mandatory**; client-side checks
are UX only.

## 8. RBAC

Reuse existing storefront permission. Add a new permission code `STOREFRONT_BUILDER_WRITE`
(`storefront:builder:write`) mapped into the role matrix (OWNER, ADMIN, MANAGER have it; STAFF
does not). Read list/templates requires `STOREFRONT_MANAGE`. No separate authorization system.

## 9. Storefront Renderer

Refactor public rendering to a single renderer in `apps/web/lib/storefront/renderer.ts(x)`:

1. Load published config (`pageConfig`) — or, for preview, the draft.
2. Validate each section against the registry schema.
3. Resolve the approved component by `type`.
4. Resolve real commerce data (categories/products/campaign/storefront settings) via efficient
   batched queries (avoid N+1 — fetch category list + selected product sets in few queries).
5. Render the section; ignore invalid/unknown sections safely.

Shared section components render in **both** the public storefront and the builder preview —
no separate preview components (no drift). Server components for public; the preview uses the same
renderer fed the draft.

## 10. Builder UI

Route: `/dashboard/storefront/builder` (inside existing dashboard shell). A premium three-panel
editor on desktop:

```
┌────────────────────────────────────────────────────┐
│ Builder header    [Preview/Save/Publish status]     │
├──────────┬────────────────────────┬─────────────────┤
│ Sections │    LIVE CANVAS          │ Settings       │
│ (reorder,│    (same renderer)      │ section controls│
│ enable)  │                          │ theme controls  │
└──────────┴────────────────────────┴─────────────────┘
```

- **Left:** section list — drag/reorder (native HTML5 drag or robust up/down fallback),
  enable/disable toggle, duplicate/delete, reset.
- **Center:** live preview using the shared renderer (desktop/tablet/mobile viewport toggle).
- **Right:** selected section settings editor (controlled fields) + theme controls.
- **Mobile:** stacked editor with sheet-based navigation (not three crammed panels).
- Save-state indicator: **Saved / Saving… / Unsaved changes**.
- Unsaved-changes warning on leave/reload/template-switch.
- Empty states, loading states, tooltips, publish confirmation, accessible controls.

## 11. Image Management

Reuse existing image URL infra. Store image config as **URLs** (not huge base64 blobs). Validate:
URL format, safe protocols (https/http), reasonable length. No arbitrary executable URLs.

## 12. Real Commerce Data

All commerce components pull real data:
- Category Showcase → existing `Category` rows.
- Featured Products / Product Grid → existing `Product` rows.
- Promotion Banner → existing `Campaign`/marketing system.
- Contact/Support → existing storefront settings/`StorefrontTheme`.

No fake products or business data in templates. Templates provide structure + defaults only.

## 13. SEO

Preserve existing URLs (home, `/products`, `/products/[id]`, checkout, order tracking all
unchanged). Builder allows safe page title / meta description / social preview fields (Zod-validated
length/charset, no raw unsafe metadata). Do not break product/category URLs.

## 14. Performance

- Single-storefront config read per request.
- Commerce data (categories, products, featured) loaded in a small number of batched queries —
  never one query per visual component.
- Reuse existing catalog services/patterns where available.

## 15. Security

- Builder is merchant-only.
- All builder APIs: `authorizeRequest`, tenant isolation (`getTenantDb`), Zod validation.
- Protect: cross-tenant template access, cross-tenant modification, IDOR, arbitrary
  HTML/JS, XSS, malicious URLs, config injection.
- Unknown/malicious config never executes code (registry lookups only, validated schemas).

## 16. Audit Logging

Use existing `AuditLog`. Log:
- template selection
- builder config update (draft save)
- publish
- reset
- theme changes

Do not log sensitive content unnecessarily.

## 17. Testing

Comprehensive Vitest suites (following existing real-DB pattern in `packages/database/src/`):

- **Templates:** load, selection, tenant isolation.
- **Builder:** create config, update, reorder, enable/disable, draft save, publish.
- **Renderer:** valid component, invalid component, missing config, unknown component.
- **Security:** unauthorized access, cross-tenant, IDOR, XSS, malicious URLs.
- **Storefront:** published config appears publicly; draft does not; publish is atomic/replaces prior.

**Regression:** products, categories, cart, checkout, coupons, orders, tracking, marketing,
notifications continue working.

## 18. Files to touch (high-level)

- `packages/database/prisma/schema.prisma` — add 2 columns to `StorefrontTheme`.
- `packages/shared/src/constants/roles.ts` — add `STOREFRONT_BUILDER_WRITE` permission + role map.
- `packages/shared/src/schemas/` — storefront section/builder schemas.
- `apps/web/lib/storefront/` — registry, templates, renderer, types, data-loading.
- `apps/web/components/storefront/sections/` — section components (shared public+preview).
- `apps/web/app/api/admin/storefront/builder/` — GET/PUT/publish/reset routes.
- `apps/web/app/api/admin/storefront/templates/` (optional) — templates route.
- `apps/web/app/(dashboard)/storefront/builder/page.tsx` — builder UI.
- `apps/web/app/store/[slug]/page.tsx` — render config via renderer; apply theme CSS vars.
- `packages/database/src/storefront-builder.test.ts` — tests.

## 19. Not In Scope

- No multi-page storefronts (single templated home page; existing catalog/product/checkout pages
  preserved as-is).
- No arbitrary CSS/JS injection.
- No new payment/provider integrations.
- No newsletter sending unless existing backend supports it (do not fake subscriptions).

## 20. Final Verification

`npm run test --workspace=packages/database`, `npm run build`, `graphify update .`, `git status`.
Verify all previous routes preserved, new builder routes compile, no TS/prerender errors, existing
storefront functional, published config renders correctly. Then report per the milestone template.
