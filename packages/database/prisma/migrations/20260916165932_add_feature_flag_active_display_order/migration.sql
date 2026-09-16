-- AlterTable
ALTER TABLE "feature_flags" ADD COLUMN     "display_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "feature_flags_is_active_idx" ON "feature_flags"("is_active");
