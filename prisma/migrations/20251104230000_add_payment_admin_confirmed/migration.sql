-- AlterTable
-- Note: This migration was manually created but already applied to production database
ALTER TABLE "Payment" ADD COLUMN "adminConfirmed" BOOLEAN NOT NULL DEFAULT false;

