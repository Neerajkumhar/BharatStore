# M10: No-Code Storefront Builder & Template System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let merchants build and customize their public storefront via a no-code visual builder (templates, sections, reorder, theme, draft/publish) while keeping the existing `/store/[slug]` as the single rendering path.

**Architecture:** Extend the existing `StorefrontTheme` model with two JSON columns — `pageConfig` (published sections) and `pageConfigDraft` (draft sections). A typed section registry + shared renderer renders both the public store and the builder preview (no drift). Templates are pure config functions producing a default section list parametrized by real tenant data. Builder APIs are admin-side, tenant-scoped, `authorizeRequest`-protected, and Zod-validated.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind 4, Prisma 6 (Postgres), Zod, Vitest, lucide-react. Monorepo: `apps/web` (@bharatstore/web), `packages/database` (@bharatstore/database), `packages/shared` (@bharatstore/shared).

---

## File Structure Map

New files (create):
- `packages/shared/src/schemas/storefront.ts` — Zod schemas for all section types, published/draft config envelopes, theme customization.
- `apps/web/lib/storefront/types.ts` — shared TS types for storefront sections/config/theme (serializable, mirror schemas).
- `apps/web/lib/storefront/registry.ts` — section registry (type → schema + default config + render component key + label).
- `apps/web/lib/storefront/templates.ts` — the 6 templates as config functions.
- `apps/web/lib/storefront/serialize.ts` — helpers to build/page config defaults, sanitize/validate a config array, and apply template.
- `apps/web/lib/storefront/data.ts` — batched commerce data loading (categories, products, featured, campaigns, storefront settings) shared by public page + preview.
- `apps/web/components/storefront/sections/*.tsx` — one rendering component per section type (shared public + preview):
  - HeroSection, AnnouncementBar, CategoryShowcase, FeaturedProducts, ProductGrid, PromoBanner, AboutSection, TrustBadges, TestimonialsSection, FaqSection, ContactSection, FooterSection.
- `apps/web/lib/storefront/renderer.tsx` — the renderer: takes a config array + tenant/theme + mode, returns the rendered sections.
- `apps/web/app/api/admin/storefront/builder/route.ts` — GET (load) + PUT (save draft).
- `apps/web/app/api/admin/storefront/builder/publish/route.ts` — POST publish.
- `apps/web/app/api/admin/storefront/builder/reset/route.ts` — POST reset.
- `apps/web/app/api/admin/storefront/templates/route.ts` — GET templates.
- `apps/web/app/(dashboard)/storefront/builder/page.tsx` — the three-panel builder UI (client).
- `apps/web/components/storefront/builder/` — builder sub-components: builder-shell, section-list, canvas, settings-panel, theme-panel, viewport-toggle, save-indicator.
- `packages/database/src/storefront-builder.test.ts` — test suite.

Modified files:
- `packages/database/prisma/schema.prisma` — add `pageConfig` + `pageConfigDraft` JSON columns to `StorefrontTheme`.
- `packages/shared/src/constants/roles.ts` — add `STOREFRONT_BUILDER_WRITE` permission + role map entries.
- `packages/shared/src/schemas/index.ts` — export `./storefront`.
- `apps/web/app/store/[slug]/page.tsx` — render published config via renderer; apply theme CSS variables.
- `apps/web/app/store/[slug]/layout.tsx` — apply theme CSS variables on the storefront root wrapper.
- `apps/web/middleware.ts` — add `/dashboard/storefront/builder` to `protectedRoutes` (already covered by `/dashboard` prefix — verify).

---
## Task 1: Add pageConfig columns to StorefrontTheme + Prisma migration

**Files:**
- Modify: `packages/database/prisma/schema.prisma` (StorefrontTheme model, lines ~516-537)
- Modify: `packages/database/prisma/migrations/` (via migrate dev)

- [ ] **Step 1: Add JSON columns to StorefrontTheme + isFeatured to Product**

Edit `packages/database/prisma/schema.prisma`. In `model StorefrontTheme`, after `socialLinks    Json?     @map("social_links")` add:

```prisma
  pageConfig         Json?     @map("page_config")
  pageConfigDraft    Json?     @map("page_config_draft")
  appearanceSettings Json?     @map("appearance_settings")
```

`appearanceSettings` holds validated theme customization: `{ backgroundColor, textColor, fontFamily, borderRadius, buttonStyle, cardStyle, faviconUrl }` (safe enums/hex only, no raw CSS).

