# Vercel Environment Variables Setup Guide

## 🔧 Masalah yang Ditemukan:
- Backend tidak bisa connect ke database Supabase
- Error: "Can't reach database server at aws-1-us-east-1.pooler.supabase.com:6543"
- Environment variables tidak ter-set dengan benar di Vercel

## 🎯 Solusi:

### 1. Set Environment Variables di Vercel Dashboard

**Langkah-langkah:**
1. **Masuk ke Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select project "kawane-be"
   - Go to Settings → Environment Variables

2. **Add Environment Variables:**
```
DATABASE_URL = postgresql://postgres.zbmfgymryfvhhkitbemm:KawaneStudio@80@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL = postgresql://postgres.zbmfgymryfvhhkitbemm:KawaneStudio@80@aws-1-us-east-1.pooler.supabase.com:5432/postgres
JWT_SECRET = kawane-studio-website-e-commerce-application-jwt-secret
MAIL_USER = kemalmusthafa80@gmail.com
MAIL_PASS = cfxb sutp bdhx jpgq
CLIENT_ID = [Your Google Client ID]
CLIENT_SECRET = [Your Google Client Secret]
REDIRECT_URI = http://localhost:3000
MIDTRANS_SERVER_KEY = [Your Midtrans Server Key]
MIDTRANS_CLIENT_KEY = [Your Midtrans Client Key]
MIDTRANS_IS_PRODUCTION = false
CLOUD_NAME = dkpn9aqne
CLOUD_KEY = 222754858211214
CLOUD_SECRET = qXKf3Wfl_ru01absqJQtc3xzUwY
BASE_URL_FE = http://localhost:3000
PORT = 8000
NODE_ENV = production
```

3. **Set Environment untuk:**
   - Production: ✅ Checked
   - Preview: ✅ Checked
   - Development: ✅ Checked

### 2. Redeploy Application

**Langkah-langkah:**
1. **Go to Deployments tab**
2. **Click "Redeploy" on latest deployment**
3. **Or push new commit to trigger deployment**

### 3. Verify Database Connection

**Test API endpoints:**
- `https://kawane-be.vercel.app/api/categories`
- `https://kawane-be.vercel.app/api/auth/login`
- `https://kawane-be.vercel.app/api/products`

## 🔍 Troubleshooting:

### Jika Masih Error:
1. **Check Supabase Database Status**
   - Go to Supabase Dashboard
   - Check if database is running
   - Verify connection string

2. **Check Vercel Logs**
   - Go to Vercel Dashboard → Functions
   - Check function logs for errors

3. **Test Database Connection**
   - Run `test-db-connection.sh` script
   - Check if Prisma can connect

## 📊 Expected Result:

Setelah setup environment variables:
- ✅ Database connection berhasil
- ✅ API endpoints berfungsi normal
- ✅ Categories, products, auth endpoints working
- ✅ Prisma Studio bisa diakses
- ✅ Frontend bisa fetch data dari backend

## 🚨 Catatan Penting:

- **Environment variables harus di-set di Vercel Dashboard**
- **Database connection string harus benar**
- **Redeploy setelah set environment variables**
- **Check Vercel logs jika masih error**
