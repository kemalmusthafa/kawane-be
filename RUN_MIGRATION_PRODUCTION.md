# Cara Menjalankan Migration di Production Database

## Error yang Terjadi
Database production di Vercel tidak memiliki:
1. Column `size` di table `OrderItem` 
2. Column `isDefault` di table `Address`
3. Column `isWhatsAppOrder`, `whatsappMessage`, `whatsappOrderId`, `whatsappPhoneNumber` di table `Order`

Error muncul di:
- `/api/best-sellers` - "The column `OrderItem.size` does not exist in the current database"
- `/api/orders` (checkout) - "The column `isDefault` does not exist in the current database"
- `/api/orders` (checkout) - "The column `isWhatsAppOrder` does not exist in the current database"

## Migration yang Perlu Dijalankan

### Migration 1: OrderItem.size
File: `prisma/migrations/20251103190000_add_order_item_size/migration.sql`
```sql
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "size" TEXT;
```

### Migration 2: Address.isDefault
File: `prisma/migrations/20251103200000_add_address_is_default/migration.sql`
```sql
-- AlterTable
ALTER TABLE "Address" ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;
```

### Migration 3: Order WhatsApp Fields
File: `prisma/migrations/20251104000000_add_order_whatsapp_fields/migration.sql`
```sql
-- AlterTable
ALTER TABLE "Order" ADD COLUMN "isWhatsAppOrder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "whatsappMessage" TEXT;
ALTER TABLE "Order" ADD COLUMN "whatsappOrderId" TEXT;
ALTER TABLE "Order" ADD COLUMN "whatsappPhoneNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_whatsappOrderId_key" ON "Order"("whatsappOrderId");
```

## Cara Menjalankan (Pilih Salah Satu)

### Opsi 1: Via Supabase Dashboard (Paling Mudah)
1. Buka Supabase Dashboard → Project Anda
2. Buka **SQL Editor**
3. Copy dan paste SQL berikut (jalankan kedua query):
   ```sql
   -- Migration 1: OrderItem.size
   ALTER TABLE "OrderItem" ADD COLUMN "size" TEXT;
   
   -- Migration 2: Address.isDefault
   ALTER TABLE "Address" ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;
   
   -- Migration 3: Order WhatsApp fields
   ALTER TABLE "Order" ADD COLUMN "isWhatsAppOrder" BOOLEAN NOT NULL DEFAULT false;
   ALTER TABLE "Order" ADD COLUMN "whatsappMessage" TEXT;
   ALTER TABLE "Order" ADD COLUMN "whatsappOrderId" TEXT;
   ALTER TABLE "Order" ADD COLUMN "whatsappPhoneNumber" TEXT;
   CREATE UNIQUE INDEX "Order_whatsappOrderId_key" ON "Order"("whatsappOrderId");
   ```
   
   **ATAU** gunakan file `RUN_MIGRATION_NOW.sql` yang sudah include semua migration dengan pengecekan `IF NOT EXISTS` (lebih aman)
4. Klik **Run** atau **Execute**
5. Selesai! Migration sudah dijalankan

### Opsi 2: Via Script Node.js (Jika DATABASE_URL production tersedia)
1. Pastikan `.env` sudah di-set dengan `DATABASE_URL` production dari Vercel
2. Jalankan: `npm run migrate:production`
3. Script akan otomatis check dan menambahkan kolom yang belum ada

### Opsi 3: Via Prisma Migrate Deploy
1. Pastikan `.env` sudah di-set dengan `DATABASE_URL` production
2. Jalankan: `npx prisma migrate deploy`

### Opsi 4: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull env
vercel env pull .env.production

# Run migration
npx prisma migrate deploy
```

## Verifikasi
Setelah migration berhasil, pastikan:
- Column `size` ada di table `OrderItem` di database
- Column `isDefault` ada di table `Address` di database
- Columns `isWhatsAppOrder`, `whatsappMessage`, `whatsappOrderId`, `whatsappPhoneNumber` ada di table `Order` di database
- Unique index `Order_whatsappOrderId_key` sudah dibuat
- API `/api/best-sellers` tidak error lagi
- API `/api/orders` (checkout) tidak error lagi
- Tidak ada error "OrderItem.size does not exist"
- Tidak ada error "Address.isDefault does not exist"
- Tidak ada error "isWhatsAppOrder does not exist"

## Catatan
- Migration ini hanya menambahkan column, tidak menghapus data
- Column `size` adalah nullable (boleh NULL), jadi data existing tidak terpengaruh
- Format migration sudah sesuai standar Prisma (tanpa `public.` schema prefix)

