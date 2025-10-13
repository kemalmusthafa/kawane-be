# Deployment Guide - Kawane Studio Backend

## Masalah yang Sudah Diperbaiki

### 1. Error TypeScript TS7006

- **Masalah**: Parameter 'error' implicitly has an 'any' type di `cache.middleware.ts`
- **Solusi**: Menambahkan type annotation `error: any` pada semua catch block

### 2. Missing Dependency

- **Masalah**: Package `dotenv` tidak terinstall
- **Solusi**: Menambahkan `dotenv` sebagai dependency dengan `npm install dotenv`

### 3. Build Script Compatibility

- **Masalah**: Script build menggunakan command Linux (`cp`) yang tidak kompatibel dengan Windows
- **Solusi**:
  - Script `build` menggunakan command Linux untuk deployment (Vercel)
  - Script `build:win` menggunakan command Windows untuk development lokal

## Environment Variables yang Diperlukan

Pastikan Anda mengatur environment variables berikut di Vercel:

### Required Variables:

```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long
```

### Optional Variables:

```
NODE_ENV=production
PORT=8000
BASE_URL_FE=https://your-frontend-domain.com
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_IS_PRODUCTION=true
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=10
```

## Langkah Deployment di Vercel

1. **Pastikan semua dependency terinstall**:

   ```bash
   npm install
   ```

2. **Generate Prisma Client**:

   ```bash
   npx prisma generate
   ```

3. **Test build lokal**:

   ```bash
   npm run build
   ```

4. **Deploy ke Vercel**:
   - Push code ke GitHub
   - Connect repository ke Vercel
   - Set environment variables di Vercel dashboard
   - Deploy

## Troubleshooting

### Jika masih ada error build:

1. Pastikan semua file TypeScript tidak ada error
2. Pastikan semua import path benar
3. Pastikan semua dependency terinstall
4. Pastikan Prisma client sudah di-generate

### Jika ada error runtime:

1. Periksa environment variables
2. Periksa database connection
3. Periksa log di Vercel dashboard

## Scripts yang Tersedia

- `npm run build`: Build untuk deployment (Linux commands)
- `npm run build:win`: Build untuk development lokal (Windows commands)
- `npm run start`: Start aplikasi dengan build Windows
- `npm run start:prod`: Start aplikasi dengan build Linux untuk production
- `npm run dev`: Development mode dengan hot reload
- `npm run postinstall`: Generate Prisma client (otomatis dijalankan saat install)

## Catatan Penting

1. **Redis Service**: Saat ini Redis service sudah di-disable untuk menghindari connection error. Jika Anda ingin menggunakan Redis, pastikan Redis server tersedia.

2. **Database**: Pastikan database PostgreSQL sudah tersedia dan accessible dari Vercel.

3. **Environment Variables**: Pastikan semua environment variables yang diperlukan sudah di-set di Vercel dashboard.

4. **Build Process**: Script build akan:
   - Compile TypeScript ke JavaScript
   - Copy template files ke folder dist
   - Generate Prisma client