In `model Product`, after `isPublished   Boolean   @default(true) @map("is_published")` add:

```prisma
  isFeatured    Boolean   @default(false) @map("is_featured")
```

The `featured` selection mode in the builder relies on `isFeatured`; existing products default to `false` (no data migration needed).

- [ ] **Step 2: Generate the migration**

Run: `npm run db:migrate --workspace=packages/database -- --name m10_storefront_builder`
(or from `packages/database`: `npx prisma migrate dev --name m10_storefront_builder`).
Expected: new migration folder created, Prisma client regenerated, no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/database/prisma
git commit -m "feat(storefront-builder): add pageConfig & pageConfigDraft to StorefrontTheme"
```

---
## Task 2: Add STOREFRONT_BUILDER_WRITE permission + role map

**Files:**
- Modify: `packages/shared/src/constants/roles.ts`

- [ ] **Step 1: Add the permission constant**

In `PERMISSIONS`, next to `STOREFRONT_MANAGE: 'storefront:manage',` add:

```ts
  STOREFRONT_BUILDER_WRITE: 'storefront:builder:write',
```

- [ ] **Step 2: Map it into OWNER, ADMIN, MANAGER role arrays**

Add `PERMISSIONS.STOREFRONT_BUILDER_WRITE,` to the OWNER, ADMIN, and MANAGER arrays in `ROLE_PERMISSIONS`. OWNER/ADMIN get it via `Object.values(PERMISSIONS)` automatically. For MANAGER, add the line after `PERMISSIONS.STOREFRONT_MANAGE,`. STAFF does NOT get it.

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/constants/roles.ts
git commit -m "feat(storefront-builder): add STOREFRONT_BUILDER_WRITE permission"
```

---
## Task 3: Shared storefront schemas (Zod)

**Files:**
- Create: `packages/shared/src/schemas/storefront.ts`
- Modify: `packages/shared/src/schemas/index.ts`
- Test: `packages/database/src/storefront-builder.test.ts` (added in Task 11 — schema import smoke-tested there)

- [ ] **Step 1: Create the schema skeleton with shared scalars + section base**

Create `packages/shared/src/schemas/storefront.ts`:

```ts
import { z } from 'zod';

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a 6-digit hex color like #0f172a');

export const safeImageUrlSchema = z
  .string()
  .max(2000)
  .url('Must be a valid URL')
  .refine((u) => u.startsWith('https://') || u.startsWith('http://'), 'Only http(s) URLs allowed');

const baseSection = z.object({
  id: z.string().uuid(),
  enabled: z.boolean().default(true),
});

export const HERO_ALIGNMENTS = ['left', 'center', 'right'] as const;
export const SECTION_HEIGHTS = ['small', 'medium', 'large'] as const;
export const PRODUCT_SELECTION_MODES = ['newest', 'featured', 'category', 'manual'] as const;
export const SECTION_LAYOUTS = ['grid', 'carousel'] as const;

export const STOREFRONT_SECTION_TYPES = [
  'hero',
  'announcement',
  'categories',
  'featured-products',
  'product-grid',
  'banner',
  'about',
  'trust',
  'testimonials',
  'faq',
  'contact',
  'footer',
] as const;

export const storefrontSectionTypeSchema = z.enum(STOREFRONT_SECTION_TYPES);
export type StorefrontSectionType = z.infer<typeof storefrontSectionTypeSchema>;
```

- [ ] **Step 2: Add per-type config schemas**

Append to `packages/shared/src/schemas/storefront.ts`:

