# 🔧 Panduan Perbaikan Email Verifikasi Kawane Studio

## Masalah yang Ditemukan

Error: `535 Authentication failed` - Gmail authentication gagal

## Penyebab

Gmail memerlukan App Password khusus untuk aplikasi, bukan password biasa.

## Solusi

### 1. Aktifkan 2-Factor Authentication (2FA)

1. Buka [Google Account Security](https://myaccount.google.com/security)
2. Login dengan akun Gmail Anda
3. Aktifkan **2-Step Verification**

### 2. Buat App Password

1. Setelah 2FA aktif, buka [App Passwords](https://myaccount.google.com/apppasswords)
2. Pilih **Mail** dan **Other (Custom name)**
3. Masukkan nama: "Kawane Studio"
4. Copy App Password yang dihasilkan (format: xxxx xxxx xxxx xxxx)

### 3. Update File .env

Ganti `MAIL_PASS` dengan App Password yang baru:

```env
MAIL_USER="kemalmusthafa80@gmail.com"
MAIL_PASS="xxxx xxxx xxxx xxxx"  # Ganti dengan App Password
```

### 4. Test Email

Jalankan test email:

```bash
node test-email-verification.js
```

## Alternatif: Gunakan Email Service Lain

Jika Gmail bermasalah, bisa menggunakan:

- **SendGrid** (gratis 100 email/hari)
- **Mailgun** (gratis 5,000 email/bulan)
- **Resend** (gratis 3,000 email/bulan)

## Troubleshooting

### Jika masih error:

1. Pastikan 2FA aktif
2. Pastikan App Password benar
3. Cek spam folder
4. Coba buat App Password baru

### Log untuk Debug:

```bash
# Cek log email transporter
npm run dev
# Lihat console untuk pesan email
```

## Status

- ✅ Template email sudah benar
- ✅ BASE_URL_FE sudah diperbaiki
- ✅ Error handling sudah ditambahkan
- ❌ Gmail authentication perlu diperbaiki
