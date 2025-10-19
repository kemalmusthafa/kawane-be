# 🔧 Solusi Masalah Forgot Password

## Masalah yang Ditemukan

Error: `"Email not registered!"` saat menggunakan forgot password

## Penyebab

1. **Email yang digunakan tidak ada di database**
2. **Rate limiting yang terlalu ketat** (3 email per jam)

## Solusi yang Telah Diterapkan

### 1. ✅ Rate Limiting Diperbaiki

- Development: 100 email per jam (atau skip rate limiting)
- Production: 3 email per jam (untuk keamanan)

### 2. ✅ Email yang Tersedia di Database

Gunakan salah satu email berikut untuk test forgot password:

- `test@kawane.com`
- `admin@kawane.com`
- `customer@kawane.com`
- `john@example.com`
- `jane@example.com`
- `budi@example.com`
- `sari@example.com`
- `kemalmusthafa80@gmail.com`
- `razorrevenge911@gmail.com`
- `jalasveva25@gmail.com`

### 3. ✅ API Endpoint Sudah Benar

- URL: `https://kawane-be.vercel.app/api/auth/forgot-password`
- Method: POST
- Body: `{"email": "email@example.com"}`

## Test Forgot Password

### Manual Test dengan cURL:

```bash
curl -X POST https://kawane-be.vercel.app/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@kawane.com"}'
```

### Response Sukses:

```json
{
  "success": true,
  "message": "Password reset email sent",
  "data": {
    "message": "Password reset email sent successfully",
    "previewUrl": false,
    "resetLink": "https://kawane-fe.vercel.app/reset-password/[TOKEN]"
  }
}
```

### Response Error:

```json
{
  "success": false,
  "message": "Email not registered!"
}
```

## Troubleshooting

### Jika masih error "Email not registered!":

1. Pastikan email yang digunakan ada di database
2. Cek dengan script debug: `node debug-forgot-password.js`

### Jika error "Too many requests":

1. Tunggu 1 jam atau gunakan IP berbeda
2. Rate limiting sudah diperbaiki untuk development

### Jika error network:

1. Pastikan URL API benar: `https://kawane-be.vercel.app/api/auth/forgot-password`
2. Cek koneksi internet

## Status

- ✅ **API forgot password berfungsi**
- ✅ **Rate limiting diperbaiki**
- ✅ **Email template sudah benar**
- ✅ **Reset link sudah benar**

## Next Steps

1. Test dengan email yang ada di database
2. Jika perlu, buat user baru dengan registrasi
3. Gunakan reset link yang diberikan untuk reset password