```ts
export const heroConfigSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(500).optional().nullable(),
  image: safeImageUrlSchema.optional().nullable(),
  ctaText: z.string().max(60).optional().nullable(),
  ctaDestination: z.string().max(200).optional().nullable(),
  alignment: z.enum(HERO_ALIGNMENTS).default('center'),
  height: z.enum(SECTION_HEIGHTS).default('medium'),
});

export const announcementConfigSchema = z.object({
  text: z.string().min(1).max(300),
  link: z.string().max(200).optional().nullable(),
});

export const categoriesConfigSchema = z.object({
  title: z.string().max(200).default('Shop by Category'),
  count: z.number().int().min(1).max(12).default(6),
  layout: z.enum(SECTION_LAYOUTS).default('grid'),
});

export const featuredProductsConfigSchema = z.object({
  title: z.string().max(200).default('Featured Products'),
  selectionMode: z.enum(PRODUCT_SELECTION_MODES).default('newest'),
  categoryId: z.string().uuid().optional().nullable(),
  productIds: z.array(z.string().uuid()).max(24).default([]),
  count: z.number().int().min(1).max(24).default(8),
  layout: z.enum(SECTION_LAYOUTS).default('grid'),
});

export const productGridConfigSchema = z.object({
  title: z.string().max(200).default('Products'),
  selectionMode: z.enum(PRODUCT_SELECTION_MODES).default('newest'),
  categoryId: z.string().uuid().optional().nullable(),
  productIds: z.array(z.string().uuid()).max(24).default([]),
  count: z.number().int().min(1).max(24).default(12),
  fullCatalogLink: z.boolean().default(true),
});
```

- [ ] **Step 3: Add banner/about/trust/testimonials/faq/contact/footer config schemas**

Append to `packages/shared/src/schemas/storefront.ts`:

```ts
export const bannerConfigSchema = z.object({
  heading: z.string().min(1).max(200),
  description: z.string().max(500).optional().nullable(),
  image: safeImageUrlSchema.optional().nullable(),
  ctaText: z.string().max(60).optional().nullable(),
  ctaDestination: z.string().max(200).optional().nullable(),
  campaignId: z.string().uuid().optional().nullable(),
});

export const aboutConfigSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  image: safeImageUrlSchema.optional().nullable(),
});

export const trustBadgeSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(80),
  description: z.string().max(200).optional().nullable(),
  icon: z.string().max(40).default('shield'),
});

export const trustConfigSchema = z.object({
  title: z.string().max(200).default('Why Shop With Us'),
  badges: z.array(trustBadgeSchema).min(1).max(6).default([]),
});

export const testimonialItemSchema = z.object({
  id: z.string().uuid(),
  quote: z.string().min(1).max(500),
  author: z.string().min(1).max(120),
  role: z.string().max(120).optional().nullable(),
});

export const testimonialsConfigSchema = z.object({
  title: z.string().max(200).default('What Our Customers Say'),
  items: z.array(testimonialItemSchema).min(1).max(12).default([]),
});

export const faqItemSchema = z.object({
  id: z.string().uuid(),
  question: z.string().min(1).max(300),
  answer: z.string().min(1).max(2000),
});

export const faqConfigSchema = z.object({
  title: z.string().max(200).default('Frequently Asked Questions'),
  items: z.array(faqItemSchema).max(20).default([]),
});

export const contactConfigSchema = z.object({
  title: z.string().max(200).default('Get in Touch'),
  description: z.string().max(500).optional().nullable(),
  showPhone: z.boolean().default(true),
  showEmail: z.boolean().default(true),
  showHours: z.boolean().default(true),
});

export const footerConfigSchema = z.object({
  description: z.string().max(1000).optional().nullable(),
  showSocialLinks: z.boolean().default(true),
  showPolicyLinks: z.boolean().default(true),
  showContactInfo: z.boolean().default(true),
});
```

- [ ] **Step 4: Assemble the discriminated section union + envelopes**

Append to `packages/shared/src/schemas/storefront.ts`:

```ts
export const sectionSchema = z.discriminatedUnion('type', [
  baseSection.extend({ type: z.literal('hero'), config: heroConfigSchema }),
  baseSection.extend({ type: z.literal('announcement'), config: announcementConfigSchema }),
  baseSection.extend({ type: z.literal('categories'), config: categoriesConfigSchema }),
  baseSection.extend({ type: z.literal('featured-products'), config: featuredProductsConfigSchema }),
  baseSection.extend({ type: z.literal('product-grid'), config: productGridConfigSchema }),
  baseSection.extend({ type: z.literal('banner'), config: bannerConfigSchema }),
  baseSection.extend({ type: z.literal('about'), config: aboutConfigSchema }),
  baseSection.extend({ type: z.literal('trust'), config: trustConfigSchema }),
  baseSection.extend({ type: z.literal('testimonials'), config: testimonialsConfigSchema }),
  baseSection.extend({ type: z.literal('faq'), config: faqConfigSchema }),
  baseSection.extend({ type: z.literal('contact'), config: contactConfigSchema }),
  baseSection.extend({ type: z.literal('footer'), config: footerConfigSchema }),
]);

export type StorefrontSection = z.infer<typeof sectionSchema>;
export const storefrontSectionsSchema = z.array(sectionSchema).max(40);

export const appearanceSettingsSchema = z.object({
  backgroundColor: hexColorSchema.optional(),
  textColor: hexColorSchema.optional(),
  fontFamily: z.enum(['inter', 'system', 'georgia']).optional(),
  borderRadius: z.enum(['sharp', 'rounded', 'pill']).optional(),
  buttonStyle: z.enum(['filled', 'outline', 'ghost']).optional(),
  cardStyle: z.enum(['flat', 'bordered', 'shadow']).optional(),
  faviconUrl: safeImageUrlSchema.optional().nullable(),
});

export const builderSaveSchema = z.object({
  sections: z.array(sectionSchema).max(40),
  appearance: appearanceSettingsSchema.optional(),
});

export const builderPublishSchema = z.object({
  confirm: z.boolean().default(true),
});

export const builderResetSchema = z.object({
  templateId: z.string().min(1).optional(),
  confirm: z.boolean().default(false),
});
```

