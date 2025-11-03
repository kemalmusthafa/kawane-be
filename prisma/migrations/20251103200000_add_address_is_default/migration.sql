-- AlterTable
-- Note: This migration was manually created but already applied to production database
ALTER TABLE "Address" ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;

