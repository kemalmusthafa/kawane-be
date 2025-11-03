-- AlterEnum - Add WHATSAPP_MANUAL to PaymentMethod enum
BEGIN;
CREATE TYPE "public"."PaymentMethod_new" AS ENUM ('WHATSAPP_MANUAL', 'MIDTRANS', 'BANK_TRANSFER', 'CASH_ON_DELIVERY');
ALTER TABLE "public"."Payment" ALTER COLUMN "method" TYPE "public"."PaymentMethod_new" USING ("method"::text::"public"."PaymentMethod_new");
ALTER TYPE "public"."PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "public"."PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

