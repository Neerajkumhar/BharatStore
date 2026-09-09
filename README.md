# BharatStore — Omnichannel Commerce & Storefront Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-brightgreen.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-1B222D.svg)](https://www.prisma.io/)

**BharatStore** is an enterprise-grade, multi-tenant omnichannel commerce platform and no-code storefront builder designed specifically for modern retail and D2C businesses in India. Built with Next.js, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

Designed & Developed by **Neeraj Kumhar** ([@Neerajkumhar](https://github.com/Neerajkumhar)).

---

## 🌟 Key Features

### 🎨 1. No-Code Storefront Builder & 22 Theme Templates
- **22 Curated Theme Templates**: Pre-configured storefront layouts across 7 vertical pools (Fashion, Beauty & Personal Care, Electronics, Home & Living, Grocery, Artisanal, and General D2C).
- **Interactive Visual Builder**: Drag-and-drop workspace with real-time preview, device switcher (Mobile, Tablet, Desktop), section customization, and live HTML preview.
- **Rich Storefront Components**: Over 40+ modular UI sections including Hero Banners, Product Grids, Flash Sales, Countdown Timers, Editorial Splits, Customer Testimonials, Brand Logos, Routine Builders, and Quick View Modals.

### 🛍️ 2. D2C Storefront & Online Commerce
- High-performance, SEO-optimized D2C shopping experience with dynamic product filtering, collection pages, product spotlights, and cart management.
- Multi-currency support with INR pricing (`₹`), dynamic GST calculations, and local delivery estimates.

### 🏬 3. Counter POS Terminal & Khata Ledger
- **Point-of-Sale (POS) Terminal**: Ultra-fast counter checkout interface with quick product search, receipt generation, thermal print layout, and offline-capable transaction flow.
- **Khata Credit Ledger**: Integrated digital ledger for managing local customer credit, recording payments, tracking outstanding balances, and sending balance reminders.

### 📊 4. Business Intelligence & Analytics
- Executive mission control dashboard with sales revenue metrics, inventory turnover rates, customer acquisition analytics, and period-over-period IST reports.
- Server-side analytics REST aggregation endpoints for revenue, orders, and product performance.

### 🔒 5. Multi-Tenant Architecture & Security
- **Strict Tenant Isolation**: Built-in `getTenantDb` Prisma extension enforcing complete data isolation per merchant tenant across all queries, mutations, and upserts.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions (Owner, Admin, Manager, Cashier, Staff) enforced on every API route and UI module.
- **Security & Audit Logs**: Comprehensive security center with JWT session management, activity audit logging, and automated threat detection.

---

## 🏗️ Architecture & Monorepo Structure

```
BharatStore/
├── apps/
│   └── web/                   # Next.js 15 App Router Frontend & REST API
│       ├── app/               # Routes (Auth, Dashboard, Storefront, Builder, Analytics, POS)
│       ├── components/        # Storefront sections, builder sidebar, primitives & UI elements
│       └── lib/               # Preview registries, demo adapters, and helper utilities
├── packages/
│   ├── database/              # Prisma Schema, Tenant DB Extension, Seeds & Migrations
│   └── shared/                # Zod Schemas, Tax Calculators, Variant & Component Registries
├── docker/                    # Docker Compose config for local PostgreSQL & Redis
├── docs/                      # Technical specifications & milestone blueprints
├── .env                       # Local environment variables
├── .env.example               # Environment variables template
├── DEPLOYMENT.md              # Production deployment & operational guide
├── LICENSE                    # MIT License (Neeraj Kumhar)
└── package.json               # Root monorepo workspace configuration
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.x` or `v20.x` LTS
- **Package Manager**: `npm v9+`
- **Database**: PostgreSQL `14.x` or `15.x`
- **Cache**: Redis `7.x` (optional for dev)

### 1. Clone the Repository
```bash
git clone https://github.com/Neerajkumhar/BharatStore.git
cd BharatStore
```

### 2. Install Monorepo Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
The repository includes pre-configured local development settings in `.env`. You can also create a custom copy from `.env.example`:
```bash
cp .env.example .env
```

Ensure your `.env` contains valid PostgreSQL connection credentials:
```env
DATABASE_URL="postgresql://bharatstore:bharatstore_dev_secret_2026@localhost:5432/bharatstore?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="e75c5c9a96b538d1daa4bee5f87408ba83c20637dc7527247037b709dcc58ddb8864afd03fc8f9e8b83afd7181bb4334"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Launch Database with Docker (Optional)
If you have Docker installed, spin up PostgreSQL and Redis automatically:
```bash
npm run docker:up
```

### 5. Run Database Migrations & Seed Data
```bash
npm run db:push
npm run db:seed
```

### 6. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Scripts & CLI Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Next.js web application in development mode |
| `npm run build` | Build all workspace packages and web application |
| `npm run lint` | Run ESLint across all monorepo packages |
| `npm run db:generate` | Generate Prisma client types |
| `npm run db:push` | Push schema changes directly to database |
| `npm run db:seed` | Seed database with demo tenants, stores, and products |
| `npm run db:studio` | Launch Prisma Studio database GUI |
| `npm run docker:up` | Start PostgreSQL & Redis services via Docker Compose |
| `npm run docker:down` | Stop Docker Compose background services |

---

## 📄 License & Credits

Designed, Developed & Maintained by **Neeraj Kumhar** ([@Neerajkumhar](https://github.com/Neerajkumhar)).

This project is licensed under the [MIT License](LICENSE) — see the LICENSE file for details.
