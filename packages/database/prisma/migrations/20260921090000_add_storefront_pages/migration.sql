-- CreateTable
CREATE TABLE "storefront_pages" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "nav_label" VARCHAR(100),
    "show_in_menu" BOOLEAN NOT NULL DEFAULT false,
    "is_home" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "draft_config" JSONB,
    "published_config" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storefront_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "storefront_pages_tenant_id_idx" ON "storefront_pages"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "storefront_pages_tenant_id_slug_key" ON "storefront_pages"("tenant_id", "slug");

-- AddForeignKey
ALTER TABLE "storefront_pages" ADD CONSTRAINT "storefront_pages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;