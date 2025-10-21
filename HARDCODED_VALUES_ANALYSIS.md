# Backend Hardcoded Values Analysis

## 🔍 Analisis Hardcoded Values di Backend

### **1. Configuration Values (config.ts)**

#### **Default Values yang Hardcoded:**

```typescript
// Server Configuration
PORT: parseInt(process.env.PORT || "8000"); // Default port 8000
NODE_ENV: process.env.NODE_ENV || "development"; // Default development
CORS_ORIGIN: process.env.BASE_URL_FE || "http://localhost:3000"; // Default localhost:3000

// JWT Configuration
JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "120m"; // Default 120 minutes

// Redis Configuration
REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379"; // Default localhost:6379
REDIS_DB: parseInt(process.env.REDIS_DB || "0"); // Default database 0

// Rate Limiting Defaults
RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"); // 15 minutes
RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"); // 100 requests
RATE_LIMIT_AUTH_MAX: parseInt(process.env.RATE_LIMIT_AUTH_MAX || "10"); // 10 auth attempts

// Email Rate Limiting
EMAIL_RATE_LIMIT_WINDOW_MS: parseInt(
  process.env.EMAIL_RATE_LIMIT_WINDOW_MS || "86400000"
); // 24 hours
EMAIL_RATE_LIMIT_MAX_REQUESTS: parseInt(
  process.env.EMAIL_RATE_LIMIT_MAX_REQUESTS || "10"
); // 10 emails/day
EMAIL_RATE_LIMIT_WINDOW_MS_HOURLY: process.env
  .EMAIL_RATE_LIMIT_WINDOW_MS_HOURLY || "3600000"; // 1 hour
EMAIL_RATE_LIMIT_MAX_REQUESTS_HOURLY: parseInt(
  process.env.EMAIL_RATE_LIMIT_MAX_REQUESTS_HOURLY || "5"
); // 5 emails/hour

// Auth Rate Limiting
AUTH_RATE_LIMIT_WINDOW_MS: parseInt(
  process.env.AUTH_RATE_LIMIT_WINDOW_MS || "900000"
); // 15 minutes
AUTH_RATE_LIMIT_MAX_REQUESTS: parseInt(
  process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || "20"
); // 20 auth attempts

// API Rate Limiting
API_RATE_LIMIT_WINDOW_MS: parseInt(
  process.env.API_RATE_LIMIT_WINDOW_MS || "900000"
); // 15 minutes
API_RATE_LIMIT_MAX_REQUESTS: parseInt(
  process.env.API_RATE_LIMIT_MAX_REQUESTS || "200"
); // 200 API calls

// Search Rate Limiting
SEARCH_RATE_LIMIT_WINDOW_MS: parseInt(
  process.env.SEARCH_RATE_LIMIT_WINDOW_MS || "60000"
); // 1 minute
SEARCH_RATE_LIMIT_MAX_REQUESTS: parseInt(
  process.env.SEARCH_RATE_LIMIT_MAX_REQUESTS || "30"
); // 30 searches
```

### **2. Email Configuration (mailer.ts)**

#### **Hardcoded SMTP Settings:**

```typescript
// SMTP Configuration
host: "smtp.gmail.com"; // Hardcoded Gmail SMTP
port: 587; // Hardcoded port 587
secure: false; // Hardcoded TLS setting

// Connection Pool Settings
pool: true; // Hardcoded connection pooling
maxConnections: 5; // Hardcoded max connections
maxMessages: 100; // Hardcoded max messages
rateDelta: 20000; // Hardcoded rate delta (20 seconds)
rateLimit: 5; // Hardcoded rate limit (5 messages)
```

### **3. Authentication Service (register.service.ts)**

#### **Hardcoded Values:**

```typescript
// JWT Token Expiration
expiresIn: "60m"; // Hardcoded 60 minutes for verification token

// Email Template
from: "Kawane Studio <noreply@kawanestudio.com>"; // Hardcoded sender
subject: "Welcome to Kawane Studio - Please verify your email"; // Hardcoded subject

// Template Path
templatePath: path.resolve(__dirname, "../../templates", "verif-email.hbs"); // Hardcoded path
```

### **4. Validation Schemas (validation-schemas.ts)**

#### **Hardcoded Limits:**

```typescript
// Deal Validation
title: z.string().min(1, "Title is required").max(100, "Title too long"); // Max 100 chars
description: z.string().max(500, "Description too long").optional(); // Max 500 chars
productName: z.string()
  .min(1, "Product name is required")
  .max(100, "Product name too long"); // Max 100 chars
productDescription: z.string()
  .max(1000, "Product description too long")
  .optional(); // Max 1000 chars
productSku: z.string()
  .min(3, "SKU must be at least 3 characters")
  .max(50, "SKU too long"); // 3-50 chars

// Settings Validation
userLoginRateLimit: z.number().min(1).max(10000).optional(); // Max 10000 login attempts
```

## 🎯 Rekomendasi untuk Environment Variables

### **Values yang Sebaiknya Di-Environment:**

#### **1. Email Configuration:**

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_POOL_MAX_CONNECTIONS=5
EMAIL_POOL_MAX_MESSAGES=100
EMAIL_RATE_DELTA=20000
EMAIL_RATE_LIMIT=5
```

#### **2. JWT Configuration:**

```bash
JWT_VERIFICATION_EXPIRES_IN=60m
JWT_SESSION_EXPIRES_IN=120m
```

#### **3. Email Templates:**

```bash
EMAIL_FROM_NAME=Kawane Studio
EMAIL_FROM_ADDRESS=noreply@kawanestudio.com
EMAIL_VERIFICATION_SUBJECT=Welcome to Kawane Studio - Please verify your email
```

#### **4. Validation Limits:**

```bash
MAX_TITLE_LENGTH=100
MAX_DESCRIPTION_LENGTH=500
MAX_PRODUCT_NAME_LENGTH=100
MAX_PRODUCT_DESCRIPTION_LENGTH=1000
MIN_SKU_LENGTH=3
MAX_SKU_LENGTH=50
MAX_LOGIN_ATTEMPTS=10000
```

## ✅ Values yang Sudah Baik (Environment-based):

- Database URLs
- JWT Secret
- Cloudinary credentials
- Google OAuth credentials
- Midtrans credentials
- Redis configuration
- Rate limiting configurations

## 🚨 Values yang Perlu Diperhatikan:

1. **SMTP Host**: Hardcoded ke Gmail, sebaiknya bisa dikonfigurasi
2. **Email Templates**: Path dan content hardcoded
3. **Validation Limits**: Sebaiknya bisa dikonfigurasi per environment
4. **Default URLs**: Localhost hardcoded sebagai fallback

## 📊 Summary:

- **Total Hardcoded Values**: ~25 values
- **Critical**: 8 values (SMTP, JWT expiration, email templates)
- **Medium Priority**: 12 values (rate limits, validation limits)
- **Low Priority**: 5 values (default ports, fallback URLs)

**Rekomendasi**: Pindahkan critical dan medium priority values ke environment variables untuk fleksibilitas deployment.

