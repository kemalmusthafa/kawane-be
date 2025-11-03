-- AlterTable
-- Note: This migration adds missing Payment columns that exist in schema but not in production database
-- Using DO block for PostgreSQL compatibility (IF NOT EXISTS not supported in ALTER TABLE ADD COLUMN)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Payment' 
        AND column_name = 'paymentProof'
    ) THEN
        ALTER TABLE "Payment" ADD COLUMN "paymentProof" TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Payment' 
        AND column_name = 'whatsappMessageId'
    ) THEN
        ALTER TABLE "Payment" ADD COLUMN "whatsappMessageId" TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Payment' 
        AND column_name = 'whatsappPhoneNumber'
    ) THEN
        ALTER TABLE "Payment" ADD COLUMN "whatsappPhoneNumber" TEXT;
    END IF;
END $$;

