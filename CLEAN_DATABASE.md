# Clean Database - Remove Dummy Data with Type Field

## 🔧 Masalah yang Ditemukan:
- Database masih memiliki kolom `type` di tabel `Category`
- Ada data dummy (Bags, Shirts, Jackets, dll) yang menyebabkan error build
- Perlu membersihkan data sebelum schema bisa di-update

## 🎯 Solusi:

### Opsi 1: Manual SQL di Supabase Dashboard (Recommended)

**Langkah-langkah:**
1. **Masuk ke Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select project Anda
   - Go to SQL Editor

2. **Jalankan SQL Script:**
```sql
-- Hapus kategori dummy yang menyebabkan masalah
DELETE FROM "Category" 
WHERE name IN (
    'Bags',
    'Shirts', 
    'Jackets',
    'Pants',
    'Accessories',
    'Hats'
);

-- Verifikasi hasil
SELECT id, name, description, "createdAt", "updatedAt"
FROM "Category"
ORDER BY "createdAt" DESC;
```

3. **Hapus kolom type (opsional):**
```sql
-- Hati-hati: ini akan menghapus semua data di kolom type
ALTER TABLE "Category" DROP COLUMN IF EXISTS "type";
```

### Opsi 2: Prisma DB Push dengan Data Loss

**Langkah-langkah:**
1. **Pastikan environment variables sudah benar**
2. **Jalankan command:**
```bash
npx prisma db push --accept-data-loss
```

**⚠️ Warning:** Ini akan menghapus semua data di kolom `type`

### Opsi 3: Reset Database Lengkap

**Langkah-langkah:**
1. **Backup data penting terlebih dahulu**
2. **Reset database:**
```bash
npx prisma db push --force-reset
npx prisma db seed
```

## 🔍 Verifikasi:

Setelah membersihkan database:

1. **Cek kategori yang tersisa:**
```sql
SELECT COUNT(*) as total_categories FROM "Category";
```

2. **Test build backend:**
```bash
npm run build
```

3. **Test start backend:**
```bash
npm start
```

## 🚨 Catatan Penting:

- **Backup data penting sebelum menghapus**
- **Kolom `type` akan dihapus dari schema**
- **Data dummy akan dihapus**
- **Kategori yang tersisa akan tetap ada**

## 📊 Expected Result:

Setelah cleanup:
- ✅ Tidak ada kolom `type` di tabel `Category`
- ✅ Tidak ada data dummy (Bags, Shirts, dll)
- ✅ Build backend berhasil tanpa error
- ✅ Backend bisa start dengan normal
