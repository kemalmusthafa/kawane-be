# Panduan Migration Prisma

## Cara Migration yang Benar (Seperti Sebelumnya)

Migration harus dibuat dengan command Prisma standar, bukan manual:

```bash
# 1. Update schema.prisma terlebih dahulu
# 2. Buat migration dengan command:
npx prisma migrate dev --name nama_migration

# 3. Migration akan otomatis:
#    - Membuat file migration di prisma/migrations/
#    - Mengapply migration ke database development
#    - Generate Prisma Client baru
```

## Kenapa Migration Banner Berhasil?

Migration banner (`20251102203545_add_banner_model`) berhasil karena:
1. Dibuat dengan `npx prisma migrate dev` (otomatis oleh Prisma)
2. Format SQL yang clean dan standar
3. Tidak ada `IF NOT EXISTS` atau `DO $$` blocks yang kompleks
4. Schema prefix `public.` tidak diperlukan (Prisma handle otomatis)

## Format Migration yang Benar

✅ **BENAR** (seperti migration banner):
```sql
-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    ...
    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Banner_field_key" ON "Banner"("field");
```

❌ **SALAH** (migration ProductSize sebelumnya):
```sql
CREATE TABLE IF NOT EXISTS "public"."ProductSize" (...)
DO $$ BEGIN ... END $$;
```

## Checklist Sebelum Commit Migration

1. ✅ Pastikan migration dibuat dengan `npx prisma migrate dev`
2. ✅ Jangan edit migration file manual setelah dibuat
3. ✅ Test migration dengan `npx prisma migrate status`
4. ✅ Pastikan `dist/` folder di-commit untuk Vercel
5. ✅ Pastikan `prisma/migrations/` tidak di `.gitignore`

## Setup Vercel

- **TIDAK PERLU** setting khusus di Vercel
- Vercel akan menggunakan file `dist/` yang sudah di-build dari git
- Migration akan otomatis terdeteksi jika ada perubahan schema
- Database akan otomatis terupdate saat deploy

## Troubleshooting

Jika migration gagal:
1. Cek apakah migration file dibuat dengan `npx prisma migrate dev`
2. Pastikan format SQL sesuai standar Prisma
3. Jangan gunakan `IF NOT EXISTS` atau syntax PostgreSQL khusus
4. Reset migration jika perlu: `npx prisma migrate reset` (HATI-HATI: hapus semua data!)

