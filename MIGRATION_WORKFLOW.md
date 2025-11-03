# Workflow Migration Prisma yang Benar

## Workflow Normal (Seperti Sebelumnya)

### 1. Development (Local)
```bash
# Update schema.prisma terlebih dahulu
# Kemudian buat migration:
npx prisma migrate dev --name nama_migration

# Migration akan otomatis:
# - Generate migration file di prisma/migrations/
# - Apply migration ke database development
# - Generate Prisma Client baru
```

### 2. Commit & Push
```bash
git add prisma/migrations/
git commit -m "feat: Add migration for ..."
git push
```

### 3. Production (Vercel)
Vercel akan **otomatis** menjalankan migration saat deploy karena:
- Script `vercel-build` di `package.json` include `npx prisma migrate deploy`
- `vercel.json` sudah dikonfigurasi untuk menjalankan build command
- Migration files dari git akan di-deploy bersama project

## Konfigurasi yang Sudah Di-Setup

### package.json
```json
{
  "scripts": {
    "vercel-build": "npm run build:linux && npx prisma migrate deploy"
  }
}
```

### vercel.json
```json
{
  "buildCommand": "npm run vercel-build",
  "builds": [
    {
      "config": {
        "includeFiles": [
          "prisma/migrations/**",
          "prisma/schema.prisma"
        ]
      }
    }
  ]
}
```

## Mengapa Sekarang Harus Pakai Script?

**Sebelumnya (banner flow):**
- Migration dibuat dengan `npx prisma migrate dev` ✅
- Format SQL standar ✅
- Vercel otomatis run migration (karena build command) ✅

**Masalah yang terjadi:**
- Beberapa migration dibuat manual dengan SQL non-standar ❌
- `vercel.json` tidak menjalankan build command ❌
- Migration tidak otomatis jalan di production ❌

**Solusi sekarang:**
- ✅ Semua migration harus dibuat dengan `npx prisma migrate dev`
- ✅ `vercel-build` script sudah ditambahkan
- ✅ `vercel.json` sudah dikonfigurasi untuk run build command
- ✅ Migration akan otomatis jalan saat deploy

## Checklist Workflow

1. ✅ Update `prisma/schema.prisma`
2. ✅ Run `npx prisma migrate dev --name nama_migration`
3. ✅ Review migration file (pastikan format standar)
4. ✅ Commit migration files ke git
5. ✅ Push ke GitHub
6. ✅ Vercel deploy → otomatis run `npm run vercel-build` → migration jalan ✅

## Catatan Penting

- **JANGAN** membuat migration file manual
- **JANGAN** edit migration file setelah dibuat
- **HARUS** pakai `npx prisma migrate dev` untuk generate migration
- Migration files **HARUS** di-commit ke git
- `prisma/migrations/` **TIDAK** boleh di `.gitignore`