- [ ] **Step 5: Export from schemas index**

Edit `packages/shared/src/schemas/index.ts` — add `export * from './storefront';`.

- [ ] **Step 6: Typecheck shared + database packages**

Run: `npm run build --workspace=packages/shared`
Expected: compiles with zero errors.

- [ ] **Step 7: Commit**

```bash
git add packages/shared/src/schemas
git commit -m "feat(storefront-builder): add shared section schemas"
```

---
## Task 4: Storefront types, templates, and serialize helpers

**Files:**
- Create: `apps/web/lib/storefront/types.ts`
- Create: `apps/web/lib/storefront/templates.ts`
- Create: `apps/web/lib/storefront/serialize.ts`

- [ ] **Step 1: Create types.ts (re-export + builder input types)**

Create `apps/web/lib/storefront/types.ts`:

```ts
import type {
  StorefrontSection,
  StorefrontSectionType,
  appearanceSettingsSchema as _appearance,
} from '@bharatstore/shared/schemas';
import { z } from 'zod';

export type { StorefrontSection, StorefrontSectionType };

export type AppearanceSettings = z.infer<typeof _appearance>;

export interface StorefrontConfig {
  sections: StorefrontSection[];
  appearance: AppearanceSettings;
}

export interface StorefrontTemplateMeta {
  id: string;
  name: string;
  description: string;
  category: string;
}
```

- [ ] **Step 2: Create templates.ts — template context + section factory**

Create `apps/web/lib/storefront/templates.ts`:

```ts
import { randomUUID } from 'crypto';
import type {
  StorefrontSection,
  StorefrontSectionType,
} from '@bharatstore/shared/schemas';
import type { StorefrontTemplateMeta } from './types';

export interface TemplateContext {
  tradeName: string;
  phone: string;
  email?: string;
  businessHours?: string;
  description?: string;
  city?: string;
}

export interface StorefrontTemplate extends StorefrontTemplateMeta {
  sections: (ctx: TemplateContext) => StorefrontSection[];
}

export function createSection<T extends StorefrontSectionType>(
  type: T,
  config: Extract<StorefrontSection, { type: T }>['config'],
  enabled = true,
): StorefrontSection {
  return { id: randomUUID(), type, enabled, config } as StorefrontSection;
}

export const TEMPLATES: Record<string, StorefrontTemplate> = {
  minimal: { id: 'minimal', name: 'Minimal', description: 'Clean, simple commerce storefront', category: 'General', sections: (ctx) => [
    createSection('hero', { title: `Welcome to ${ctx.tradeName}`, subtitle: 'Everyday essentials delivered to your doorstep', alignment: 'center', height: 'medium' }),
    createSection('categories', { title: 'Shop by Category', count: 6, layout: 'grid' }),
    createSection('featured-products', { title: 'Featured Products', selectionMode: 'newest', count: 8, layout: 'grid' }),
    createSection('trust', { title: 'Why Shop With Us', badges: [
      { id: randomUUID(), title: 'Secure Payments', description: 'Cash, UPI and khata credit options', icon: 'shield' },
      { id: randomUUID(), title: 'GST Invoice', description: 'Instant tax invoice with every order', icon: 'file' },
      { id: randomUUID(), title: 'Easy Support', description: `Call or message us any time`, icon: 'phone' },
    ] }),
    createSection('footer', {}),
  ]},
fashion: { id: 'fashion', name: 'Fashion', description: 'For clothing, sarees, apparel and accessories', category: 'Fashion', sections: (ctx) => [
    createSection('announcement', { text: 'New season collection now in store' }),
    createSection('hero', { title: `${ctx.tradeName}`, subtitle: 'Timeless fashion, modern comfort', ctaText: 'Shop Now', ctaDestination: '/products', alignment: 'center', height: 'large' }),
    createSection('categories', { title: 'Shop by Style', count: 8, layout: 'carousel' }),
    createSection('featured-products', { title: 'Trending Now', selectionMode: 'featured', count: 8, layout: 'grid' }),
    createSection('banner', { heading: 'Limited Period Offer', description: 'Auto-applied savings on selected items in store', ctaText: 'Browse Collection', ctaDestination: '/products', campaignId: null }),
    createSection('about', { title: `About ${ctx.tradeName}`, description: ctx.description || `We are a local business bringing you quality products with a personal touch` }),
    createSection('testimonials', { title: 'What Our Customers Say', items: [] }),
    createSection('faq', { title: 'Frequently Asked Questions', items: [] }),
    createSection('contact', { title: 'Contact Us', description: 'Visit our store or reach out any time' }),
    createSection('footer', {}),
  ]},
```

