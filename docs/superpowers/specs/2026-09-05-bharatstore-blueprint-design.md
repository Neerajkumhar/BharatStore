# BharatStore — Product & Technical Blueprint

**Master Specification for BharatStore: A Secure Unified Digital Commerce and Business Management Platform for Indian Small Businesses**

> Version: 1.0 · Date: 2026-09-05 · Status: Approved master specification
> This document is the single source of truth for all future implementation. Every AI coding command and human developer should reference this blueprint for architecture, design, security, and scope decisions.

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [User Types](#2-user-types)
3. [Feature Architecture](#3-feature-architecture)
4. [Information Architecture](#4-information-architecture)
5. [Application Navigation](#5-application-navigation)
6. [UI/UX Design System](#6-uiux-design-system)
7. [Screen Architecture](#7-screen-architecture)
8. [User Flows](#8-user-flows)
9. [Technical Architecture](#9-technical-architecture)
10. [Multi-Tenant Architecture](#10-multi-tenant-architecture)
11. [Database Entity Model](#11-database-entity-model)
12. [API Architecture](#12-api-architecture)
13. [Security Architecture](#13-security-architecture)
14. [Repository Structure](#14-repository-structure)
15. [Development Roadmap](#15-development-roadmap)
16. [Risks and Technical Considerations](#16-risks-and-technical-considerations)

---

## 1. Product Vision

### 1.1 The Problem

Indian small businesses — retailers, manufacturers, wholesalers, suppliers, home-based businesses, handicraft sellers, and emerging online sellers — face a fragmented tool landscape. They need a selling channel, inventory tracking, order management, invoicing, and customer retention, but today these live in separate, disconnected products that each require separate accounts, data entry, and training. Most existing tools are either global products poorly adapted to Indian commerce (GST, UPI, INR flows) or single-purpose tools that don't talk to each other.

### 1.2 The Vision

**BharatStore** is a unified digital commerce and business management platform that brings every part of running a small Indian business into one integrated system:

- **Sell** — a professional online storefront
- **Manage** — products, categories, inventory, orders, customers
- **Get paid** — payments via Razorpay (UPI, cards, netbanking, wallets)
- **Comply** — GST-aware invoices with HSN codes and tax computation
- **Grow** — marketing campaigns, coupons, analytics
- **Control** — staff management with role-based access and full audit trails

### 1.3 Key Differentiators

1. **Unified data model** — one product record powers the storefront, inventory, orders, invoices, and analytics. No silos, no re-entry.
2. **Indian-first** — GST, HSN codes, INR, UPI payments, Indian address formats, multi-language support.
3. **Multi-tenant by design** — tenant isolation is baked into the core architecture (database row-level security + application enforcement), not bolted on.
4. **Security as a feature** — role-based access control, audit logging, security center, suspicious activity detection are first-class features, not afterthoughts.
5. **Scalable for growth** — Postgres + Redis architecture that can grow from a home business to a multi-location retailer.

### 1.4 Product Principles

- Never make the user re-enter data that BharatStore already knows.
- Every screen answers "what does the user want to do next?"
- Empty states teach; errors explain; loading states never feel dead.
- Information-dense but never crowded.
- Security enforced by default at every layer.

---

## 2. User Types

### 2.1 Personas

| Persona | Description | Core Needs |
|---------|-------------|-----------|
| **Rajesh, the retailer** | Owns a general store / electronics shop. Wants to sell online without learning all the tools. | Easy storefront, order alerts, simple inventory |
| **Meera, the handicraft maker** | Home-based artisan. Sells handcrafted goods. Needs beautiful product presentation and low fees. | Product photos, simple invoicing, UPI payments |
| **Anil, the wholesaler** | Sells in bulk to other businesses. Needs order history, GST invoices, credit management. | GST invoices, customer management, bulk pricing |
| **Priya, the manager** | Manages day-to-day operations for an owner. | Order processing, staff coordination, inventory visibility |
| **Staff member** | Cashier / warehouse worker. | Process orders, check stock, look up customers |

### 2.2 Role Model

| Role | Authority |
|------|-----------|
| **Owner** | Full control: all modules, billing, staff, security settings, delete business, transfer ownership. Created at business setup. Only one per business. |
| **Admin** | Near-full access: all modules except billing, business deletion, and ownership transfer. Can manage staff and roles. |
| **Manager** | Operational: manage products, categories, inventory, orders, customers, marketing. No staff/role management, no billing, no security settings, no audit logs. |
| **Staff** | Front-line: process orders, view customers, update inventory, generate invoices. No product management, no refunds, no analytics, no settings. |

### 2.3 Permission Matrix

| Permission Code | Owner | Admin | Manager | Staff |
|-----------------|:-----:|:-----:|:-------:|:-----:|
| `business.view` | ✅ | ✅ | ✅ | ❌ |
| `business.update` | ✅ | ✅ | ❌ | ❌ |
| `business.delete` | ✅ | ❌ | ❌ | ❌ |
| `billing.view` | ✅ | ✅ | ❌ | ❌ |
| `billing.update` | ✅ | ❌ | ❌ | ❌ |
| `product.view` | ✅ | ✅ | ✅ | ❌ |
| `product.create` | ✅ | ✅ | ✅ | ❌ |
| `product.update` | ✅ | ✅ | ✅ | ❌ |
| `product.delete` | ✅ | ✅ | ✅ | ❌ |
| `category.manage` | ✅ | ✅ | ✅ | ❌ |
| `inventory.view` | ✅ | ✅ | ✅ | ✅ |
| `inventory.update` | ✅ | ✅ | ✅ | ✅ |
| `order.view` | ✅ | ✅ | ✅ | ✅ |
| `order.create` | ✅ | ✅ | ✅ | ✅ |
| `order.update` | ✅ | ✅ | ✅ | ✅ |
| `order.cancel` | ✅ | ✅ | ✅ | ❌ |
| `customer.view` | ✅ | ✅ | ✅ | ✅ |
| `customer.create` | ✅ | ✅ | ✅ | ✅ |
| `customer.update` | ✅ | ✅ | ✅ | ❌ |
| `payment.view` | ✅ | ✅ | ✅ | ❌ |
| `payment.refund` | ✅ | ✅ | ❌ | ❌ |
| `invoice.view` | ✅ | ✅ | ✅ | ✅ |
| `invoice.create` | ✅ | ✅ | ✅ | ✅ |
| `invoice.send` | ✅ | ✅ | ✅ | ✅ |
| `storefront.manage` | ✅ | ✅ | ❌ | ❌ |
| `marketing.manage` | ✅ | ✅ | ✅ | ❌ |
| `analytics.view` | ✅ | ✅ | ✅ | ❌ |
| `staff.manage` | ✅ | ✅ | ❌ | ❌ |
| `role.manage` | ✅ | ✅ | ❌ | ❌ |
| `audit.view` | ✅ | ✅ | ❌ | ❌ |
| `security.view` | ✅ | ✅ | ❌ | ❌ |
| `security.settings` | ✅ | ❌ | ❌ | ❌ |

**Least-privilege principles:**
- Every route/service checks permissions against the resolved role.
- Manager and Staff roles are mutable per-business (Owner/Admin can tighten them); Owner is a fixed skeleton.
- The Owner role permissions cannot be revoked (prevents platform lockout).
- Staff cannot view: other business data, refund controls, analytics, financial reports, audit logs.

---

## 3. Feature Architecture

### 3.1 Module Breakdown

Every module is a vertical slice: API routes + services + UI pages + shared types.

| # | Module | Responsibility |
|---|--------|----------------|
| 1 | **Public Website** | Marketing/landing pages, pricing, about, docs links. Purely presentational, links to signup. |
| 2 | **Authentication** | Signup, login, logout, password reset, email verification, 2FA, token lifecycle, session management. |
| 3 | **Business Onboarding** | Multi-step wizard to create a business (tenant), its store, and initial settings. |
| 4 | **Dashboard** | Daily operational overview: KPIs, recent orders, low stock, sales trend. |
| 5 | **Products** | Product CRUD, variants, media, GST metadata, status, duplicate, bulk import/export. |
| 6 | **Categories** | Hierarchical category tree, assignment to products. |
| 7 | **Inventory** | Stock levels per product, reservations, movements ledger, low-stock alerts, adjustments. |
| 8 | **Orders** | Order lifecycle (pending → processing → shipped → delivered / cancelled / refunded), manual order creation, fulfillment tracking. |
| 9 | **Customers** | Customer records, contact info, addresses, order history, internal notes. |
| 10 | **Payments** | Payment capture via Razorpay, payment list, refunds, webhook reconciliation. |
| 11 | **Invoices** | GST-compliant invoice generation, PDF export, email delivery, numbering series. |
| 12 | **Storefront** | Public-facing store, builder (theme, sections), preview, publish/unpublish, product pages, cart, checkout. |
| 13 | **Marketing** | Campaigns, discount codes, social links. |
| 14 | **Analytics** | KPIs, revenue/order charts, top products/customers, export. |
| 15 | **Staff Management** | Staff invite, role assignment, suspend/remove, member list. |
| 16 | **Settings** | Business profile, store settings, billing, tax config, notification preferences. |
| 17 | **Security Center** | Security score, password, 2FA, sessions, API keys. |
| 18 | **Audit Logs** | Immutable event log of all significant actions per tenant. |

### 3.2 Cross-Cutting Concerns

| Concern | Where It Lives |
|---------|----------------|
| RBAC | `permissions` middleware in Fastify; permission-aware UI in Next.js |
| Multi-tenancy | Tenant resolver middleware + RLS + tenant-scoped repositories |
| Audit logging | Audit service, called by every mutating service |
| Notifications | Notification service: in-app (dashboard bell) + email (SendGrid) |
| Rate limiting | Redis-backed Fastify plugin |
| Validation | JSON Schema (Fastify) + Zod (shared/frontend) |

---

## 4. Information Architecture

### 4.1 Sitemap

```
/                         → Landing page
/pricing                  → Pricing page
/about                    → About page
/login                    → Login
/signup                   → Sign up
/forgot-password          → Forgot password
/onboarding               → Business onboarding wizard (auth required)

/s/[slug]                 → Public storefront (customer-facing)
/s/[slug]/p/[productSlug] → Product detail page
/s/[slug]/cart            → Cart
/s/[slug]/checkout        → Checkout

/dashboard                 → Authenticated app (requires tenant)
/dashboard                 → Overview KPIs
/dashboard/products        → Products list
/dashboard/products/new    → Add product
/dashboard/products/[id]   → Edit product
/dashboard/categories      → Categories (page)
/dashboard/inventory       → Inventory list
/dashboard/inventory/[id]  → Inventory details (drawer)
/dashboard/orders          → Orders list
/dashboard/orders/[id]     → Order details
/dashboard/customers       → Customers list
/dashboard/customers/[id]  → Customer details
/dashboard/payments        → Payments list
/dashboard/invoices        → Invoices list
/dashboard/storefront      → Storefront builder
/dashboard/storefront/preview → Storefront preview (full-screen)
/dashboard/marketing       → Marketing dashboard
/dashboard/analytics       → Analytics dashboard
/dashboard/staff           → Staff list
/dashboard/roles           → Roles & permissions
/dashboard/settings        → Settings (tabbed)
/dashboard/security        → Security center (tabbed)
/dashboard/audit-logs      → Audit logs
```

### 4.2 Navigation Grouping

Navigation items are grouped to reduce cognitive load:

| Group | Items |
|-------|-------|
| **Overview** | Dashboard |
| **Commerce** | Products, Categories, Inventory, Orders, Customers |
| **Money** | Payments, Invoices |
| **Growth** | Storefront, Marketing, Analytics |
| **Administration** | Staff, Roles, Settings, Security, Audit Logs |

Menu items are filtered by role — Staff only sees Dashboard, Products (view-only), Inventory, Orders, Customers (view), Invoices.

---

## 5. Application Navigation

### 5.1 Authenticated App Shell (Desktop)

```
┌──────────┬──────────────────────────────────────────────────┐
│ Sidebar  │  Top Navigation Bar                               │
│ 240px    │  ┌──────────────────────────────────────────────┐ │
│ fixed    │  │ ⇕ [Global Search ...]   🔔 (3)   [Avatar ▾]  │ │
│          │  └──────────────────────────────────────────────┘ │
│ [Logo]   │                                                   │
│ [Biz      │  Breadcrumb:  Commerce / Products                │
│  Switch▾]│  ┌──────────────────────────────────────────────┐ │
│          │  │ Page Title                [+ Add Product]    │ │
│ OVERVIEW │  │ Subtitle context          [Import] [Export]  │ │
│  Dashboard│ └──────────────────────────────────────────────┘ │
│ COMMERCE  │                                                   │
│  Products │                                                   │
│  Categories│              Main Content Area                   │
│  Inventory│              (scrollable, 1920 max-width)        │
│  Orders   │                                                   │
│  Customers│                                                   │
│ MONEY    │                                                   │
│  Payments │                                                   │
│  Invoices │                                                   │
│ GROWTH   │                                                   │
│  Storefront│                                                  │
│  Marketing│                                                   │
│  Analytics│                                                   │
│ ADMIN    │                                                   │
│  Staff    │                                                   │
│  Roles    │                                                   │
│  Settings │                                                   │
│  Security │                                                   │
│  Audit Logs│                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

**Sidebar behavior:**
- Fixed width 240px; collapses to 64px icon-only on screens < 1200px.
- Active item: `--bs-primary-soft` background, `--bs-primary` text, 3px left indicator bar.
- Business switcher dropdown shows all memberships with ✓ on the active one.
- Collapse toggle button at bottom for power users.

**Top navigation bar:**
- 56px height, white surface, bottom border. Sticky.
- Global search input (center), keyboard shortcut `Cmd/Ctrl+K`.
- Notifications bell with unread count badge; dropdown panel with time-grouped items.
- User avatar → dropdown: Profile, Switch Business, Settings, Security, Sign out.

**Breadcrumbs:**
- Shown under the top bar on non-dashboard pages: `Commerce / Products / Add Product`.
- Trail is clickable; last item is the current page (non-link).

### 5.2 Responsive / Mobile Navigation

- **Small screens (< 768px):** sidebar hidden; hamburger button in top bar opens a full-height slide-in drawer with the same nav tree. Footer of drawer shows business switcher + sign out.
- **Bottom tab bar (mobile):** 4 primary destinations — Dashboard, Orders, Products, and a Menu button that opens the drawer. Only for Staff/Manager: tab set is role-aware.
- **Page actions:** primary actions collapse into a floating action button or a sticky bottom action bar.
- **Tables:** horizontal scroll with sticky first column (product name / order number).
- **Modals:** become bottom sheets; **drawers** become full-screen panels.

### 5.3 Page Header Pattern

Every module page uses one consistent header component:

```
┌────────────────────────────────────────────────────────────┐
│  Page Title (H1)                        [Primary Action]    │
│  Contextual subtitle · entity count      [Secondary] [⋯]    │
└────────────────────────────────────────────────────────────┘
```

- Title with optional back button (`←` on detail pages).
- Subtitle: short context sentence plus live entity count where relevant.
- Action area: primary action (filled) on the right, secondary (outline/ghost), overflow menu (⋯) for the rest.

### 5.4 Global Search

- `Cmd/Ctrl+K` opens a centered command palette (copy of Stripe/Linear pattern behavior).
- Searches across: Products, Orders (by number/customer), Customers, Invoices (by number).
- Results grouped by type with icons; keyboard navigable (↑↓ + Enter); "View all" links per group.
- Search runs against the API with debounce (250 ms) and is tenant-scoped server-side.

### 5.5 Notifications

- Bell with unread badge (max shows 99+).
- Panel lists recent notifications grouped by day: new orders, low stock, payment events, staff invites, security alerts.
- Actions on notifications: mark read, mark all read, navigate to entity.
- New-order notifications persisted to DB (`notifications` table), polled/streamed on dashboard load; real-time via SSE (Postgres LISTEN on `orders_insert`).

---

## 6. UI/UX Design System

### 6.1 Visual Identity

Original BharatStore identity — a modern Indian commerce brand. Indigo is the primary (evoking trust, digital commerce, night sky of the digital economy) and saffron as the warm accent (contemporary nod to the tricolor, energy, growth). The identity is clean, geometric, and premium — never a literal flag motif.

**Brand mark:** a geometric "B" formed from a storefront awning shape — communicates market + commerce.

| Element | Specification |
|---------|---------------|
| Primary brand color | Indigo `#6C4DF6` |
| Secondary brand accent | Saffron `#F59E0B` |
| Wordmark font | Inter 700, dark text on light |
| Logo variants | Full (mark + wordmark), mark-only (favicon/app icon) |

### 6.2 Design Tokens (globals.css :root)

```css
:root {
  /* Brand */
  --bs-primary: #6C4DF6;
  --bs-primary-hover: #5A3CE0;
  --bs-primary-active: #4A2FD1;
  --bs-primary-soft: #EEEAFF;

  --bs-secondary: #F59E0B;
  --bs-secondary-hover: #D97706;

  /* Semantic */
  --bs-success: #16A34A;
  --bs-success-bg: #ECFDF5;
  --bs-warning: #D97706;
  --bs-warning-bg: #FFFBEB;
  --bs-error: #DC2626;
  --bs-error-bg: #FEF2F2;
  --bs-info: #2563EB;
  --bs-info-bg: #EFF6FF;

  /* Backgrounds & surfaces */
  --bs-bg: #FAFAFA;          /* page background */
  --bs-surface: #FFFFFF;     /* cards, modals, tables */
  --bs-surface-hover: #F9FAFB;
  --bs-surface-muted: #F3F4F6;

  /* Borders */
  --bs-border: #E5E7EB;
  --bs-border-strong: #D1D5DB;
  --bs-border-focus: #6C4DF6;

  /* Text */
  --bs-text: #111827;
  --bs-text-secondary: #6B7280;
  --bs-text-muted: #9CA3AF;
  --bs-text-on-primary: #FFFFFF;

  /* Radius */
  --bs-radius-sm: 6px;
  --bs-radius-md: 8px;
  --bs-radius-lg: 12px;
  --bs-radius-xl: 16px;
  --bs-radius-full: 999px;

  /* Shadows */
  --bs-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --bs-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --bs-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --bs-shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

  /* Spacing (4px base) */
  --bs-space-1: 4px;
  --bs-space-2: 8px;
  --bs-space-3: 12px;
  --bs-space-4: 16px;
  --bs-space-6: 24px;
  --bs-space-8: 32px;
  --bs-space-12: 48px;
  --bs-space-16: 64px;
  --bs-space-24: 96px;
}
```

### 6.3 Typography

**Family:** Inter (400, 500, 600, 700). Fallbacks: `-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.

| Level | Size | Weight | Line-height | Used for |
|-------|------|--------|-------------|----------|
| Display | 48px | 700 | 1.1 | Landing hero |
| H1 | 36px | 700 | 1.2 | Page titles |
| H2 | 30px | 700 | 1.25 | Section headers |
| H3 | 24px | 600 | 1.3 | Card titles |
| H4 | 20px | 600 | 1.4 | Subsection titles |
| Body-large | 18px | 400 | 1.6 | Landing copy |
| Body | 16px | 400 | 1.6 | Body text |
| Body-small | 14px | 400 | 1.5 | Secondary text |
| Label | 13px | 500 | 1.4 | Form labels, buttons |
| Caption | 12px | 400 | 1.4 | Metadata, timestamps |
| Table-cell | 14px | 400 | 1.4 | Table cells |

Numerals: tabular figures (`font-variant-numeric: tabular-nums`) for money, stock, counts.

### 6.4 Spacing & Density

- Base unit: 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Page padding: 24px desktop, 16px mobile; max content width 1600px, centered.
- Cards: 16–24px internal padding; gaps between cards 16px.
- Form rows: 16px vertical gap; label–input gap 8px; inputs are 40px tall.
- Rows in tables: 44px (comfortable density for clicks).

### 6.5 Components

**Buttons**
| Variant | Style |
|---------|-------|
| Primary | `--bs-primary` bg, white text, radius-md, weight 500, 40px h, hover → primary-hover, active → primary-active |
| Secondary | white bg, `--bs-border` border, `--bs-text` text |
| Ghost | transparent, hover surface-muted |
| Destructive | `--bs-error` bg, white text |
| Outline | transparent, `--bs-primary` border + text |
| Link | text-only primary, underline on hover |
| Icon | 40x40, ghost-style, tooltip label |
| Loading | spinner replaces label; button disabled |

All buttons: focus-visible ring (2px primary / offset 2px), disabled state 50% opacity.

**Inputs**
| Element | Style |
|---------|-------|
| Text/email/password/select/textarea | white bg, `--bs-border` border, radius-md, 40px height, 12px horizontal padding, focus: 2px primary ring + primary border |
| Label | Label size, `--bs-text`, required `*` in error color |
| Helper | 12px secondary text below input |
| Error | `--bs-error` border + message under field |
| Checkbox/Radio | 16px, primary accent, focus ring |
| Search | pill shape (radius-full), search icon, clear ✕ |
| Upload | dashed border drop-zone, 96px thumbnails, drag active state |

**Cards**
- White surface, `--bs-border`, radius-lg, shadow-sm; padding 24px (16px compact).
- Stat card: label (caption, secondary) above large numeral (24px 600) with delta badge.
- Hover elevation only on interactive cards; never on passive containers.

**Tables**
- White surface inside bordered radius-lg container.
- Header: surface-muted bg, caption uppercase 12px secondary, 12px/16px padding.
- Rows: Table-cell 14px, row hover surface-hover; vertical border on right of sticky first column.
- Sort indicators, column resize optional, pagination footer (page numbers + per-page selector).
- Bulk selection: checkbox column; bulk action bar appears above table when selection > 0.

**Modals**
- Overlay `rgba(0,0,0,.5)`; content white, radius-xl, shadow-xl, max-w 560px.
- Header 24px padding (H4 + close ✕), body scrollable, footer 16px padding with right-aligned actions.
- Confirm dialogs: dedicated `ConfirmDialog` (destructive = primary destructive button).

**Drawers**
- Slide from right, `420px` desktop / full-width mobile. Header + scroll body + sticky footer.

**Badges**
- Pill, 12px label, 4px/8px padding, per-variant bg/text; optional leading dot.

**Alerts**
- Rounded-lg, tinted bg per variant, icon + title (600) + optional body, dismissible ×.

**Dropdowns (Menu)**
- White, radius-md, shadow-lg, min-w 200px; items 13px with icon; hover surface-muted; dividers; header/footer slots; closes on outside click or Esc.

**Tooltips**
- Dark `#111827` text-white 12px, radius-sm, shadow-md, arrow, 200ms delay.

**Content states**
| State | Pattern |
|-------|---------|
| Empty | Illustration (24px) + title (H3) + description (secondary 14px) + primary CTA; optional "Quick tips" box |
| Loading | Skeleton blocks matching final layout (never spinners alone) |
| Error | Alert variant error, retry button, guidance |
| Success | Toast (bottom-right, auto-dismiss 4s) |

### 6.6 Motion

- Durations: 150ms (micro), 250ms (standard), 300ms (drawers/modals).
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`.
- Allowed: page/route fade+slight translate (~8px), card hover elevation, skeleton shimmer, modal scale-in (0.96→1), drawer slide.
- Never: parallax, marquees, auto-playing carousels, decorative confetti.
- Respect `prefers-reduced-motion`: disable all non-essential animation.

---

## 7. Screen Architecture

### 7.1 Landing Page (`/`)

- **Layout:** full-bleed marketing page; sticky translucent top nav (white blur), centered content, max-width 1200px sections.
- **Sections:** hero (H1 Display, subhead 18px, primary CTA "Start free", secondary "See how it works", hero mockup graphic) → trust bar (stats: "10k+ sellers", "₹50Cr+ processed") → features grid (6 cards: Storefront, Inventory, Orders, GST Invoices, Payments, Analytics) → How it works (3 steps) → Product comparison strip → Pricing (3 tiers) → Testimonials → CTA banner → footer (product links, legal, contact).
- **Loading:** sections lazy-render as they scroll into view; no blocking load.
- **Mobile:** nav collapses to hamburger; sections stack; hero copy 24px.

### 7.2 Sign Up (`/signup`)

- **Layout:** centered card (max-w 400px) on brand-tinted background; brand mark top.
- **Sections:** headline "Start your business online", email, password (with strength meter — min 8 chars, letter + number), full name, "Create account".
- **Components:** inputs, show/hide password, primary button (spinner on submit), "Already have an account? Log in".
- **States:** inline field errors; top-level error alert on server failure; success → email-verification interstitial.
- **Mobile:** card goes edge-to-edge with 16px padding.

### 7.3 Login (`/login`)

- **Layout:** centered card (max-w 400px).
- **Sections:** email, password (show/hide), "Remember me" checkbox, "Forgot password?" link, submit.
- **2FA step:** if 2FA enabled, second step reveals 6-digit TOTP input.
- **States:** invalid credentials error alert; account-lockout warning with remaining wait; busy spinner.

### 7.4 Forgot Password (`/forgot-password`)

- **Layout:** centered card (max-w 400px).
- **Sections:** email input, "Send reset link". Success state swaps form → "Check your email" with icon + back to login.
- **Note:** password-reset endpoint is rate limited (5/hr per email).

### 7.5 Business Onboarding (`/onboarding`)

- **Layout:** wizard shell — step indicator (top, 5 dots), centered card max-w 640px, sticky footer with Back/Continue.
- **Steps:**
  1. **Business details** — name, type (retail/manufacturing/wholesale/handicraft/service), industry select, phone.
  2. **Address & tax** — address, city, state, pincode, GSTIN (optional, validated pattern `\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]`), PAN (optional).
  3. **Store details** — store name, URL slug (auto-generated, uniqueness check), tagline, default currency INR / language (default English, Hindi coming).
  4. **Category presets** — pick from industry-tagged starter categories (multi-select).
  5. **Review & complete** — summary card, "Create my business".
- **Post-completion:** creates Business + Store + membership (Owner) → redirects to `/dashboard` with welcome banner.

### 7.6 Dashboard (`/dashboard`)

- **Layout:** page header ("Dashboard" + date range context) + content grid.
- **KPIs row (4 stat cards):** Revenue today, Orders today, Total products, Low-stock count. Each card: value, delta vs yesterday, caption.
- **Charts row:** Revenue trend (line, 30d, range toggle 7/30/90), Orders bar chart.
- **Lists:** Recent orders (5, table), Low stock alerts (list with "Restock" action), Top products (by revenue, 5).
- **Empty state:** if zero products — welcome panel with 3-step quickstart ("Add products → Customize store → Share link").
- **Loading:** skeleton stat cards + skeleton table rows + skeleton chart.
- **Error:** error alert + retry.
- **Mobile:** stats stack in 2×2 grid; tables scroll; charts full-width.

### 7.7 Products (`/dashboard/products`)

- **Layout:** header + toolbar + table container.
- **Toolbar:** search input (name/SKU), category filter dropdown, status filter (Active/Draft/Archived), sort dropdown, bulk actions (export, delete) when selection.
- **Table columns:** checkbox | Image+Name | SKU | Category | Price (MRP struck-through, sale) | Stock (badge) | Status (badge) | Actions (⋯ menu: Edit, Duplicate, Archive/Delete).
- **Pagination:** 25/page default, page selector.
- **Empty state:** "No products yet" + "Add your first product".
- **Loading:** 10 skeleton rows.
- **Mobile:** cards instead of table (image, name, price, stock).

### 7.8 Add Product (`/dashboard/products/new`)

- **Layout:** form page, max-w 800px, header with Save actions.
- **Sections (grouped cards):**
  - **Basic info** — name*, description (textarea, markdown-lite), category select(s).
  - **Pricing** — MRP, selling price (auto % off hint), GST rate select (0/0.25/3/5/12/18/28), HSN code.
  - **Inventory** — SKU (auto-suggest), initial stock qty, reorder level, "track stock" toggle.
  - **Media** — image uploader (1–5, drag-drop, previews, reorder, delete). Uploads async to Firebase Storage; shows progress per image.
  - **Status** — Active / Draft radio.
- **Actions:** Cancel (ghost) + Save (primary); on save → validates → success toast → navigate to product list.
- **Error:** inline field errors; toast on API failure.

### 7.9 Edit Product (`/dashboard/products/[id]`)

- Identical structure to Add Product; prefilled. Header adds: status badge, "View storefront" link (if published), **Delete** (danger zone card at bottom with confirm dialog).

### 7.10 Categories (`/dashboard/categories`)

- **Layout:** two-column desktop (tree list 320px + detail), stacked mobile.
- **Tree:** nested, expandable, drag-to-reorder within parents.
- **Row actions:** rename (inline), add child, archive.
- **Add:** "Add category" button → inline form name + parent select.
- **Delete guards:** cannot delete category with products (soft-archive with counter).

### 7.11 Inventory (`/dashboard/inventory`)

- **Layout:** header + toolbar + table.
- **Toolbar:** search (product/SKU), status filter (In stock / Low / Out), category filter.
- **Table columns:** Product (image+name) | SKU | In stock | Reserved | Available | Reorder level | Status badge | Last updated | Action (Adjust → opens drawer).
- **Empty state:** "No inventory tracked."
- **Row click:** opens Inventory Details drawer.

### 7.12 Inventory Details (drawer `/dashboard/inventory/[id]`)

- **Drawer sections:** product summary (image, name, SKU, category) → current stock stat card → Reserved / On-order numbers → **Stock movement table** (date, type badge [purchase/sale/adjustment/order], qty ±, reference) → reorder level.
- **Actions:** "Adjust stock" (modal: quantity, reason select, note) → writes inventory_movement + audit.

### 7.13 Orders (`/dashboard/orders`)

- **Layout:** header (+ "Create order") + status tabs + toolbar + table.
- **Status tabs:** All / Pending / Processing / Shipped / Delivered / Cancelled / Refunded (counts as badges).
- **Table columns:** Order # | Date | Customer | Items (count) | Total | Payment (badge) | Fulfillment (badge) | Actions (⋯: view, print invoice, cancel).
- **Empty state:** "No orders yet" — CTA share store link or create manual order.
- **Mobile:** card list (order #, customer, total, status).

### 7.14 Order Details (`/dashboard/orders/[id]`)

- **Layout:** two-thirds main + one-third right rail; stacked mobile.
- **Main:** header (order #, status badges, back) → **Items table** (image, name, SKU, qty, unit price, GST, line total) → **Totals card** (subtotal, GST by rate, shipping, discount, grand total).
- **Right rail:** **Customer card** (name, email, phone, address, "View customer") → **Shipping card** (method, tracking #) → **Payment card** (method, status, Razorpay reference, refund link if eligible) → **Timeline** (status changes with user + timestamp).
- **Actions (header):** Mark processing → Mark shipped (modal: carrier + tracking #) → Mark delivered; Cancel (confirm); Create invoice / Send invoice.
- **Status transitions validated** server-side (cancelled/refunded are terminal).

### 7.15 Customers (`/dashboard/customers`)

- **Layout:** header (+ "Add customer") + toolbar + table.
- **Columns:** Name (+ avatar initials) | Email | Phone | Orders count | Total spent | Last order | Actions (⋯).
- **Empty state:** "No customers yet."
- **Row click:** customer details page.

### 7.16 Customer Details (`/dashboard/customers/[id]`)

- **Layout:** two-thirds main + one-third right rail.
- **Main:** header (name, avatar, edit) → **Order history** table (order #, date, total, status) → **Notes** (internal notes, add/edit).
- **Rail:** contact card (email, phone, address, lifetime orders/spend), tags (future-ready), "Add order" quick action.

### 7.17 Payments (`/dashboard/payments`)

- **Layout:** header + toolbar + table.
- **Columns:** Date | Order # | Customer | Method | Amount | Status badge (Paid/Failed/Pending/Refunded) | Gateway ref | Actions.
- **Actions per row:** View payment, Refund (modal with amount + reason) — owners/admins only.
- **Empty state:** "No payments captured yet."

### 7.18 Invoices (`/dashboard/invoices`)

- **Layout:** header (+ "Generate invoice") + toolbar + table.
- **Columns:** Invoice # (series-yyyy-NNNN) | Order # | Customer | Amount | GST | Status (Draft/Sent/Paid/Overdue) | Date | Actions (⋯: view, download PDF, email).
- **Generation:** from order (items, GST, bill-to/ship-to, business GSTIN).
- **Empty state:** "No invoices yet."

### 7.19 Storefront Builder (`/dashboard/storefront`)

- **Layout:** app shell inside dashboard content. Split-pane editor.
  - **Left rail (config):** tabs — Theme (colors from curated brand palette binding to design tokens, font, logo, contact) · Sections (list: hero, featured, collections, about, contact — toggle, reorder, edit copy) · Settings (store name, tagline, SEO meta, social links).
  - **Center (preview):** live iframe of the storefront at current width (device toggle).
  - **Right rail (context):** quick help, publish status, links.
- **Actions (header):** Save, View preview (full-screen), **Publish / Unpublish** (primary).
- **Empty state:** first-time "Pick a starting theme" modal.

### 7.20 Storefront Preview (full-screen `/dashboard/storefront/preview`)

- Toolbar (fixed top): device toggle (desktop/tablet/mobile), refresh, "Open in new tab", close.
- Iframe preview of `/s/[slug]?preview=1` (draft redux enabled via query guard).

### 7.21 Marketing (`/dashboard/marketing`)

- **Layout:** two-column: campaigns (left) + discounts & social (right stack).
- **Campaign cards:** name, type badge, status (Draft/Sent/Scheduled), audience summary, send date, results (opens/orders if run).
- **Discounts card:** coupon list (code, %/₹, expiry, usage), "Add coupon" modal.
- **Social links card:** edit Instagram/Facebook/WhatsApp links shown on storefront.
- **Empty state:** "Launch your first campaign."

### 7.22 Analytics (`/dashboard/analytics`)

- **Layout:** header (range selector 7/30/90/custom + Export CSV) + content.
- **KPI row:** Revenue, Orders, Avg order value, Conversion rate (storefront visitors→orders).
- **Charts:** Revenue trend (line), Orders by day (bar), Top products (table, revenue/units), Customer growth (area), Payment method split (donut).
- **Empty state:** "No data — add products and get orders."
- **Loading:** skeleton chart blocks.

### 7.23 Staff Management (`/dashboard/staff`)

- **Layout:** header (+ "Invite staff") + table.
- **Columns:** Avatar+Name | Email | Role badge | Status (active/invited/suspended) | Last active | Actions (⋯: edit role, suspend/activate, remove).
- **Invite modal:** email, role select (Admin/Manager/Staff), message; sends invite email with token (expires 7 days).
- **Empty state:** "Invite your first teammate" — explains roles.

### 7.24 Roles & Permissions (`/dashboard/roles`)

- **Layout:** left role list (Owner/Admin/Manager/Staff cards with descriptions) + right permission table.
- **Permission table:** permission code rows with toggle per mutable role. Owner row locked (lock icon + tooltip "Owner has full access").
- **Actions:** "Save changes" (reverts are manual), unsaved-changes warning on nav.
- **Note:** changing permissions affects live session permissions on next token refresh.

### 7.25 Settings (`/dashboard/settings`)

- **Layout:** left tab nav + right content card.
- **Tabs:** General (business name, logo upload, industry, phone) · Store (name, slug, description, default currency/language, timezone) · Tax (GSTIN, state of registration, default HSN map) · Notifications (email/SMS toggles per event type) · Billing (plan card, Razorpay subscription manage, invoices history).
- Each tab: independent form with Save; dirty-state confirm on tab switch.

### 7.26 Security Center (`/dashboard/security`)

- **Layout:** tabbed page.
- **Overview tab:** security score ring (auto-computed: 2FA on, sessions ≤ threshold, recent events, password age), checklist card.
- **Password tab:** change-password form (current, new, confirm; reuse prevention).
- **Two-factor tab:** enable → QR (TOTP) → confirmation code; disable requires password. Recovery codes shown once on enable.
- **Sessions tab:** table (device, browser, IP/geo, last active, current badge, Revoke). "Revoke all other sessions."
- **API keys tab:** list key (name, prefix…, created, last used), create (shows full key once), revoke. Scopes: full/read-only.
- **Permissions:** security settings require `security.settings`.

### 7.27 Audit Logs (`/dashboard/audit-logs`)

- **Layout:** header + toolbar (user filter, action filter, resource filter, date range) + table.
- **Columns:** Timestamp | Actor (avatar+name, or "system") | Action (badge) | Resource (type + id) | Details (collapsible JSON diff) | IP.
- **Empty state:** "No activity recorded yet."
- **Export:** CSV export (respects filters, row limit 50k).

---

## 8. User Flows

### 8.1 New Business Registration → Published Store

```
Landing → Sign up → verify email
  → Onboarding wizard (business → address/GST → store → categories → review)
  → Dashboard (welcome empty state)
  → Add category → Add first product (with images)
  → Storefront builder → select theme → customize → Publish
  → Share /s/[slug] link
```
**Exit criteria:** storefront URL returns a live store with products; dashboard shows product count > 0.

### 8.2 Receive Order → Fulfill → Invoice → Inventory

```
Customer carts → checkout → Razorpay payment (UPI/card) → webhook marks order paid
  → Merchant notified (bell + email)
  → Mark processing → inventory reserved
  → Print/attach label → Mark shipped (+ tracking)
  → Mark delivered → prompt: "Generate invoice?"
  → Invoice generated (GST) → inventory decremented on fulfillment
  → Customer emailed invoice PDF
```
**Exit criteria:** order timeline shows paid → shipped → delivered; invoice downloadable; stock reduced.

### 8.3 Add Product (full)

```
Products → Add product
  → fill basic/pricing/inventory/media
  → uploads async to Firebase (progress shown)
  → Save → success toast → row in list
```
**Exit criteria:** product visible in list, storefront (if published), and inventory.

### 8.4 Staff Invitation → Role Assignment → First Login

```
Staff → Invite (email + role)
  → invite token stored (7d expiry)
  → email sent (SendGrid template)
  → invitee clicks link → creates account (or signs in if exists)
  → membership created with role
  → invitee logs in → JWT carries role permissions
  → UI renders only permitted modules; guarded API rejects non-permitted calls (403)
```
**Exit criteria:** staff can log in and sees only permitted nav; API tests confirm 403 on forbidden routes.

### 8.5 Login → Tenant Resolution → Authorization → Dashboard

```
Login (email/password → optional 2FA)
  → verify credentials (bcrypt) → rate-limit checks
  → resolve memberships; select active business
  → issue access JWT (sub, tenantId, role, permissions) + refresh cookie
  → client calls /dashboard
  → middleware: valid token? → tenant claims extracted → RLS context set
  → dashboard service queries tenant-scoped rows → render
```
**Exit criteria:** dashboard data belongs to active tenant; switching business reissues claims.

### 8.6 Payment Reconciliation (Razorpay webhook)

```
Razorpay webhook POST → verify signature (secret)
  → verify tenant (webhook handler never trusts body tenantId alone vs order record)
  → update payment status + order payment_status
  → notify merchant → append security/audit event
  → idempotent (event_id stored; duplicates ignored)
```
**Exit criteria:** payment status transitions once; retried webhooks do not double-process.

---

## 9. Technical Architecture

### 9.1 System Context Diagram

```
┌──────────────────────── CLIENT (Next.js monolith — Vercel) ────────────────────────┐
│                                                                                    │
│  Public Website /r       Dashboard (auth shell)            Storefront /s/[slug]    │
│  ───────────────        ─────────────────────             ────────────────────    │
│  Marketing pages        Products, Orders, ...             Customer storefront,    │
│  (SSR/ISR)              Server Components +               cart, checkout           │
│                         Server Actions                    (SSR, ISR per slug)     │
│                                                                                    │
│  ─────────────────────────── shared design system, auth client ────────────────   │
└───────────────────────────────┬────────────────────────────────────────────────────┘
                                │ HTTPS /api/* (Bearer JWT cookie)
                                ▼
┌──────────────────────── API (Fastify — Railway) ───────────────────────────────────┐
│                                                                                    │
│  plugins: helmet · fastify-rate-limit(Redis) · auth(verify JWT)                    │
│           tenant-resolver(business_id→RLS ctx) · rbac(permission map)              │
│           multipart upload · error-handler(sentry)                                 │
│                                                                                    │
│  routes/  per-module routers → JSON Schema validation                              │
│  services/ business logic (transactions, idempotency, audit calls)                 │
│  db/      Drizzle ORM repositories (tenant-scoped) | migrations | seeds            │
│  jobs/    BullMQ workers (email, invoice pdf, analytics rollups, webhook retry)     │
│  lib/     email(SendGrid) · payments(Razorpay) · storage(Firebase) · tax(GST calc)  │
│                                                                                    │
└─────────────┬──────────────────────────────┬────────────────────────────┬──────────┘
              │                             │                            │
        ┌─────▼─────┐                ┌──────▼──────┐           ┌─────────▼──────────┐
        │ PostgreSQL │               │    Redis     │           │  External Services │
        │ (Railway,  │               │ sessions·rate│           │  Razorpay ·        │
        │  RLS,      │               │ queues·cache │           │  SendGrid ·        │
        │  backups)  │               └──────────────┘           │  Firebase Storage  │
        └────────────┘                                           └────────────────────┘
```

### 9.2 Request/Response Lifecycle

1. **Client → Next.js:** user action fires a Server Action or calls the API via `lib/api-client`.
2. **Next.js → Fastify:** `fetch` to `/api/*` with credentials (httpOnly cookie) or bearer token. Server-side fetches reuse connection pool.
3. **Fastify pipeline (plugins order matters):**
   - `helmet` (secure headers) → `fastify-rate-limit` (Redis sliding window, per-IP + per-user keys) → **auth** (verify JWT; attach `request.user`) → **tenant-resolver** (set `request.tenantId`, set RLS `app.current_tenant`) → **rbac** (route permission map; 403 on deny).
4. **Route handler:** JSON-Schema validates body/query/params → calls service.
5. **Service layer:** business logic in DB transaction; enforces idempotency keys where needed; writes audit_log within same transaction where practical; emits domain events (BullMQ) for side effects (emails, rollups).
6. **Repository (Drizzle):** every query literally includes `business_id = request.tenantId` filter; RLS is the safety net.
7. **Response:** typed JSON; errors flow through centralized error handler (consistent `{ error: { code, message, fieldErrors? } }` shape; Sentry capture for 5xx).

### 9.3 Real-time Updates

- **Order/payment events:** Postgres `LISTEN/NOTIFY` → Fastify backfills → SSE stream to dashboard (dashboard-only; auth guarded).
- Storefront orders update in real time; no external socket yet (scope-guarded — sockets deferred until needed).

### 9.4 Background Jobs (BullMQ)

| Queue | Jobs | Rate |
|-------|------|------|
| `email` | verification, reset, invoice, invite, order alerts | high |
| `invoice` | PDF generation via headless render, upload, attach | medium |
| `analytics` | hourly revenue rollups per tenant | scheduled |
| `webhooks` | Razorpay delivery retry w/ exponential backoff | medium |

Workers run in a separate Fastify process on Railway (worker instance) so API stays responsive.

### 9.5 Technology Decisions & Rationale

| Layer | Choice | Why (not just popularity) |
|-------|--------|---------------------------|
| Frontend | **Next.js 14/15 (App Router, React Server Components)** | Server components eliminate client waterfalls for data-heavy dashboards; SSR/ISR serves storefront SEO-critical pages; one codebase covers landing, dashboard, storefront; Vercel deploy is trivial; excellent TS + AI-assist ergonomics. |
| UI | **Tailwind CSS + shadcn/ui primitives** | Utility-first tokens map 1:1 to our design-token CSS variables; shadcn components are local, owned, accessible, and openable for customization — no black-box UI kit. |
| Client state | **Zustand** (cart, session store) | Minimal, no boilerplate; only used where RSC/server actions can't serve the data. |
| Backend | **Fastify** | Breadth of built-in JSON-Schema validation, plugin system matches our middleware needs, and per-request `request` object flows map to our auth/tenant/rbac pipeline. Faster than Express with identical ergonomics. |
| ORM | **Drizzle** | TypeScript-first, SQL-like, supports Postgres-specific features (RLS, JSONB, partial indexes), lightweight, migration tooling built-in. Good fit for AI-assisted dev (predictable, typed schema). |
| Database | **PostgreSQL** | Row-level security is the linchpin of tenant isolation; JSONB for settings/variants; mature, free, managed anywhere. Real relational integrity for money data (unlike Mongo). |
| Cache/queue | **Redis** (+ BullMQ) | Fast session store, rate-limit counters, and a resilient job queue from one service. Railway offers a $0 teir; cheap to run. |
| File storage | **Firebase Storage** | Generous free tier, CDN-backed URLs, bucket security rules can enforce per-business path ACLs; simpler than IAM-heavy S3 for a student team. (Cloudflare R2 noted as swap-in later.) |
| Payments | **Razorpay** | Native UPI/UPI Lite, cards, netbanking, wallets for India; INR-native, GST-compliant checkout pages, test mode, webhooks, easy refunds. Stripe lacks UPI depth in India. |
| Email | **SendGrid** | Transactional templates, reliable INR-appropriate delivery, generous free tier, webhook status. |
| Auth | **Custom (bcrypt + JWT + rotating refresh)** | Full control over tenant-claim injection & RBAC claims; no vendor lock-in; teaches core security; cheaper at scale. Auth.js/Clerk abstract the layers we need to *own* (tenant scoping). |
| Deployment | **Vercel** (web) + **Railway** (api, worker, Postgres, Redis) | Vercel: managed Next.js, preview deploys for PRs, edge caching for storefront. Railway: single-command services, managed Postgres w/ daily backups, affordable. |
| Observability | **Sentry** (errors) + **Logtail/OpenTelemetry** (logs) + **Uptime Robot** (synthetic) | Error capture + structured logging for audit & debugging at low ops cost. |
| Language | **TypeScript everywhere** | Shared types across web/api via `@bharatstore/shared`; catches contract drift between frontend and backend; strongest AI-assist ecosystem. |

### 9.6 Development Environment

- `docker-compose.yml` for local Postgres + Redis (exact production images).
- `turbo` for monorepo task orchestration (dev/build/test/typecheck).
- Env via `.env.*` files + `zod`-validated config (`@bharatstore/config`).
- `changesets` for versioning shared packages (not strictly needed for internal monorepo — omitted; keep simple).
- CI: GitHub Actions — lint, typecheck, unit/integration tests, build; Playwright smoke on preview deploy.

---

## 10. Multi-Tenant Architecture

### 10.1 Model

- Each **Business** is a tenant. Tenant-owned rows all carry `business_id`.
- A global **User** table; membership via `business_members` (join: user × business × role, unique constraint).
- One **Owner** membership per business (invariant enforced in service + DB trigger).

### 10.2 Tenant Identification & Resolution

1. Login resolves the user's memberships.
2. Active business selected (or default first). JWT embeds `tenantId` (and role + permissions snapshot).
3. Every authenticated request carries the JWT; the server reads `tenantId` **from the verified token, never from body/query/params**.
4. Business-switch endpoint re-issues a JWT scoped to the new tenant (client stores selected business in refresh-session too).
5. Token claims are short-lived (15 min access) so role/permission changes take effect quickly; refresh re-reads role from DB.

### 10.3 Database Isolation (defense in depth)

**Layer 1 — Repository:** every Drizzle query filter includes `business_id = req.tenantId`. Enforced by repository helper (`defaultTenantScope()`).

**Layer 2 — Row Level Security:** added to every tenant table via migration:

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON products
  USING (business_id = current_setting('app.current_tenant')::uuid);
```

- Fastify onRequest sets `SET LOCAL app.current_tenant = $1` inside the transaction context (never leaks between requests).
- **Layer 3 — service assertions:** cross-entity operations (e.g., order → customer) validate the referenced entity belongs to the same tenant before touching it.

### 10.4 Preventing Cross-Tenant Leakage

| Risk | Mitigation |
|------|-----------|
| User tampers with `tenantId` | tenantId from verified JWT only; no body/param trust |
| Member of A calls B's API | JWT tenantId is B-independent; every query tenant-scoped; RLS enforces even if a bug hints otherwise |
| Generic admin bypass | No super-admin role in MVP; direct DB is the only cross-tenant surface, restricted to deployer |
| Reference/id confusion | All tenant entities use UUID PKs; cross-entity tenant check enforced in service |
| Cache bleed | Redis key prefix `t:<tenantId>:` everywhere |
| File access | Firebase path `businesses/{businessId}/...`, write-Auth via per-tenant upload token (short-lived signed upload URL) |
| Background jobs | Job payload carries tenantId; service layer re-wraps in same tenant-scoped context |
| Webhook confusion | Webhook ↔ order validated by order.business_id, not body tenant |
| Backup restore | Restores are whole-DB (all tenants); per-tenant restore out of scope MVP |

### 10.5 Authorization inside a tenant

- RBAC resolved at login → embedded in JWT as permission codes.
- **Guard at route layer** (`rbac` plugin: route-permission map) → 403.
- **Guard at service layer** again (defense in depth; e.g., background jobs re-evaluate).
- Owner/Admin can edit Manager & Staff role permissions per business (from Roles & Permissions screen); Owner row immutable.

---

## 11. Database Entity Model

### 11.1 Global Tables (non-tenant)

**users**
`id uuid PK · email citext UNIQUE · phone text · name text · password_hash text · status (unverified/active/suspended) · mfa_secret text? · created_at · updated_at`

**roles**
`id uuid PK · code text UNIQUE (owner/admin/manager/staff) · name text · description text · is_system bool`

**permissions**
`id uuid PK · code text UNIQUE · module text · description text`

**role_permissions**
`role_id FK · permission_id FK · PK(role_id, permission_id)`

**memberships** (business_members)
`id uuid PK · user_id FK · business_id FK · role_id FK · status (active/invited/suspended) · invited_by FK · invite_token text? · invite_expires_at · last_active_at · PK-adjacent UNIQUE(user_id, business_id)`

### 11.2 Tenant Tables (all carry `business_id`, RLS on)

**businesses** (tenant root)
`id uuid PK · slug citext UNIQUE · name · type · industry · email · phone · gstin? · pan? · address_line · city · state · pincode · status (trial/active/suspended) · plan (free/pro/business) · settings jsonb · created_at · updated_at`

**stores**
`id uuid PK · business_id FK · name · slug citext UNIQUE · tagline · description · logo_url · theme jsonb (colors/font/sections) · currency (INR default) · language (en default) · is_published bool · meta_title · meta_description · social jsonb · created_at · updated_at`

**categories**
`id uuid PK · business_id FK · parent_id FK? (self) · name · slug · description? · sort_order int · is_archived bool · timestamps`

**products**
`id uuid PK · business_id FK · category_id FK? · name · slug · description text? · mrp numeric(12,2) · price numeric(12,2) · gst_rate numeric(5,2) · hsn_code text? · sku text · status (draft/active/archived) · images jsonb (array of {url, order}) · is_tracked bool (stock tracking toggle) · variants jsonb? (future) · created_at · updated_at`

**inventory**
`id uuid PK · business_id FK · product_id FK UNIQUE · quantity int · reserved int · reorder_level int · updated_at`

**inventory_movements**
`id uuid PK · business_id FK · inventory_id FK · product_id FK · type (purchase/sale/adjustment/order_cancel/fulfillment) · quantity int (signed) · reference_type text? (order/invoice/adjustment) · reference_id uuid? · note text? · actor_id FK · created_at`

**customers**
`id uuid PK · business_id FK · name · email citext? · phone text? · address jsonb? · notes text? · created_at · updated_at`

**orders**
`id uuid PK · business_id FK · order_number text UNIQUE(per business) · customer_id FK? · status (pending/processing/shipped/delivered/cancelled/refunded) · payment_status (unpaid/paid/refunded/failed) · subtotal · discount · gst_amount · shipping_amount · total · currency · shipping_address jsonb · shipping_method text? · tracking_number text? · notes text? · placed_by_type (storefront/manual/import) · placed_by_id FK? · created_at · updated_at`

**order_items**
`id uuid PK · business_id FK · order_id FK · product_id FK? (nullable on delete) · sku_snapshot · name_snapshot · unit_price · gst_rate · quantity · line_total`

**payments**
`id uuid PK · business_id FK · order_id FK · method (upi/card/netbanking/wallet/cod/manual) · amount · currency · gateway · gateway_ref · status (initiated/paid/failed/refunded) · refund_amount · refund_reason · raw_webhook jsonb? · created_at · updated_at`

**invoices**
`id uuid PK · business_id FK · order_id FK UNIQUE · invoice_number text · series text · amount · gst_amount · status (draft/sent/paid/overdue/cancelled) · pdf_url · issued_at · due_at · created_at · updated_at`

**campaigns**
`id uuid PK · business_id FK · name · type (email/announcement/coupon) · status (draft/scheduled/sent) · audience jsonb? · send_at · results jsonb? · created_at · updated_at`

**coupons**
`id uuid PK · business_id FK · code text UNIQUE · discount_type (percent/fixed) · discount_value · min_order_value? · max_discount? · valid_from · valid_until · usage_limit · used_count`

**audit_logs**
`id uuid PK · business_id FK (nullable for platform-level) · user_id FK? · action text · module text · resource_type text · resource_id urn text? · before jsonb? · after jsonb? · ip inet · user_agent text · created_at (indexed)`

**security_events**
`id uuid PK · business_id FK? · user_id FK? · type (failed_login/lockout/suspicious_2fa/revoke_flow/impossible_travel/new_device) · severity (info/warning/critical) · message · ip inet · metadata jsonb · created_at`

**notifications**
`id uuid PK · business_id FK · user_id FK (null = broadcast to role) · type · title · body · link text? · read_at? · created_at`

**sessions** (refresh-token store)
`id uuid PK · user_id FK · business_id FK · refresh_token_hash text UNIQUE · expires_at · ip inet · user_agent text · revoked_at? · replaced_by?`

**api_keys**
`id uuid PK · business_id FK · name · key_hash text UNIQUE · prefix text (display) · scope (full/readonly) · created_by FK · created_at · last_used`

**refresh/verify tokens** covered by dedicated tables or a single `auth_tokens` table (`type`, `token_hash`, `expires_at`).

### 11.3 Key Relationships

- `businesses 1─N` products/categories/customers/orders/payments/invoices/stores(1)/campaigns/coupons/audit_logs/notifications/api_keys
- `businesses N─M users` via `memberships`
- `orders 1─N order_items`; `order_items N─1 products` (nullable)
- `orders N─1 customers`; `orders 1─1 invoices`; `orders 1─N payments`
- `products 1─1 inventory`; `inventory 1─N inventory_movements`
- `categories N─1 categories` (parent)

### 11.4 Integrity & Indexes

- Indexes: `business_id` on every tenant table (composite with the main query column, e.g., `(business_id, status)`), `order_number`, `invoice_number`, `product.sku`, `coupon.code`, `audit_logs(created_at)`.
- FK `ON DELETE`: tenant-root cascade for children; `product_id` in order_items `SET NULL` with snapshot columns so history survives product deletion.
- Money as `numeric(12,2)`; timestamps `timestamptz`.

---

## 12. API Architecture

### 12.1 Conventions

- Base: `/api/v1`. JSON. Errors: `{ error: { code, message, fieldErrors?, requestId } }`.
- Auth: `Authorization: Bearer <access>` or httpOnly cookie; webhooks use shared-secret signature headers.
- Pagination: `?page=1&per_page=25` → `{ data, meta: { page, perPage, total, totalPages } }`.
- Filtering: `?status=active&categoryId=...` (whitelisted per route).
- Idempotency: payment/invoice/token endpoints accept `Idempotency-Key`.
- Audit: mutating endpoints write audit_log automatically via service.

### 12.2 Endpoints by Module

**auth**
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/signup` | Create user (email verification token sent) |
| POST | `/auth/verify-email` | Verify email token |
| POST | `/auth/login` | Password login → tokens (+2FA step if enabled) |
| POST | `/auth/login/2fa` | Verify TOTP to complete login |
| POST | `/auth/refresh` | Rotate refresh token → new access token |
| POST | `/auth/logout` | Revoke session |
| POST | `/auth/forgot-password` | Send reset email (rate-limited) |
| POST | `/auth/reset-password` | Reset with token |
| POST | `/auth/2fa/setup` | Start 2FA (returns secret + QR) |
| POST | `/auth/2fa/confirm` | Confirm TOTP & enable |
| POST | `/auth/2fa/disable` | Disable (requires password) |

**business**
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/businesses` | Create business (onboarding finish) |
| GET | `/businesses/me` | Current business profile + counts |
| PATCH | `/businesses/me` | Update business settings |
| GET | `/businesses/me/memberships` | List user's memberships (switcher) |
| POST | `/businesses/switch/:id` | Switch active business → reissue token |
| GET | `/businesses/me/store` | Store config (mirror of storefront module) |

**products**
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/products` | List w/ search, filters, pagination |
| POST | `/products` | Create |
| GET | `/products/:id` | Detail |
| PATCH | `/products/:id` | Update |
| DELETE | `/products/:id` | Archive/delete |
| POST | `/products/:id/duplicate` | Duplicate |
| POST | `/products/import` | CSV import (job) |
| GET | `/products/export` | CSV export |

**categories**
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/categories` | Tree list |
| POST | `/categories` | Create |
| PATCH | `/categories/:id` | Update (rename, reorder, parent) |
| POST | `/categories/:id/archive` | Archive (guarded) |

**inventory**
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/inventory` | List w/ status filter |
| GET | `/inventory/low-stock` | Low-stock alerts |
| GET | `/inventory/:productId` | Detail + movements |
| POST | `/inventory/:productId/adjust` | Adjust stock w/ reason |
| GET | `/inventory/:productId/movements` | Movement ledger |

**orders**
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/orders` | List w/ status tabs, search, pagination |
| POST | `/orders` | Create (manual) — runs stock reservation |
| GET | `/orders/:id` | Detail (+items, customer, payments) |
| PATCH | `/orders/:id` | Update notes/items (guard rails) |
| POST | `/orders/:id/status` | Transition fulfillment status (validated states) |
| POST | `/orders/:id/cancel` | Cancel (restock, refund flow if paid) |
| GET | `/orders` export | CSV export |

**customers**
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/customers` | List w/ search |
| POST | `/customers` | Create |
| GET | `/customers/:id` | Detail + order history + notes |
| PATCH | `/customers/:id` | Update |
| DELETE | `/customers/:id` | Delete (guarded if orders exist → archive) |

**payments**
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/payments` | List |
| GET | `/payments/:id` | Detail |
| POST | `/payments/orders/:id/charge` | Create Razorpay order → client checkout |
| POST | `/payments/capture` | Confirm after client-side success (verify signature) |
| POST | `/payments/:id/refund` | Refund via Razorpay |
| POST | `/payments/webhook` | Razorpay webhook (signature verified, idempotent) |

**invoices**
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/invoices` | List w/ filters |
| POST | `/invoices` | Generate from order (number series, PDF job) |
| GET | `/invoices/:id` | Detail |
| GET | `/invoices/:id/pdf` | Download PDF (storefront-safe signed link) |
| POST | `/invoices/:id/send` | Email invoice |
| PATCH | `/invoices/:id` | Mark paid/overdue/cancel |

**storefront (public + admin)**
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/storefront` | Admin: current config |
| PATCH | `/storefront` | Admin: update builder config |
| POST | `/storefront/publish` | Toggle publish |
| GET | `/storefront/themes` | Theme catalog |
| GET | `/public/s/:slug` | Storefront landing (SSR hits this via server) |
| GET | `/public/s/:slug/p/:productSlug` | Product detail |
| POST | `/public/orders` | Place storefront order (no auth; rate-limited, captcha-guarded) |

**marketing**
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/marketing/campaigns` | List |
| POST | `/marketing/campaigns` | Create draft |
| POST | `/marketing/campaigns/:id/send` | Send (email job) |
| GET | `/marketing/coupons` | List coupons |
| POST | `/marketing/coupons` | Create |
| PATCH | `/marketing/coupons/:id` | Update/deactivate |

**analytics**
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/analytics/overview` | KPI cards |
| GET | `/analytics/revenue` | Revenue series (?range) |
| GET | `/analytics/orders` | Order metrics |
| GET | `/analytics/products` | Top products |
| GET | `/analytics/customers` | Customer metrics (LTV, repeat) |
| GET | `/analytics/export` | CSV export (job) |

**staff & roles**
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/staff` | Members list |
| POST | `/staff/invite` | Send invite |
| POST | `/staff/invites/:token/accept` | Accept invite |
| PATCH | `/staff/:userId` | Change role / status |
| DELETE | `/staff/:userId` | Remove member |
| GET | `/roles` | Roles + permission map |
| PATCH | `/roles/:id` | Update role permissions |

**security**
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/security/overview` | Score, active sessions count, recent events |
| GET | `/security/sessions` | Session list |
| POST | `/security/sessions/:id/revoke` | Revoke session |
| POST | `/security/sessions/revoke-others` | Revoke all but current |
| GET | `/security/events` | Security events (filter) |
| GET | `/security/api-keys` | List keys |
| POST | `/security/api-keys` | Create (return once) |
| DELETE | `/security/api-keys/:id` | Revoke key |
| GET | `/audit-logs` | Audit log list (filters + export) |

### 12.3 Error codes

`AUTH_INVALID_CREDENTIALS` · `AUTH_LOCKED` · `TOKEN_EXPIRED` · `TOKEN_INVALID` · `RATE_LIMITED` · `FORBIDDEN` (403, no detail leak) · `TENANT_MISMATCH` · `NOT_FOUND` · `VALIDATION_ERROR` · `CONFLICT` (dup SKU/coupon) · `PAYMENT_FAILED` · `INSUFFICIENT_STOCK` · `INTERNAL` (5xx).

---

## 13. Security Architecture

### 13.1 Passwords

- bcrypt cost 12 (hash only; never reversible).
- Policy: min 8 chars, ≥1 letter & ≥1 number; strength meter; reuse prevention (compare against last 5).
- Password reset link single-use, 30 min TTL, rate limited.

### 13.2 Tokens & Sessions

- **Access:** JWT RS256 signed server-side, 15-min TTL. Claims: `sub, email, tenantId, role, permissions, jti, iat, exp`.
- **Refresh:** cryptographically random 256-bit; stored hashed (SHA-256) in `sessions`; 30-day TTL; rotation on use (old swapped atomically); reuse of revoked token → revoke whole family + security_event.
- Transport: web = httpOnly+secure+SameSite=Lax cookie; API clients = bearer header.
- Session revocation available per-session and globally.

### 13.3 Authentication

- Email + password (+ optional TOTP 2FA with recovery codes).
- Email verification required before business creation.
- Login rate limit: 5/min per IP, 10/min per user, lockout 15 min after 10 fails (per user).
- New-device / new-IP login triggers security_event + optional email alert (Owner setting).

### 13.4 Authorization & RBAC

- Route-level permission map (rbac plugin) + service-level re-check.
- Permissions snapshot in JWT; role changes effective ≤ token lifetime (15 min), forced earlier via `revoke sessions` action.
- Staff/Manager can't self-escalate; Owner immutable.

### 13.5 Tenant Isolation (recap)

- Verified-JWT-only tenant resolution; RLS + tenant-scoped repositories + cross-entity assertions; test suite includes explicit cross-tenant probes (must return 403/empty).

### 13.6 Input Validation & Injection

- Fastify JSON-Schema validation (out-of-the-box), Zod on shared/frontend boundary.
- Parameterized queries everywhere (Drizzle) — SQL injection-resistant by construction.
- XSS: React escaping default; user HTML never rendered raw (description renders as formatted text / sanitized markdown).

### 13.7 Rate Limiting

- Redis sliding window. Defaults: API 120 req/min/IP; auth endpoints 10/min; password reset 5/hr/email; public order placement 10/min/IP; storefront 60/min/IP.
- 429 responses include `Retry-After`.

### 13.8 Audit Logging

- All mutating actions log actor, action code, module, resource URN, before/after diff (on critical money/security), IP, UA, timestamp.
- Written in same transaction for money events; async for low-risk reads-not-needed.
- Never log: passwords, tokens, PII beyond names/addresses as needed for order history.

### 13.9 Suspicious Activity Detection

Rules (evaluated on demand + cron):
1. >5 failed logins in 10 min → `account_lockout`
2. Login from new country within <4h of last → `impossible_travel`
3. TOTP failure burst → `2fa_attack`
4. Refresh-token reuse → `token_reuse`
5. Bulk order rate > threshold → `abuse`
Each produces a `security_event`; Owner is notified for critical severities.

### 13.10 HTTP Security

- `helmet`: HSTS, CSP (tight `default-src 'self'`, storefront allows images/fonts from storage CDN), `X-Frame-Options DENY`, `X-Content-Type-Options nosniff`, `Referrer-Policy strict-origin-when-cross-origin`.
- CORS locked to `https://bharatstore.app` + *.vercel.app previews.
- COOP/CORP headers on auth pages.
- Uploaded media served with explicit content-type + `Content-Disposition` where PDF.

### 13.11 Secrets

- `.env` gitignored; `*.example.env` committed; production on Railway env vars; rotation runbook.
- Never client-side secrets; Razorpay key secret server-only; Firebase handled via signed URLs + upload tokens (no public config).

### 13.12 Backups & Recovery

- Railway Postgres: automatic daily backups, PITR during retention, manual snapshot before risky deploys.
- Weekly full + nightly incremental (Railway-managed); restore drill quarterly.
- Firebase Storage: platform-managed multi-region redundancy; export script monthly (tar + blob list).
- Recovery runbook in `docs/runbooks/`.

---

## 14. Repository Structure

```
BharatStore/
├── README.md
├── docker-compose.yml            # local Postgres + Redis
├── turbo.json                    # monorepo task orchestration
├── package.json                  # workspace root
├── .github/workflows/            # CI: lint, typecheck, test, build
│   ├── ci.yml
│   └── preview.yml               # Playwright smoke on PR preview
│
├── apps/
│   ├── web/                      # Next.js (landing + dashboard + storefront)
│   │   ├── app/
│   │   │   ├── (marketing)/      # / , /pricing, /about
│   │   │   ├── (auth)/           # /login /signup /forgot-password
│   │   │   ├── onboarding/       # wizard
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx    # app shell (sidebar/topnav guards)
│   │   │   │   ├── dashboard/
│   │   │   │   ├── products/ · categories/ · inventory/
│   │   │   │   ├── orders/ · customers/ · payments/ · invoices/
│   │   │   │   ├── storefront/ · marketing/ · analytics/
│   │   │   │   ├── staff/ · roles/ · settings/ · security/ · audit-logs/
│   │   │   │   └── (drawer routes via route groups + intercepts)
│   │   │   ├── s/[slug]/         # public storefront (p/ cart/ checkout)
│   │   │   ├── layout.tsx · globals.css (design tokens)
│   │   ├── components/
│   │   │   ├── ui/               # shadcn primitives (button, table, dialog…)
│   │   │   ├── layout/           # Sidebar, TopNav, AppShell, PageHeader
│   │   │   ├── shared/           # EmptyState, StatCard, DataTable, StatusBadge
│   │   │   └── charts/           # RevenueChart, OrdersChart, Donut
│   │   ├── lib/                  # api-client, session, auth helpers, utils
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── middleware.ts         # auth guards, business switcher cookie
│   │   ├── tailwind.config.ts    # maps design tokens
│   │   └── next.config.mjs
│   │
│   └── api/                      # Fastify service
│       ├── src/
│       │   ├── server.ts         # bootstrap, plugin registration order
│       │   ├── plugins/          # helmet, auth, tenant-resolver, rbac, rate-limit, multipart, error-handler
│       │   ├── routes/           # auth/ business/ products/ categories/
│       │   │                     # inventory/ orders/ customers/ payments/
│       │   │                     # invoices/ storefront/ marketing/
│       │   │                     # analytics/ staff/ security/
│       │   ├── services/         # business logic per module
│       │   ├── repos/            # Drizzle repository (tenant-scoped)
│       │   ├── db/               # schema.ts, migrations/, client.ts, seeds/
│       │   ├── jobs/             # BullMQ workers + queue defs
│       │   ├── lib/              # email(SendGrid), payments(Razorpay),
│       │   │                     # storage(Firebase), tax(GST), rate
│       │   ├── security/         # suspicious-activity rules
│       │   ├── types/
│       │   └── config/           # zod env config
│       ├── test/                 # vitest: unit + integration (+ cross-tenant probes)
│       └── package.json
│
├── packages/
│   ├── shared/                   # zod schemas, TS types, constants, permission codes
│   ├── config/                   # eslint, tsconfig, tailwind preset
│   └── ui/ (optional)            # if web/api share non-Next UI — default: keep in web
│
├── docs/
│   ├── superpowers/specs/        # this blueprint + follow-up specs
│   ├── architecture/             # diagrams, ADRs
│   └── runbooks/                 # restore, secrets rotation, deploy
│
└── scripts/                      # db:reset, seed, backup, restore helpers
```

---

## 15. Development Roadmap

**Strategy:** vertical slices — each milestone ships a working, testable slice (API + UI + data) end to end. Every milestone ends deployable.

### M0 — Foundations (wk 1–2)
Monorepo (turbo + workspaces), `@bharatstore/config`, docker-compose (Postgres/Redis), Fastify bootstrap + healthz, Next.js bootstrap with design tokens + UI primitives (button/input/card/table/badge/modal/drawer/toast), CI green.

### M1 — Auth & Tenant Core (wk 2–3)
Users, membership, Business+Store models + migrations + RLS; signup/login/refresh/logout; email verification; onboarding wizard; app shell (sidebar/topnav/business switcher); JWT with tenant claims; rbac plugin + role seeds.
**Slices deliverable:** sign up → create business → land on dashboard shell with tenant-guarded API.

### M2 — Products & Categories (wk 3–4)
Categories tree; products CRUD + media upload (Firebase, signed URLs); product list w/ filters; add/edit form; CSV import/export.
**Deliverable:** add products & photos; see them in dashboard.

### M3 — Inventory (wk 4–5)
Inventory rows, movements ledger, adjust flow, low-stock alerts; products publish/unpublish reflect on storefront.
**Deliverable:** stock tracked, alerts appear on dashboard.

### M4 — Storefront (wk 5–6)
Public `s/[slug]` pages (SSR), product landing page, cart (Zustand), checkout, order placement (public API, rate-limited), order confirmation.
**Deliverable:** storefront URL sells a product (no payment yet → COD/manual).

### M5 — Orders & Payments (wk 6–8)
Orders admin (tabs, detail, timeline, status transitions), manual order creation; Razorpay integration: charge, capture verify, webhooks, refunds; sales notifications.
**Deliverable:** full paid order journey; webhook idempotency tested.

### M6 — Customers & Invoices (wk 7–9)
Customer CRUD + detail w/ history; invoice generation w/ GST + HSN, PDF job, email send, invoice table.
**Deliverable:** order → invoice → email → PDF loop.

### M7 — Staff & RBAC UI (wk 8–10)
Invite flow, membership management, Roles & Permissions screen, suspended members, activity timestamps.
**Deliverable:** multi-role team operates the store with 403 guarantees.

### M8 — Analytics & Marketing (wk 9–11)
Analytics queries + rollups (BullMQ), charts, export; campaigns + coupons; dashboard KPIs wired to real data.
**Deliverable:** insights + discount engine live.

### M9 — Security Center & Audit (wk 10–12)
Audit log ingestion + UI + export; security center (score, 2FA, sessions, API keys); suspicious-activity rules; notifications.
**Deliverable:** compliance-grade logging + proactive alerts.

### M10 — Hardening & Launch (wk 12–14)
Rate-limit tuning, load test (k6) to 100 concurrent, Sentry alerting, backup/restore drill, seed/demo-brand data, Playwright E2E suite, deploy guide, launch.

---

## 16. Risks and Technical Considerations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Cross-tenant data leak | Critical | RLS + repository scope + cross-tenant test suite; code review gate on any query writing `business_id` |
| Payment reconciliation drift | High | Webhook idempotency (`event_id`), capture-verify on client, manual reconciliation UI (payment table filter unresolved) |
| Duplicate/conflicting order writes | High | DB transactions + optimistic concurrency (`updated_at` version check) on stock & orders |
| GST miscalculation | High | Central `tax` service with unit-tested slab rates + HSN mapping; snapshot tax at order line level |
| Deleted products breaking history | Medium | Snapshot name/sku/price in order_items; FK `SET NULL` |
| Postgres RLS setup mistakes | High | Migrations checked in CI; RLS is additive; verify in integration tests (`SET ROLE` simulations) |
| Firebase cost creep on media | Medium | Compress/resize at upload to ≤1280px WebP; cap 5 images/product; monthly usage review |
| JWT exfiltration via XSS | High | httpOnly cookies; strict CSP; sanitized render; short-lived tokens |
| Storefront spam orders | Medium | Rate limit + honeypot field + optional captcha at checkout |
| Background job failure (PDF, email) | Low | BullMQ retries + DLQ + alert; invoice PDFs regenerable |
| Solo-developer velocity | Medium | Vertical-slice milestones; shared packages; heavy reuse; AI-assisted scaffolding |
| Multi-browser inconsistency | Medium | Playwright smoke suite at M1 and gating at every milestone |
| Vendor lock-in (Firebase) | Low | Storage adapter interface; Cloudflare R2 drop-in; media URLs stored in DB not bucket-implied |
| Tenant growth scaling | Low | Partitioning deferrable; indexes + `business_id` hotspot awareness; move to dedicated servers if needed;

---

*End of blueprint v1.0 — the master specification for all future BharatStore implementation work.*