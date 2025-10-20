-- Script SQL untuk membersihkan data dummy dengan field type
-- Jalankan script ini di Supabase SQL Editor

-- 1. Cek apakah kolom type masih ada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Category' AND column_name = 'type';

-- 2. Jika kolom type masih ada, hapus kolom tersebut
-- (Hati-hati: ini akan menghapus semua data di kolom type)
-- ALTER TABLE "Category" DROP COLUMN IF EXISTS "type";

-- 3. Hapus kategori dummy yang mungkin menyebabkan masalah
DELETE FROM "Category" 
WHERE name IN (
    'Bags',
    'Shirts', 
    'Jackets',
    'Pants',
    'Accessories',
    'Hats'
);

-- 4. Hapus produk yang terkait dengan kategori yang dihapus
-- (Ini akan di-handle oleh foreign key constraint)

-- 5. Verifikasi hasil
SELECT id, name, description, "createdAt", "updatedAt"
FROM "Category"
ORDER BY "createdAt" DESC;

-- 6. Cek jumlah kategori yang tersisa
SELECT COUNT(*) as total_categories FROM "Category";
