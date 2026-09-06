# BharatStore — Production Deployment & Operational Manual

This manual provides authoritative instructions for deploying, operating, and maintaining the **BharatStore Omnichannel Commerce Platform** in a production environment.

---

## 1. System Requirements & Prerequisites

* **Node.js**: `v18.x` or `v20.x` LTS
* **Package Manager**: `npm v9+`
* **Database**: PostgreSQL `14.x` or `15.x` with `uuid-ossp` extension enabled.
* **Memory**: Minimum 2 GB RAM (4 GB recommended for Next.js build & SSR).
* **OS**: Linux (Ubuntu 22.04 LTS / Debian 12 / RHEL 9 recommended).

---

## 2. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure mandatory production variables:
   - `DATABASE_URL`: Production PostgreSQL connection string.
   - `JWT_SECRET`: High-entropy 64+ character secret key.
   - `NEXT_PUBLIC_APP_URL`: Production domain URL (e.g. `https://bharatstore.in`).
   - `NODE_ENV`: Set to `production`.

---

## 3. Database Deployment & Migration Strategy

For production deployments, **do NOT use `npx prisma db push`**. Always execute versioned Prisma migrations to prevent destructive schema alterations:

1. **Apply Production Migrations**:
   ```bash
   npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma
   ```
2. **Generate Prisma Client**:
   ```bash
   npx prisma generate --schema=packages/database/prisma/schema.prisma
   ```

---

## 4. Production Build & Execution

1. **Install Monorepo Dependencies**:
   ```bash
   npm install --production=false
   ```
2. **Execute Full Build**:
   ```bash
   npm run build
   ```
3. **Start Production Server**:
   ```bash
   npm run start
   ```

---

## 5. Operational Health Check Verification

The platform exposes an operational health endpoint at `/api/health`:
- **URL**: `GET /api/health`
- **Success Response (HTTP 200)**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-09-06T14:28:00.000Z",
    "version": "0.1.0",
    "uptimeSeconds": 1420,
    "services": {
      "database": {
        "status": "healthy",
        "latencyMs": 4
      },
      "application": {
        "status": "healthy",
        "environment": "production"
      }
    }
  }
  ```
- **Degraded Response (HTTP 503)**: Returned when database query fails. Zero credentials or sensitive stack traces are exposed.

---

## 6. Database Backup & Recovery Strategy

### Automated Nightly Backup Command (cron):
```bash
pg_dump -h localhost -U bharat_db_user -d bharatstore -F c -b -v -f "/var/backups/bharatstore_$(date +%Y%m%d_%H%M%S).dump"
```

### Point-in-Time Recovery Command:
```bash
pg_restore -h localhost -U bharat_db_user -d bharatstore --clean --if-exists -v "/var/backups/bharatstore_20260906_030000.dump"
```

---

## 7. Notification Provider Configuration

- **In-App Notifications**: Fully functional out of the box with zero external dependencies.
- **Email, SMS, WhatsApp Channels**: Require provider credentials (`EMAIL_API_KEY`, `SMS_API_KEY`, `WHATSAPP_API_KEY`). If omitted, notifications transition to `FAILED` with an explicit diagnostic reason without crashing commerce workflows.

---

## 8. Security & Hardening Checklist

- [x] Strict JWT authentication with server-side validation.
- [x] Multi-tenant data isolation via `getTenantDb` client extension.
- [x] RBAC permission checks enforced on all merchant APIs via `authorizeRequest`.
- [x] Audit logs enabled for sensitive actions.
- [x] Server-authoritative price, discount, and tax calculations.
- [x] Atomic concurrency guards for stock decrement and coupon usage.
