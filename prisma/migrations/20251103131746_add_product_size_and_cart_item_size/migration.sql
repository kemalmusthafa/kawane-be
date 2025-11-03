-- This migration was already applied in production database but missing from git
-- Marked as baseline - columns already exist in database

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN "size" TEXT;

-- CreateTable (if not exists)
CREATE TABLE IF NOT EXISTS "ProductSize" (
    "id" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductSize_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS "ProductSize_productId_size_key" ON "ProductSize"("productId", "size");

-- AddForeignKey (if not exists)
ALTER TABLE "ProductSize" ADD CONSTRAINT "ProductSize_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropIndex (if exists)
DROP INDEX IF EXISTS "CartItem_cartId_productId_key";

-- CreateIndex (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_cartId_productId_size_key" ON "CartItem"("cartId", "productId", "size");
