-- Migration untuk Production Database
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor

-- Migration 1: OrderItem.size (jika belum ada)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'OrderItem' 
        AND column_name = 'size'
    ) THEN
        ALTER TABLE "OrderItem" ADD COLUMN "size" TEXT;
    END IF;
END $$;

-- Migration 2: Address.isDefault (jika belum ada)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Address' 
        AND column_name = 'isDefault'
    ) THEN
        ALTER TABLE "Address" ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

