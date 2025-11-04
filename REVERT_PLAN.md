# Rencana Revert ke Sebelum Banner

## Status Saat Ini

**Commit Sebelum Banner (Stabil):** `e1d9988 Complete migration and create admin user`

**Migration Sebelum Banner (Terakhir):**
- `20251013142736_kawane_database` - Migration terakhir sebelum Banner

**Migration Setelah Banner (Yang Akan Dihapus):**
- `20251102203545_add_banner_model` ❌ (Hapus migration ini)
- `20251103190000_add_order_item_size` ❌ (Migration manual - hapus)
- `20251103200000_add_address_is_default` ❌ (Migration manual - hapus)
- `20251104000000_add_order_whatsapp_fields` ❌ (Migration manual - hapus)
- `20251104010000_add_order_admin_notes` ❌ (Migration manual - hapus)

## Rencana Revert

### Step 1: Backup Database Production
**PENTING:** Backup semua data sebelum revert!

```sql
-- Backup table Banner (jika ada data penting)
SELECT * FROM "Banner";
```

### Step 2: Hapus Migration Files yang Bermasalah

Hapus migration files berikut dari `prisma/migrations/`:
- `20251102203545_add_banner_model/`
- `20251103190000_add_order_item_size/`
- `20251103200000_add_address_is_default/`
- `20251104000000_add_order_whatsapp_fields/`
- `20251104010000_add_order_admin_notes/`

### Step 3: Hapus Banner dari Schema

Edit `prisma/schema.prisma`:
- Hapus `model Banner { ... }`

### Step 4: Drop Banner Table di Database Production

Jalankan di Supabase Dashboard SQL Editor:
```sql
DROP TABLE IF EXISTS "Banner";
```

### Step 5: Reset Migration History di Database

**PENTING:** Ini akan menghapus record migration dari `_prisma_migrations` table.

```sql
-- Hapus migration records yang bermasalah
DELETE FROM "_prisma_migrations" 
WHERE migration_name IN (
  '20251102203545_add_banner_model',
  '20251103190000_add_order_item_size',
  '20251103200000_add_address_is_default',
  '20251104000000_add_order_whatsapp_fields',
  '20251104010000_add_order_admin_notes'
);
```

### Step 6: Sync Migration Status

```bash
npx prisma migrate resolve --applied 20251013142736_kawane_database
npx prisma migrate status
```

### Step 7: Hapus Script Migration Manual

Hapus file:
- `scripts/run-production-migration.js`
- `RUN_MIGRATION_NOW.sql`
- `RUN_MIGRATION_PRODUCTION.md`
- Update `MIGRATION_WORKFLOW.md` untuk remove referensi script manual

### Step 8: Rebuild & Commit

```bash
npm run build:win
git add .
git commit -m "revert: Remove Banner table and fix migration drift - back to stable state"
git push
```

## ⚠️ WARNING & Catatan

1. **Data Loss:** Semua data di table Banner akan hilang
2. **Backend Code:** Hapus semua code yang menggunakan Banner API
3. **Production:** Pastikan Vercel deploy dengan clean migration history
4. **Database Drift:** Kolom seperti `OrderItem.size`, `Address.isDefault`, dll mungkin sudah ada di production. Jika masih error, kolom tersebut perlu di-drop atau di-mark sebagai "baseline"

## Alternatif: Fix Drift Tanpa Revert Banner

Jika ingin **tetap pakai Banner** tapi fix drift:

1. Mark semua migration manual sebagai baseline
2. Sync migration history
3. Keep Banner table

Silakan pilih opsi mana yang diinginkan.