Note: `image` and `ctaDestination` are configured with real values or omitted — **never** empty-string URLs (they fail `.url()` validation) and **never** a literal `__SLUG__` placeholder. Relative destinations like `/products` are resolved by the renderer onto `/store/{slug}/products`.

- [ ] **Step 3: Add the remaining 4 templates (electronics, grocery, beauty, general)**

Append the four template entries to the `TEMPLATES` object in `templates.ts`. Each uses the same `createSection` helper and real-tenant context; content defaults, no fake product data:

```ts
  electronics: { id: 'electronics', name: 'Electronics', description: 'For electronics, mobile accessories and gadgets', category: 'Electronics', sections: (ctx) => [
    createSection('hero', { title: `${ctx.tradeName}`, subtitle: 'Genuine electronics and accessories at the right price', alignment: 'left', height: 'medium' }),
    createSection('categories', { title: 'Shop by Category', count: 6, layout: 'grid' }),
    createSection('featured-products', { title: 'New Arrivals', selectionMode: 'newest', count: 8, layout: 'grid' }),
    createSection('product-grid', { title: 'All Products', selectionMode: 'newest', count: 12, fullCatalogLink: true }),
    createSection('trust', { title: 'Shop With Confidence', badges: [
      { id: randomUUID(), title: 'Genuine Products', description: 'Authorized sourcing, quality checked', icon: 'shield' },
      { id: randomUUID(), title: 'GST Invoice', description: 'Instant tax invoice with every order', icon: 'file' },
      { id: randomUUID(), title: 'Personal Support', description: 'Real help before and after purchase', icon: 'phone' },
    ] }),
    createSection('faq', { title: 'Questions?', items: [] }),
    createSection('footer', {}),
  ]},
  grocery: { id: 'grocery', name: 'Grocery', description: 'For food, grains and household products', category: 'Everyday', sections: (ctx) => [
    createSection('announcement', { text: 'Fresh stock every day — order before 6 PM for same-day packing' }),
    createSection('hero', { title: `${ctx.tradeName}`, subtitle: 'Daily needs, delivered quick', alignment: 'center', height: 'medium' }),
    createSection('categories', { title: 'Browse by Category', count: 8, layout: 'grid' }),
    createSection('featured-products', { title: 'Today\u2019s Picks', selectionMode: 'featured', count: 8, layout: 'grid' }),
    createSection('product-grid', { title: 'Shop Everything', selectionMode: 'newest', count: 12, fullCatalogLink: true }),
    createSection('about', { title: `About ${ctx.tradeName}`, description: ctx.description || 'Serving our neighbourhood with quality food and household essentials' }),
    createSection('trust', { title: 'Why Customers Trust Us', badges: [
      { id: randomUUID(), title: 'Quality Checked', description: 'Every batch inspected before dispatch', icon: 'shield' },
      { id: randomUUID(), title: 'Best Price', description: 'Honest pricing on everyday essentials', icon: 'star' },
    ] }),
    createSection('contact', { title: 'Contact Us', description: ctx.businessHours || 'Mon - Sat: 9:00 AM - 9:00 PM' }),
    createSection('footer', {}),
  ]},
  beauty: { id: 'beauty', name: 'Beauty', description: 'For cosmetics, skincare and salon products', category: 'Beauty', sections: (ctx) => [
    createSection('hero', { title: `${ctx.tradeName}`, subtitle: 'Self-care, simplified', image: '', alignment: 'center', height: 'medium' }),
    createSection('categories', { title: 'Shop by Category', count: 6, layout: 'carousel' }),
    createSection('featured-products', { title: 'Bestsellers', selectionMode: 'featured', count: 8, layout: 'grid' }),
    createSection('about', { title: `About ${ctx.tradeName}`, description: ctx.description || 'Trusted products for your everyday routine' }),
    createSection('testimonials', { title: 'Loved by Customers', items: [] }),
    createSection('contact', { title: 'Contact Us', description: 'Questions about your routine? Reach out.' }),
    createSection('footer', {}),
  ]},
  general: { id: 'general', name: 'General Store', description: 'Flexible template for any SME', category: 'General', sections: (ctx) => [
    createSection('announcement', { text: 'Welcome to our online store' }),
    createSection('hero', { title: `Welcome to ${ctx.tradeName}`, subtitle: 'Quality products delivered straight to your doorstep', alignment: 'center', height: 'large' }),
    createSection('categories', { title: 'Shop by Category', count: 8, layout: 'grid' }),
    createSection('featured-products', { title: 'Featured Products', selectionMode: 'featured', count: 8, layout: 'grid' }),
    createSection('product-grid', { title: 'All Products', selectionMode: 'newest', count: 12, fullCatalogLink: true }),
    createSection('banner', { heading: 'Special Offers', description: 'Look out for coupons and seasonal promotions', ctaText: 'View Products', ctaDestination: '/products', campaignId: null }),
    createSection('trust', { title: 'Why Shop With Us', badges: [
      { id: randomUUID(), title: 'Trusted Local Business', description: 'Serving customers near you', icon: 'shield' },
      { id: randomUUID(), title: 'GST Invoice', description: 'Instant tax invoice with every order', icon: 'file' },
    ] }),
    createSection('contact', { title: 'Contact Us', description: 'We are here to help' }),
    createSection('footer', {}),
  ]},
```

