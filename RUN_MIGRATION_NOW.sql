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

-- Migration 3: Order WhatsApp fields (jika belum ada)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Order' 
        AND column_name = 'isWhatsAppOrder'
    ) THEN
        ALTER TABLE "Order" ADD COLUMN "isWhatsAppOrder" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Order' 
        AND column_name = 'whatsappMessage'
    ) THEN
        ALTER TABLE "Order" ADD COLUMN "whatsappMessage" TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Order' 
        AND column_name = 'whatsappOrderId'
    ) THEN
        ALTER TABLE "Order" ADD COLUMN "whatsappOrderId" TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Order' 
        AND column_name = 'whatsappPhoneNumber'
    ) THEN
        ALTER TABLE "Order" ADD COLUMN "whatsappPhoneNumber" TEXT;
    END IF;
END $$;

-- Create unique index for whatsappOrderId
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'Order' 
        AND indexname = 'Order_whatsappOrderId_key'
    ) THEN
        CREATE UNIQUE INDEX "Order_whatsappOrderId_key" ON "Order"("whatsappOrderId");
    END IF;
END $$;

-- Migration 4: Order.adminNotes (jika belum ada)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Order' 
        AND column_name = 'adminNotes'
    ) THEN
        ALTER TABLE "Order" ADD COLUMN "adminNotes" TEXT;
    END IF;
END $$;

