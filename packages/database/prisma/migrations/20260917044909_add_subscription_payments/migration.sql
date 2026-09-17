-- CreateEnum
CREATE TYPE "SubscriptionPaymentStatus" AS ENUM ('CREATED', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "subscription_payments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "billing_period" "BillingPeriod" NOT NULL DEFAULT 'MONTHLY',
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" "SubscriptionPaymentStatus" NOT NULL DEFAULT 'CREATED',
    "gateway_order_id" VARCHAR(100),
    "gateway_payment_id" VARCHAR(100),
    "gateway_signature" TEXT,
    "method" VARCHAR(50),
    "notes" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_payments_gateway_order_id_key" ON "subscription_payments"("gateway_order_id");

-- CreateIndex
CREATE INDEX "subscription_payments_tenant_id_idx" ON "subscription_payments"("tenant_id");

-- CreateIndex
CREATE INDEX "subscription_payments_status_idx" ON "subscription_payments"("status");

-- AddForeignKey
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
