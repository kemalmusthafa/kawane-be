-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."ProductSize" (
    "id" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductSize_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ProductSize" ADD CONSTRAINT "ProductSize_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ProductSize_productId_size_key" ON "public"."ProductSize"("productId", "size");

-- AlterTable: Add size column to CartItem if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'CartItem' 
        AND column_name = 'size'
    ) THEN
        ALTER TABLE "public"."CartItem" ADD COLUMN "size" TEXT;
    END IF;
END $$;

-- Drop existing unique constraint if exists and create new one with size
DO $$
BEGIN
    -- Drop old unique constraint if exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'CartItem_cartId_productId_key'
    ) THEN
        ALTER TABLE "public"."CartItem" DROP CONSTRAINT IF EXISTS "CartItem_cartId_productId_key";
    END IF;

    -- Create new unique constraint with size if not exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'CartItem_cartId_productId_size_key'
    ) THEN
        ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_cartId_productId_size_key" UNIQUE ("cartId", "productId", "size");
    END IF;
END $$;