- [ ] **Step 4: Create serialize.ts — template lookup, sanitize, defaults**

Create `apps/web/lib/storefront/serialize.ts`:

```ts
import { sectionSchema, storefrontSectionsSchema } from '@bharatstore/shared/schemas';
import type { StorefrontSection } from './types';
import { TEMPLATES, createSection, type TemplateContext } from './templates';

export const TEMPLATE_LIST = Object.values(TEMPLATES).map(({ id, name, description, category }) => ({ id, name, description, category }));

export function getTemplate(id: string) {
  return TEMPLATES[id] ?? null;
}

export function buildTemplateSections(templateId: string, ctx: TemplateContext): StorefrontSection[] {
  const tpl = getTemplate(templateId);
  if (!tpl) return [];
  return tpl.sections(ctx);
}

export function defaultStorefrontSections(ctx: TemplateContext): StorefrontSection[] {
  return buildTemplateSections('minimal', ctx);
}

export function sanitizeSections(raw: unknown): StorefrontSection[] {
  if (!Array.isArray(raw)) return [];
  const parsed = storefrontSectionsSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  // Drop only the invalid entries rather than failing the whole page.
  const cleaned = raw
    .map((item) => sectionSchema.safeParse(item))
    .filter((r): r is { success: true; data: StorefrontSection } => r.success)
    .map((r) => r.data);
  return cleaned;
}

export function assertValidSections(raw: unknown): StorefrontSection[] {
  const result = storefrontSectionsSchema.safeParse(raw);
  if (!result.success) throw new Error('Invalid storefront sections: ' + result.error.message);
  return result.data;
}
```

- [ ] **Step 5: Typecheck web package**

