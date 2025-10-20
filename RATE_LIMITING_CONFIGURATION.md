# 🚦 Konfigurasi Rate Limiting yang Fleksibel

## Overview

Rate limiting sekarang dapat dikonfigurasi melalui environment variables untuk memudahkan penyesuaian di production.

## Konfigurasi Environment Variables

### 1. **Email Rate Limiting** (Per Hari & Per Jam)

```bash
# Daily Email Limit (24 jam)
EMAIL_RATE_LIMIT_WINDOW_MS=86400000        # 24 jam dalam milliseconds
EMAIL_RATE_LIMIT_MAX_REQUESTS=10           # 10 email per hari

# Hourly Email Limit (1 jam) - Additional protection
EMAIL_RATE_LIMIT_WINDOW_MS_HOURLY=3600000  # 1 jam dalam milliseconds
EMAIL_RATE_LIMIT_MAX_REQUESTS_HOURLY=5     # 5 email per jam
```

### 2. **Auth Rate Limiting** (Login, Register, dll)

```bash
AUTH_RATE_LIMIT_WINDOW_MS=900000           # 15 menit
AUTH_RATE_LIMIT_MAX_REQUESTS=20            # 20 percobaan per 15 menit
```

### 3. **API Rate Limiting** (General API calls)

```bash
API_RATE_LIMIT_WINDOW_MS=900000            # 15 menit
API_RATE_LIMIT_MAX_REQUESTS=200            # 200 API calls per 15 menit
```

### 4. **Search Rate Limiting** (Search endpoints)

```bash
SEARCH_RATE_LIMIT_WINDOW_MS=60000          # 1 menit
SEARCH_RATE_LIMIT_MAX_REQUESTS=30          # 30 pencarian per menit
```

### 5. **General Rate Limiting** (Fallback)

```bash
RATE_LIMIT_WINDOW_MS=900000                # 15 menit
RATE_LIMIT_MAX_REQUESTS=100                # 100 requests per 15 menit
```

## Contoh Konfigurasi untuk Production

### **Development Environment:**

```bash
# Development - Rate limiting disabled atau sangat tinggi
NODE_ENV=development
EMAIL_RATE_LIMIT_MAX_REQUESTS=1000
EMAIL_RATE_LIMIT_MAX_REQUESTS_HOURLY=100
AUTH_RATE_LIMIT_MAX_REQUESTS=1000
API_RATE_LIMIT_MAX_REQUESTS=10000
```

### **Production Environment:**

```bash
# Production - Rate limiting aktif dengan batas wajar
NODE_ENV=production
EMAIL_RATE_LIMIT_MAX_REQUESTS=10           # 10 email per hari
EMAIL_RATE_LIMIT_MAX_REQUESTS_HOURLY=3     # 3 email per jam
AUTH_RATE_LIMIT_MAX_REQUESTS=20            # 20 login attempts per 15 menit
API_RATE_LIMIT_MAX_REQUESTS=200            # 200 API calls per 15 menit
```

### **High Traffic Production:**

```bash
# High Traffic - Rate limiting lebih tinggi
NODE_ENV=production
EMAIL_RATE_LIMIT_MAX_REQUESTS=50           # 50 email per hari
EMAIL_RATE_LIMIT_MAX_REQUESTS_HOURLY=10    # 10 email per jam
AUTH_RATE_LIMIT_MAX_REQUESTS=50            # 50 login attempts per 15 menit
API_RATE_LIMIT_MAX_REQUESTS=500            # 500 API calls per 15 menit
```

## Implementasi di Code

### **Email Rate Limiting (Dual Layer):**

```typescript
// Router menggunakan kedua rate limiting
this.router.post(
  "/forgot-password",
  emailRateLimitHourly, // Hourly limit first
  emailRateLimit, // Daily limit second
  validateBody(forgotPasswordSchema),
  this.authController.forgotPasswordController
);
```

### **Rate Limiting Response:**

```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "retryAfter": 3600
}
```

## Keuntungan Konfigurasi Fleksibel

### 1. **Per Hari vs Per Jam**

- **Daily Limit**: Mencegah spam jangka panjang
- **Hourly Limit**: Mencegah burst attacks
- **Dual Protection**: Lebih aman dari abuse

### 2. **Environment Specific**

- **Development**: Rate limiting disabled atau sangat tinggi
- **Production**: Rate limiting aktif dengan batas wajar
- **High Traffic**: Rate limiting dapat ditingkatkan

### 3. **Easy Configuration**

- Tidak perlu mengubah code
- Cukup update environment variables
- Deploy tanpa restart aplikasi

## Monitoring Rate Limiting

### **Headers yang Dikembalikan:**

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 2025-01-20T10:00:00.000Z
```

### **Log Rate Limiting:**

```typescript
// Rate limiting info tersedia di request
req.rateLimit = {
  limit: 10,
  remaining: 7,
  resetTime: 1760904000000,
};
```

## Best Practices

### 1. **Email Rate Limiting:**

- **Daily**: 10-50 emails per day per IP/user
- **Hourly**: 3-10 emails per hour per IP/user
- **Reason**: Email adalah resource yang mahal

### 2. **Auth Rate Limiting:**

- **Window**: 15 menit
- **Max**: 20-50 attempts per window
- **Reason**: Mencegah brute force attacks

### 3. **API Rate Limiting:**

- **Window**: 15 menit
- **Max**: 200-500 requests per window
- **Reason**: Mencegah API abuse

### 4. **Search Rate Limiting:**

- **Window**: 1 menit
- **Max**: 30-100 searches per window
- **Reason**: Search adalah operasi yang mahal

## Troubleshooting

### **Rate Limit Hit:**

1. Cek environment variables
2. Cek `NODE_ENV` setting
3. Cek rate limit headers
4. Tunggu reset time

### **Too Restrictive:**

1. Increase `*_MAX_REQUESTS` values
2. Decrease `*_WINDOW_MS` values
3. Check if in development mode

### **Too Permissive:**

1. Decrease `*_MAX_REQUESTS` values
2. Increase `*_WINDOW_MS` values
3. Ensure `NODE_ENV=production`

## Status

- ✅ **Rate limiting configurable via env vars**
- ✅ **Dual layer email rate limiting**
- ✅ **Environment-specific configuration**
- ✅ **Easy production deployment**
- ✅ **Comprehensive monitoring**
