-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('MONTHLY', 'ANNUAL');

-- AlterTable
ALTER TABLE "platform_audit_logs" ADD COLUMN     "details" JSONB;

-- AlterTable
ALTER TABLE "tenant_subscriptions" ADD COLUMN     "billing_period" "BillingPeriod" NOT NULL DEFAULT 'MONTHLY';
