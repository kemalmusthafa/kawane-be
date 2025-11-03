-- AlterTable
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

-- CreateIndex
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