Run: `npx tsc --noEmit` from `apps/web`.
Expected: zero errors. (Fix any literal-type mismatches in template configs — e.g. ensure unions resolve to the exact config shape.)

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib/storefront
git commit -m "feat(storefront-builder): add templates and serialize helpers"
```

---
## Task 5: Section components (shared public + preview)

**Files:**
- Create: `apps/web/components/storefront/sections/section-types.ts` (shared prop types)
- Create: `apps/web/components/storefront/sections/HeroSection.tsx`
- Create: `apps/web/components/storefront/sections/AnnouncementBar.tsx`
- Create: `apps/web/components/storefront/sections/CategoryShowcase.tsx`
- Create: `apps/web/components/storefront/sections/FeaturedProducts.tsx`
- Create: `apps/web/components/storefront/sections/ProductGrid.tsx`
- Create: `apps/web/components/storefront/sections/PromoBanner.tsx`
- Create: `apps/web/components/storefront/sections/AboutSection.tsx`
- Create: `apps/web/components/storefront/sections/TrustBadges.tsx`
- Create: `apps/web/components/storefront/sections/TestimonialsSection.tsx`
- Create: `apps/web/components/storefront/sections/FaqSection.tsx`
- Create: `apps/web/components/storefront/sections/ContactSection.tsx`
- Create: `apps/web/components/storefront/sections/FooterSection.tsx`

These components are **server components** (no `'use client'`) except where interactive (FAQ accordion, ProductGrid view-all link is fine as server). They render in both the public storefront and the builder preview so they cannot drift.

- [ ] **Step 1: Create section-types.ts (shared props)**

Create `apps/web/components/storefront/sections/section-types.ts`:

```ts
import type { StorefrontSection } from '@bharatstore/shared/schemas';

export interface ResolvedData {
  categories?: Array<{ id: string; name: string; slug: string; productCount: number; imageUrl?: string | null }>;
  products?: Array<{
    id: string;
    title: string;
    slug: string;
    sellingPrice: number;
    mrp: number;
    images: string[];
    categoryName: string;
    variants: Array<{ id: string; sku: string; variantName: string; priceOverride: number | null; currentStock: number }>;
  }>;
  campaigns?: Array<{ id: string; name: string; description?: string | null }>;
}

export interface SectionRenderContext {
  slug: string;
  theme: {
    primaryColor?: string | null;
    accentColor?: string | null;
    logoUrl?: string | null;
    businessHours?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
    socialLinks?: Record<string, string> | null;
  };
  tenant: {
    tradeName: string;
    slug: string;
    phone: string;
    email?: string | null;
    addressLine1?: string | null;
    city?: string | null;
    pincode?: string | null;
    gstin?: string | null;
  };
  data?: ResolvedData;
}

export interface SectionProps<T> {
  section: StorefrontSection & { type: T; config: Extract<StorefrontSection, { type: T }>['config'] };
  ctx: SectionRenderContext;
}

export function storeHref(slug: string, dest?: string | null): string | null {
  if (!dest) return null;
  if (dest.startsWith('/store/')) return dest;
  if (dest.startsWith('/')) return `/store/${slug}${dest}`;
  return dest.startsWith('http') ? dest : null;
}
```

Every section component accepts `{ section, ctx }`. `storeHref` centralizes safe destination resolution (relative → store-scoped; `/store/...` and `http(s)` → as-is; anything else → null).

Note: `data` is optional — components render their own empty states when commerce data is absent (public and preview share this behavior).
```

- [ ] **Step 2: Create HeroSection.tsx**

Create `apps/web/components/storefront/sections/HeroSection.tsx`:

```tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { storeHref, type SectionProps } from './section-types';

export function HeroSection({ section, ctx }: SectionProps<'hero'>) {
  const cfg = section.config;
  const href = storeHref(ctx.slug, cfg.ctaDestination);
  const align = cfg.alignment === 'left' ? 'text-left items-start' : cfg.alignment === 'right' ? 'text-right items-end' : 'text-center items-center';
  const heights = { small: 'py-10', medium: 'py-16 sm:py-20', large: 'py-24 sm:py-32' } as const;
  return (
    <section className={`relative overflow-hidden bg-slate-900 text-white ${heights[cfg.height]} px-4 sm:px-6 lg:px-8`}>
      {cfg.image && (
        <div className="absolute inset-0 opacity-20" aria-hidden>
          <img src={cfg.image} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className={`relative z-10 mx-auto flex max-w-5xl flex-col gap-4 ${align}`}>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">{cfg.title}</h1>
        {cfg.subtitle && <p className="max-w-2xl text-base text-slate-300 sm:text-lg">{cfg.subtitle}</p>}
        {href && cfg.ctaText && (
          <div className="pt-2">
            <Link href={href} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-amber-400">
              {cfg.ctaText} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create AnnouncementBar.tsx + CategoryShowcase.tsx**

Create `apps/web/components/storefront/sections/AnnouncementBar.tsx`. It renders a slim bar (bg-slate-900/team color, one line of text) with an optional Link when `config.link` is set (resolve `/...` against `/store/${slug}` using the same helper pattern as Hero).

Create `apps/web/components/storefront/sections/CategoryShowcase.tsx` (`SectionProps<'categories'>`):

```tsx
import Link from 'next/link';
import { Layers, ArrowRight } from 'lucide-react';
import type { SectionProps } from './section-types';

