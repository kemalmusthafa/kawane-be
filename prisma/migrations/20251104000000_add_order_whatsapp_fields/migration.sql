-- AlterTable
-- Note: This migration was manually created but already applied to production database
-- Format updated to standard Prisma format for consistency
ALTER TABLE "Order" ADD COLUMN "isWhatsAppOrder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "whatsappMessage" TEXT;
ALTER TABLE "Order" ADD COLUMN "whatsappOrderId" TEXT;
ALTER TABLE "Order" ADD COLUMN "whatsappPhoneNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_whatsappOrderId_key" ON "Order"("whatsappOrderId");

