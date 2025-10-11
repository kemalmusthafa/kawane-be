# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

Jika Anda menemukan kerentanan keamanan dalam proyek ini, silakan laporkan dengan cara berikut:

### 1. **JANGAN** buat issue publik
Kerentanan keamanan tidak boleh dilaporkan melalui GitHub Issues publik.

### 2. Email langsung
Kirim email ke: `security@kawanestudio.com`

### 3. Informasi yang diperlukan
Sertakan informasi berikut dalam laporan Anda:
- Deskripsi kerentanan
- Langkah-langkah untuk mereproduksi
- Dampak potensial
- Saran perbaikan (jika ada)

### 4. Response time
Kami akan merespons dalam waktu 48 jam dan memberikan update berkala.

## Security Measures

### Authentication & Authorization
- JWT tokens dengan expiration time
- Password hashing dengan bcrypt
- Role-based access control (RBAC)
- Rate limiting untuk mencegah brute force

### Data Protection
- Input validation dengan Zod schemas
- SQL injection prevention dengan Prisma ORM
- CORS configuration yang ketat
- Environment variables untuk sensitive data

### API Security
- Request rate limiting
- Input sanitization
- Error handling yang tidak expose sensitive info
- HTTPS enforcement di production

### Database Security
- Connection pooling
- Prepared statements
- Database access logging
- Regular security updates

## Security Checklist

- [ ] Environment variables tidak ter-commit
- [ ] Database credentials aman
- [ ] API endpoints protected
- [ ] Input validation implemented
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Error handling secure
- [ ] Dependencies updated
- [ ] Security headers set
- [ ] Logging implemented

## Best Practices

1. **Never commit sensitive data**
2. **Use environment variables for configuration**
3. **Validate all inputs**
4. **Implement proper error handling**
5. **Keep dependencies updated**
6. **Use HTTPS in production**
7. **Implement proper logging**
8. **Regular security audits**

## Contact

Untuk pertanyaan keamanan lainnya, hubungi:
- Email: security@kawanestudio.com
- GitHub: [@kawanestudio](https://github.com/kawanestudio)