export function CategoryShowcase({ slug, section, data }: SectionProps<'categories'> & { data?: ResolvedData }) {
  const cfg = section.config;
  const cats = (data?.categories ?? []).slice(0, cfg.count);
  if (cats.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">{cfg.title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">Browse curated product collections</p>
        </div>
        <Link href={`/store/${slug}/products`} className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700">
          View All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className={`grid gap-3 ${cfg.layout === 'carousel' ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'}`}>
        {cats.map((cat) => (
          <Link key={cat.id} href={`/store/${slug}/products?categoryId=${cat.id}`} className="group flex flex-col items-center space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-center transition-all hover:border-amber-500 hover:shadow-md">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600 transition group-hover:bg-amber-500 group-hover:text-slate-950">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="w-full truncate text-xs font-bold text-slate-900 transition group-hover:text-amber-600">{cat.name}</h3>
            <span className="text-2xs font-medium text-slate-400">{cat.productCount} Products</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create FeaturedProducts.tsx + ProductGrid.tsx**

Both render the shared `ProductCard` from `@/components/storefront/product-card` with products resolved in `data.products`. They accept `data?: ResolvedData` and use `cfg.count`/`cfg.layout`. `FeaturedProducts.tsx` slices `data.products` to `cfg.count`; ProductGrid renders the full set plus a "View Full Catalog" link when `cfg.fullCatalogLink`. They must handle the empty state (no products → render an empty-state block, mirroring the current storefront).

Create both components now, importing `ProductCard` and formatting products to its prop shape (numbers from Decimal already applied in `data.ts`).

- [ ] **Step 5: Create PromoBanner.tsx + AboutSection.tsx + TrustBadges.tsx**

- `PromoBanner.tsx` (`SectionProps<'banner'>`): full-width or contained banner with heading, description, optional image (faded background), CTA button (resolve relative dest). If `cfg.campaignId` is set and matches a campaign in `data.campaigns`, show a small "Valid in-store promo" chip with the campaign name.
- `AboutSection.tsx` (`SectionProps<'about'>`): two-column (image + text) layout, image optional.
- `TrustBadges.tsx` (`SectionProps<'trust'>`): grid of badges; map `config.icon` strings to a small safe icon map (`shield`→ShieldCheck, `file`→FileText, `phone`→Phone, `star`→Star, `truck`→Truck, `refresh`→RefreshCcw) inside the component — unknown icon keys fall back to ShieldCheck. Never inject icon names into JSX dynamically.

- [ ] **Step 6: Create TestimonialsSection.tsx + FaqSection.tsx + ContactSection.tsx + FooterSection.tsx**

- `TestimonialsSection.tsx`: grid of quote cards; hidden (`null`) when `config.items` is empty.
- `FaqSection.tsx`: `<details>`/`<summary>` semantic accordion (keyboard accessible by default), one per `config.items`.
- `ContactSection.tsx`: pulls phone/email/hours from the storefront theme via a `theme` prop; respect `showPhone`/`showEmail`/`showHours` flags.
- `FooterSection.tsx`: business description, contact info, social links (from theme `socialLinks`), policy links (Privacy, Terms, Refund — store-relative `/store/{slug}` links), copyright line using `tenant.tradeName` + year. Respect `show*` flags.

Each receives `data`/`theme`/`tenant` props through `ResolvedData`/`SectionProps` where needed. Define a `SectionRenderContext` in `section-types.ts` exporting `{ slug, tenant, theme, data }` and make every section accept it.

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit` from `apps/web`.
Expected: zero errors.

- [ ] **Step 8: Commit**

```bash
git add apps/web/components/storefront/sections
git commit -m "feat(storefront-builder): add section components"
```
