# Cara Menjalankan Migration di Production Database

## Error yang Terjadi
Database production di Vercel tidak memiliki:
1. Table `ProductSize` 
2. Column `size` di table `CartItem`

## Solusi

### Opsi 1: Via Vercel Dashboard (Recommended)
1. Buka Vercel Dashboard → Project `kawane-be`
2. Buka tab **Settings** → **Environment Variables**
3. Pastikan `DATABASE_URL` dan `DIRECT_URL` sudah di-set dengan benar
4. Buka tab **Deployments** → Klik **Redeploy** pada deployment terbaru
5. Atau buat deployment baru dengan trigger dari GitHub

### Opsi 2: Via Vercel CLI (Manual Migration)
Jalankan command berikut (perlu install Vercel CLI terlebih dahulu):
```bash
# Install Vercel CLI jika belum
npm i -g vercel

# Login ke Vercel
vercel login

# Link ke project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migration dengan production DATABASE_URL
npx prisma migrate deploy
```

### Opsi 3: Via Prisma Studio / Manual SQL
Jika akses database langsung tersedia:
1. Buka database via Prisma Studio: `npx prisma studio`
2. Atau jalankan SQL langsung di Supabase Dashboard
3. Copy isi dari `prisma/migrations/20251103131746_add_product_size_and_cart_item_size/migration.sql`
4. Jalankan SQL tersebut di database production

## Migration yang Akan Dijalankan
Migration file: `prisma/migrations/20251103131746_add_product_size_and_cart_item_size/migration.sql`

Migration ini akan:
1. Membuat table `ProductSize` dengan kolom:
   - id (UUID)
   - size (String)
   - stock (Integer)
   - productId (Foreign Key ke Product)
   - createdAt, updatedAt (Timestamps)
   - Unique constraint: (productId, size)

2. Menambahkan kolom `size` ke table `CartItem` (nullable)
3. Update unique constraint `CartItem` dari `(cartId, productId)` menjadi `(cartId, productId, size)`

## Verifikasi
Setelah migration berhasil, pastikan:
- Table `ProductSize` ada di database
- Column `size` ada di table `CartItem`
- Tidak ada error lagi saat create product atau access cart

