# Graph Report - BharatStore  (2026-09-07)

## Corpus Check
- 246 files · ~153,188 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1264 nodes · 2247 edges · 89 communities (72 shown, 17 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3a955134`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- button.tsx
- schemas/auth.ts
- scripts
- 7. Screen Architecture
- database/src/index.ts
- dependencies
- 3.1 Detailed Module Breakdown (18 Core Modules)
- BharatStore M0+M1 Implementation Plan — Foundations, Auth & Tenant Core
- scripts
- lib/auth.ts
- compilerOptions
- notification-engine.ts
- shared/package.json
- web/tsconfig.json
- 13. Security Architecture
- 15. Development Roadmap
- BharatStore — Product & Technical Blueprint
- database/tsconfig.json
- shared/tsconfig.json
- Global Constraints
- 6. UI/UX Design System
- 8. User Flows
- 9. Technical Architecture
- 10. Multi-Tenant Architecture
- 5. Application Navigation
- 11. Database Entity Model
- 1. Product Vision
- 12. API Architecture
- 2. User Types
- seed.ts
- app/layout.tsx
- next.config.mjs
- next-env.d.ts
- kpi-card.tsx
- Global Constraints
- authorizeRequest
- Global Constraints
- Global Constraints
- authorization.ts
- reports/page.tsx
- notifications/page.tsx
- PERMISSIONS
- useCart
- storefront-renderer.tsx
- schemas/index.ts
- campaigns/route.ts
- marketing/page.tsx
- animation-wrapper.tsx
- staff/page.tsx
- storefront-demo-data.ts
- BharatStore — Production Deployment & Operational Manual
- StorefrontSettingsPage
- audit/page.tsx
- security/page.tsx
- SettingsPage
- notifications/route.ts
- storefront-builder.ts
- M10: No-Code Storefront Builder & Template System — Design
- constants/index.ts
- builder/page.tsx
- storefront-templates.ts
- product-card.tsx
- M10: No-Code Storefront Builder & Template System — Implementation Plan
- component-registry.ts
- preview-html.ts
- builder/route.ts
- categories-section.tsx
- footer-section.tsx
- hero-section.tsx
- orders/route.ts
- testimonials-section.tsx
- countdown-sale-section.tsx
- faq-section.tsx
- theme-gallery.tsx
- coupon-strip-section.tsx
- product-tabs-section.tsx
- storefront-builder.test.ts
- brand-story-section.tsx
- product-spotlight-section.tsx
- hero-split-section.tsx
- lookbook-section.tsx
- newsletter-section.tsx
- product-comparison-section.tsx
- theme-card.tsx

## God Nodes (most connected - your core abstractions)
1. `authorizeRequest()` - 109 edges
2. `getTenantDb()` - 93 edges
3. `prisma` - 57 edges
4. `PERMISSIONS` - 45 edges
5. `AnimationWrapper()` - 29 edges
6. `7. Screen Architecture` - 28 edges
7. `cn()` - 24 edges
8. `BharatStore M0+M1 Implementation Plan — Foundations, Auth & Tenant Core` - 24 edges
9. `M10: No-Code Storefront Builder & Template System — Design` - 22 edges
10. `Button` - 19 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `buildTemplatePageConfig()`  [EXTRACTED]
  apps/web/app/api/admin/storefront/builder/apply-theme/route.ts → packages/shared/src/constants/storefront-templates.ts
- `POST()` --calls--> `getTenantDb()`  [EXTRACTED]
  apps/web/app/api/admin/storefront/builder/publish/route.ts → packages/database/src/client.ts
- `POST()` --calls--> `getTenantDb()`  [EXTRACTED]
  apps/web/app/api/admin/storefront/builder/reset/route.ts → packages/database/src/client.ts
- `GET()` --calls--> `getTenantDb()`  [EXTRACTED]
  apps/web/app/api/admin/storefront/builder/route.ts → packages/database/src/client.ts
- `GET()` --calls--> `getTenantDb()`  [EXTRACTED]
  apps/web/app/api/analytics/customers/route.ts → packages/database/src/client.ts

## Import Cycles
- None detected.

## Communities (89 total, 17 thin omitted)

### Community 0 - "button.tsx"
Cohesion: 0.06
Nodes (51): sampleOrders, AnalyticsHeader(), analyticsTabs, dateRanges, CustomerModal(), CustomerModalProps, KhataPaymentModal(), KhataPaymentModalProps (+43 more)

### Community 1 - "schemas/auth.ts"
Cohesion: 0.29
Nodes (6): LoginInput, LoginSchema, OnboardBusinessInput, OnboardBusinessSchema, RegisterInput, RegisterSchema

### Community 2 - "scripts"
Cohesion: 0.06
Nodes (30): dependencies, bcryptjs, @prisma/client, devDependencies, prisma, tsx, @types/bcryptjs, @types/node (+22 more)

### Community 3 - "7. Screen Architecture"
Cohesion: 0.07
Nodes (28): 7.10 Categories (`/dashboard/categories`), 7.11 Inventory (`/dashboard/inventory`), 7.12 Inventory Details (drawer `/dashboard/inventory/[id]`), 7.13 Orders (`/dashboard/orders`), 7.14 Order Details (`/dashboard/orders/[id]`), 7.15 Customers (`/dashboard/customers`), 7.16 Customer Details (`/dashboard/customers/[id]`), 7.17 Payments (`/dashboard/payments`) (+20 more)

### Community 4 - "database/src/index.ts"
Cohesion: 0.09
Nodes (5): GET(), GET(), POST(), prisma, TenantDb

### Community 5 - "dependencies"
Cohesion: 0.04
Nodes (48): dependencies, bcryptjs, @bharatstore/database, @bharatstore/shared, clsx, jose, lucide-react, next (+40 more)

### Community 6 - "3.1 Detailed Module Breakdown (18 Core Modules)"
Cohesion: 0.04
Nodes (44): 10. Database Entity Model & Relational Schema, 10. Payments & UPI Engine, 11. Invoices & GST Compliance, 11. Preliminary REST API Specification, 12. Security Architecture & Threat Defense, 12. Storefront Engine & Theme Builder, 13. Marketing & Customer Engagement, 13. Repository Structure (+36 more)

### Community 7 - "BharatStore M0+M1 Implementation Plan — Foundations, Auth & Tenant Core"
Cohesion: 0.08
Nodes (24): BharatStore M0+M1 Implementation Plan — Foundations, Auth & Tenant Core, File Structure Map, Out of Scope (Deferred to Future Plans), Plan Completion Criteria, Task 10: Tailwind Tokens, Button Classes & UI Primitives, Task 11: CI Pipeline & Dev Runbook, Task 12: Password, Session & Email Libraries, Task 13: Auth Service & Routes (+16 more)

### Community 8 - "scripts"
Cohesion: 0.08
Nodes (24): dependencies, bcryptjs, devDependencies, typescript, bcryptjs, typescript, name, private (+16 more)

### Community 9 - "lib/auth.ts"
Cohesion: 0.16
Nodes (15): loginSchema, POST(), POST(), registerSchema, getJwtSecret(), SESSION_COOKIE_NAME, signJWT(), UserSessionPayload (+7 more)

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (19): DOM, DOM.Iterable, ESNext, compilerOptions, allowJs, declaration, declarationMap, esModuleInterop (+11 more)

### Community 11 - "notification-engine.ts"
Cohesion: 0.16
Nodes (11): DispatchNotificationOptions, EmailProvider, InAppProvider, interpolateTemplate(), NotificationChannel, NotificationPriority, NotificationProviderAdapter, NotificationType (+3 more)

### Community 12 - "shared/package.json"
Cohesion: 0.11
Nodes (17): dependencies, zod, devDependencies, typescript, exports, ./constants, ./schemas, ./types (+9 more)

### Community 13 - "web/tsconfig.json"
Cohesion: 0.15
Nodes (12): compilerOptions, paths, plugins, exclude, extends, include, ../../tsconfig.base.json, next-env.d.ts (+4 more)

### Community 14 - "13. Security Architecture"
Cohesion: 0.15
Nodes (13): 13.10 HTTP Security, 13.11 Secrets, 13.12 Backups & Recovery, 13.1 Passwords, 13.2 Tokens & Sessions, 13.3 Authentication, 13.4 Authorization & RBAC, 13.5 Tenant Isolation (recap) (+5 more)

### Community 15 - "15. Development Roadmap"
Cohesion: 0.17
Nodes (12): 15. Development Roadmap, M0 — Foundations (wk 1–2), M10 — Hardening & Launch (wk 12–14), M1 — Auth & Tenant Core (wk 2–3), M2 — Products & Categories (wk 3–4), M3 — Inventory (wk 4–5), M4 — Storefront (wk 5–6), M5 — Orders & Payments (wk 6–8) (+4 more)

### Community 16 - "BharatStore — Product & Technical Blueprint"
Cohesion: 0.18
Nodes (10): 14. Repository Structure, 16. Risks and Technical Considerations, 3.1 Module Breakdown, 3.2 Cross-Cutting Concerns, 3. Feature Architecture, 4.1 Sitemap, 4.2 Navigation Grouping, 4. Information Architecture (+2 more)

### Community 17 - "database/tsconfig.json"
Cohesion: 0.18
Nodes (10): compilerOptions, noEmit, outDir, rootDir, extends, include, src/**/*, ../../tsconfig.base.json (+2 more)

### Community 18 - "shared/tsconfig.json"
Cohesion: 0.22
Nodes (8): compilerOptions, noEmit, outDir, rootDir, extends, include, src/**/*, ../../tsconfig.base.json

### Community 19 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Milestone 1: Foundations, Auth, Multi-Tenancy Shell & Design System Implementation Plan, Task 1: Docker Services & Database Setup, Task 2: Database Seeding & Multi-Tenant Verification, Task 3: Design Tokens & UI Component Primitives, Task 4: Authentication Handlers & Tenant Middleware, Task 5: App Shell Layout & Dashboard Landing

### Community 20 - "6. UI/UX Design System"
Cohesion: 0.29
Nodes (7): 6.1 Visual Identity, 6.2 Design Tokens (globals.css :root), 6.3 Typography, 6.4 Spacing & Density, 6.5 Components, 6.6 Motion, 6. UI/UX Design System

### Community 21 - "8. User Flows"
Cohesion: 0.29
Nodes (7): 8.1 New Business Registration → Published Store, 8.2 Receive Order → Fulfill → Invoice → Inventory, 8.3 Add Product (full), 8.4 Staff Invitation → Role Assignment → First Login, 8.5 Login → Tenant Resolution → Authorization → Dashboard, 8.6 Payment Reconciliation (Razorpay webhook), 8. User Flows

### Community 22 - "9. Technical Architecture"
Cohesion: 0.29
Nodes (7): 9.1 System Context Diagram, 9.2 Request/Response Lifecycle, 9.3 Real-time Updates, 9.4 Background Jobs (BullMQ), 9.5 Technology Decisions & Rationale, 9.6 Development Environment, 9. Technical Architecture

### Community 23 - "10. Multi-Tenant Architecture"
Cohesion: 0.33
Nodes (6): 10.1 Model, 10.2 Tenant Identification & Resolution, 10.3 Database Isolation (defense in depth), 10.4 Preventing Cross-Tenant Leakage, 10.5 Authorization inside a tenant, 10. Multi-Tenant Architecture

### Community 24 - "5. Application Navigation"
Cohesion: 0.33
Nodes (6): 5.1 Authenticated App Shell (Desktop), 5.2 Responsive / Mobile Navigation, 5.3 Page Header Pattern, 5.4 Global Search, 5.5 Notifications, 5. Application Navigation

### Community 25 - "11. Database Entity Model"
Cohesion: 0.40
Nodes (5): 11.1 Global Tables (non-tenant), 11.2 Tenant Tables (all carry `business_id`, RLS on), 11.3 Key Relationships, 11.4 Integrity & Indexes, 11. Database Entity Model

### Community 26 - "1. Product Vision"
Cohesion: 0.40
Nodes (5): 1.1 The Problem, 1.2 The Vision, 1.3 Key Differentiators, 1.4 Product Principles, 1. Product Vision

### Community 27 - "12. API Architecture"
Cohesion: 0.50
Nodes (4): 12.1 Conventions, 12.2 Endpoints by Module, 12.3 Error codes, 12. API Architecture

### Community 28 - "2. User Types"
Cohesion: 0.50
Nodes (4): 2.1 Personas, 2.2 Role Model, 2.3 Permission Matrix, 2. User Types

### Community 33 - "next.config.mjs"
Cohesion: 0.50
Nodes (3): __dirname, __filename, nextConfig

### Community 37 - "kpi-card.tsx"
Cohesion: 0.06
Nodes (17): CustomersContent(), InventoryContent(), KhataContent(), OverviewData, ProductData, SalesData, PaymentsContent(), ProductsContent() (+9 more)

### Community 38 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Milestone 2: Product Catalog, Variants, HSN Tax Mapping & Double-Entry Inventory Ledger Implementation Plan, Task 1: Shared Schemas & GST HSN Rate Constants, Task 2: API Endpoints for Categories & Product Catalog Management, Task 3: Double-Entry Inventory Ledger & Stock Adjustment API, Task 4: Product Catalog Management UI Pages, Task 5: Add/Edit Product & Variant Matrix Generator UI, Task 6: Double-Entry Inventory Ledger Management UI

### Community 39 - "authorizeRequest"
Cohesion: 0.10
Nodes (34): GET(), PUT(), GET(), BusinessAlert, GET(), GET(), GET(), GET() (+26 more)

### Community 40 - "Global Constraints"
Cohesion: 0.20
Nodes (9): Global Constraints, Milestone 4: Business Analytics & Intelligence Implementation Plan, Task 1: Date Range & Timezone Analytics Utilities & Unit Tests, Task 2: Server-Side Analytics Aggregation REST APIs, Task 3: Analytics Layout & Header Date Filter Controls, Task 4: Analytics Overview & Business Alerts UI, Task 5: Sales, Product & Category Analytics Views, Task 6: Customer, Inventory, Payments & Khata Analytics Views (+1 more)

### Community 41 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Milestone 3: Omnichannel Orders, Customer Directory, Khata Ledger & Counter POS Terminal Implementation Plan, Task 1: Shared Schemas & GST Tax Calculation Engine, Task 2: API Endpoints for Omnichannel Checkout, Customers & Khata Ledger, Task 3: Customer Directory & Khata Ledger UI, Task 4: Counter POS Terminal Interface, Task 5: Omnichannel Orders & GST Invoice Management UI

### Community 42 - "authorization.ts"
Cohesion: 0.21
Nodes (9): DELETE(), PUT(), GET(), POST(), AuthorizationResult, PermissionCode, ROLE_PERMISSIONS, SYSTEM_ROLES (+1 more)

### Community 45 - "notifications/page.tsx"
Cohesion: 0.40
Nodes (3): NotificationAnalytics, NotificationItem, NotificationTemplate

### Community 46 - "PERMISSIONS"
Cohesion: 0.22
Nodes (11): GET(), GET(), GET(), GET(), GET(), GET(), GET(), PERMISSIONS (+3 more)

### Community 47 - "useCart"
Cohesion: 0.11
Nodes (18): indianStates, StorefrontCheckoutPage(), CartContext, CartContextType, CartItem, CartProvider(), useCart(), CartDrawer() (+10 more)

### Community 48 - "storefront-renderer.tsx"
Cohesion: 0.07
Nodes (30): AboutSection(), AboutSectionProps, AnnouncementSection(), AnnouncementSectionProps, BannerSection(), BannerSectionProps, BrandLogosSection(), BrandLogosSectionProps (+22 more)

### Community 49 - "schemas/index.ts"
Cohesion: 0.08
Nodes (17): GET(), POST(), GET(), POST(), POST(), POST(), GET(), POST() (+9 more)

### Community 50 - "campaigns/route.ts"
Cohesion: 0.18
Nodes (8): GET(), POST(), GET(), POST(), createCampaignSchema, createCouponSchema, updateCampaignSchema, updateCouponSchema

### Community 51 - "marketing/page.tsx"
Cohesion: 0.40
Nodes (3): Campaign, Coupon, MarketingAnalytics

### Community 52 - "animation-wrapper.tsx"
Cohesion: 0.06
Nodes (29): AnimationType, AnimationWrapper(), AnimationWrapperProps, AsymmetricGallerySection(), AsymmetricGallerySectionProps, CategoryCircularSection(), CategoryCircularSectionProps, CategoryMegaSection() (+21 more)

### Community 54 - "storefront-demo-data.ts"
Cohesion: 0.12
Nodes (16): bannerSeed, categoryNames, DEMO_DATASETS, DemoBanner, DemoDataset, demoDatasets, DemoTestimonial, PreviewDemoPayload (+8 more)

### Community 55 - "BharatStore — Production Deployment & Operational Manual"
Cohesion: 0.17
Nodes (11): 1. System Requirements & Prerequisites, 2. Environment Configuration, 3. Database Deployment & Migration Strategy, 4. Production Build & Execution, 5. Operational Health Check Verification, 6. Database Backup & Recovery Strategy, 7. Notification Provider Configuration, 8. Security & Hardening Checklist (+3 more)

### Community 60 - "notifications/route.ts"
Cohesion: 0.14
Nodes (13): POST(), GET(), POST(), POST(), dispatchNotification(), getProviderAdapter(), createNotificationSchema, markReadSchema (+5 more)

### Community 61 - "storefront-builder.ts"
Cohesion: 0.04
Nodes (56): aboutConfigSchema, animationSchema, asymmetricGalleryConfigSchema, bannerConfigSchema, brandLogosConfigSchema, brandStoryConfigSchema, builderUpdateSchema, cardVariantSchema (+48 more)

### Community 62 - "M10: No-Code Storefront Builder & Template System — Design"
Cohesion: 0.09
Nodes (22): 10. Builder UI, 11. Image Management, 12. Real Commerce Data, 13. SEO, 14. Performance, 15. Security, 16. Audit Logging, 17. Testing (+14 more)

### Community 63 - "constants/index.ts"
Cohesion: 0.16
Nodes (8): TemplateSelectorProps, ApplyThemeDialog(), ApplyThemeDialogProps, ThemeCardProps, ThemePreviewModalProps, INDIAN_STATES, STOREFRONT_TEMPLATES, StorefrontTemplate

### Community 64 - "builder/page.tsx"
Cohesion: 0.13
Nodes (8): BuilderState, SectionItem, BuilderSettings(), BuilderSettingsProps, SectionItem, BuilderSidebar(), BuilderToolbar(), BuilderToolbarProps

### Community 65 - "storefront-templates.ts"
Cohesion: 0.19
Nodes (13): POST(), buildTemplatePageConfig(), getTemplateById(), getTemplatesByCategory(), getTemplateSections(), isTemplateCurrent(), STOREFRONT_GALLERY_CATEGORIES, STOREFRONT_TEMPLATE_STYLES (+5 more)

### Community 66 - "product-card.tsx"
Cohesion: 0.10
Nodes (19): ProductCard(), ProductCardProps, ProductCardVariant, colMap, FeaturedProductsSection(), FeaturedProductsSectionProps, Product, FlashSaleSection() (+11 more)

### Community 67 - "M10: No-Code Storefront Builder & Template System — Implementation Plan"
Cohesion: 0.25
Nodes (7): File Structure Map, M10: No-Code Storefront Builder & Template System — Implementation Plan, Task 1: Add pageConfig columns to StorefrontTheme + Prisma migration, Task 2: Add STOREFRONT_BUILDER_WRITE permission + role map, Task 3: Shared storefront schemas (Zod), Task 4: Storefront types, templates, and serialize helpers, Task 5: Section components (shared public + preview)

### Community 68 - "component-registry.ts"
Cohesion: 0.18
Nodes (14): BuilderSidebarProps, iconMap, SectionItem, iconMap, SectionPickerModal(), SectionPickerModalProps, COMPONENT_CATEGORIES, COMPONENT_REGISTRY (+6 more)

### Community 69 - "preview-html.ts"
Cohesion: 0.18
Nodes (16): BuilderCanvas(), BuilderCanvasProps, SectionItem, discountPercent(), esc(), generateStorefrontPreviewHTML(), getPreviewViewportWidth(), PreviewDemoData (+8 more)

### Community 70 - "builder/route.ts"
Cohesion: 0.29
Nodes (7): POST(), GET(), PUT(), saveStorefrontDraft(), SaveStorefrontDraftOptions, applyThemeRequestSchema, pageConfigSchema

### Community 71 - "categories-section.tsx"
Cohesion: 0.40
Nodes (4): CategoriesSection(), CategoriesSectionProps, Category, colMap

### Community 72 - "footer-section.tsx"
Cohesion: 0.40
Nodes (4): FooterSection(), FooterSectionProps, iconMap, ValueProp

### Community 73 - "hero-section.tsx"
Cohesion: 0.40
Nodes (4): alignMap, heightMap, HeroSection(), HeroSectionProps

### Community 74 - "orders/route.ts"
Cohesion: 0.23
Nodes (10): POST(), GET(), POST(), POST(), CartItemForCoupon, CouponValidationResult, validateCouponForCart(), validateCouponSchema (+2 more)

### Community 75 - "testimonials-section.tsx"
Cohesion: 0.33
Nodes (5): CarouselPrimitive(), CarouselPrimitiveProps, Testimonial, TestimonialsSection(), TestimonialsSectionProps

### Community 77 - "faq-section.tsx"
Cohesion: 0.32
Nodes (6): AccordionItem, AccordionPrimitive(), AccordionPrimitiveProps, FaqItem, FaqSection(), FaqSectionProps

### Community 78 - "theme-gallery.tsx"
Cohesion: 0.31
Nodes (7): StorefrontThemesPage(), ThemeGallery(), ThemeGalleryProps, filterTemplates(), getGalleryCategories(), searchTemplates(), sortTemplates()

### Community 80 - "product-tabs-section.tsx"
Cohesion: 0.38
Nodes (5): TabItem, TabsPrimitive(), TabsPrimitiveProps, ProductTabsSection(), ProductTabsSectionProps

### Community 81 - "storefront-builder.test.ts"
Cohesion: 0.20
Nodes (8): StorefrontBuilderPage(), createDefaultSection(), makeSections(), announcementConfigSchema, heroConfigSchema, sectionSchema, themeConfigSchema, validateSectionConfig()

### Community 88 - "theme-card.tsx"
Cohesion: 0.70
Nodes (4): ThemeCard(), getDemoDataset(), getDemoStore(), getPreviewDemoPayload()

## Knowledge Gaps
- **570 isolated node(s):** `OverviewData`, `SalesData`, `ProductData`, `AuditLogEntry`, `sampleOrders` (+565 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `prisma` connect `database/src/index.ts` to `storefront-templates.ts`, `product-card.tsx`, `builder/route.ts`, `authorizeRequest`, `lib/auth.ts`, `authorization.ts`, `orders/route.ts`, `notification-engine.ts`, `useCart`, `storefront-renderer.tsx`, `schemas/index.ts`, `campaigns/route.ts`, `storefront-builder.test.ts`, `notifications/route.ts`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `cn()` connect `button.tsx` to `kpi-card.tsx`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `SECTION_TYPES` connect `component-registry.ts` to `storefront-renderer.tsx`, `storefront-builder.test.ts`, `storefront-builder.ts`, `storefront-templates.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `OverviewData`, `SalesData`, `ProductData` to the rest of the system?**
  _570 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05755879059350504 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `7. Screen Architecture` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._