-- Drift reconciliation: these columns were previously applied via `prisma db push`
-- but never recorded in migration history. Marked as applied with
-- `prisma migrate resolve --applied` since they already exist in the database.

ALTER TABLE "tenants" ADD COLUMN "subdomain" TEXT;
ALTER TABLE "tenants" ADD COLUMN "custom_domain" TEXT;

CREATE UNIQUE INDEX "tenants_subdomain_key" ON "tenants"("subdomain");
CREATE UNIQUE INDEX "tenants_custom_domain_key" ON "tenants"("custom_domain");