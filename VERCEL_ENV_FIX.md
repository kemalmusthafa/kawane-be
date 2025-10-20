# Vercel Environment Variables Fix

## 🔧 Masalah yang Ditemukan:
- Database connection error di production Vercel
- Environment variables tidak ter-set dengan benar
- Prisma tidak bisa connect ke Supabase

## 🎯 Solusi:

### 1. Set Environment Variables di Vercel Dashboard:

**Masuk ke Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select project `kawane-be`
3. Go to Settings → Environment Variables

**Tambahkan/Update variables berikut:**

```
DATABASE_URL=postgresql://postgres.zbmfgymryfvhhkitbemm:KawaneStudio@80@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.zbmfgymryfvhhkitbemm:KawaneStudio@80@aws-1-us-east-1.pooler.supabase.com:5432/postgres

NODE_ENV=production

JWT_SECRET=kawane-studio-website-e-commerce-application-jwt-secret

MAIL_USER=kemalmusthafa80@gmail.com
MAIL_PASS=cfxb sutp bdhx jpgq

GOOGLE_CLIENT_ID=[Your Google Client ID]
GOOGLE_CLIENT_SECRET=[Your Google Client Secret]

MIDTRANS_SERVER_KEY=[Your Midtrans Server Key]
MIDTRANS_CLIENT_KEY=[Your Midtrans Client Key]
MIDTRANS_IS_PRODUCTION=false

CLOUD_NAME=[Your Cloudinary Cloud Name]
CLOUD_KEY=[Your Cloudinary API Key]
CLOUD_SECRET=[Your Cloudinary API Secret]

BASE_URL_FE=https://kawane-fe.vercel.app
```

### 2. Redeploy Project:
1. Go to Deployments tab
2. Click "Redeploy" pada deployment terbaru
3. Atau push commit baru untuk trigger auto-deploy

### 3. Verify Database Connection:
Setelah redeploy, test API endpoints:
- https://kawane-be.vercel.app/api/categories
- https://kawane-be.vercel.app/api/products
- https://kawane-be.vercel.app/api/lookbook

## 🚨 Catatan Penting:
- Pastikan semua environment variables di-set untuk **Production** environment
- Jangan set untuk Development atau Preview
- Redeploy setelah mengubah environment variables
- Database connection error akan hilang setelah environment variables ter-set dengan benar
