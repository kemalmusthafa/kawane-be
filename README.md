# Kawane Studio Backend API

Backend API untuk aplikasi e-commerce Kawane Studio yang dibangun dengan Node.js, Express, TypeScript, dan Prisma.

## 🚀 Fitur Utama

- **Authentication & Authorization** - JWT-based auth dengan role management
- **Product Management** - CRUD produk dengan kategori dan gambar
- **Order System** - Sistem pemesanan lengkap dengan payment integration
- **Deal System** - Sistem diskon dan flash sale dengan expiration otomatis
- **Cart & Wishlist** - Keranjang belanja dan wishlist
- **Payment Integration** - Integrasi dengan Midtrans
- **Inventory Management** - Manajemen stok dengan monitoring
- **Analytics & Reports** - Dashboard analytics dan laporan
- **Notification System** - Sistem notifikasi untuk admin dan customer

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL dengan Prisma ORM
- **Authentication**: JWT
- **Payment**: Midtrans
- **Caching**: Redis
- **File Upload**: Multer
- **Email**: Nodemailer

## 📦 Installation

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp env.example .env
   # Edit .env dengan konfigurasi yang sesuai
   ```

4. **Setup database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

Buat file `.env` berdasarkan `env.example`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database"

# JWT
JWT_SECRET="your-jwt-secret"

# Midtrans
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
MIDTRANS_IS_PRODUCTION=false

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# Server
PORT=8000
NODE_ENV=development
```

## 🗄️ Database Schema

Database menggunakan PostgreSQL dengan Prisma ORM. Schema utama:

- **Users** - Data pengguna dan admin
- **Products** - Data produk dengan kategori
- **Orders** - Data pesanan dengan items
- **Deals** - Sistem diskon dan flash sale
- **Cart** - Keranjang belanja
- **Wishlist** - Daftar keinginan
- **Payments** - Data pembayaran
- **Notifications** - Sistem notifikasi

## 🚀 API Endpoints

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Deals

- `GET /api/deals` - Get all active deals
- `GET /api/deals/:id` - Get deal by ID
- `POST /api/deals` - Create deal (Admin)
- `PUT /api/deals/:id` - Update deal (Admin)
- `DELETE /api/deals/:id` - Delete deal (Admin)

### Orders

- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID

### Cart

- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart

## 🔄 Deal System

Sistem deal dengan fitur:

- **Automatic Expiration** - Deal expired otomatis setiap jam
- **Price Calculation** - Harga diskon otomatis di cart dan checkout
- **Flash Sale** - Support untuk flash sale dengan countdown
- **Cleanup** - Pembersihan otomatis deal lama

### Deal Types

- **PERCENTAGE** - Diskon persentase
- **FIXED_AMOUNT** - Diskon nominal tetap
- **FLASH_SALE** - Flash sale dengan harga khusus

## 📊 Monitoring & Analytics

- **Stock Monitoring** - Monitoring stok produk
- **Deal Expiration** - Monitoring deal yang expired
- **Order Analytics** - Analytics pesanan
- **User Analytics** - Analytics pengguna

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

1. **Build production**

   ```bash
   npm run build
   ```

2. **Start production server**

   ```bash
   npm start
   ```

3. **Docker deployment**
   ```bash
   docker build -t kawane-backend .
   docker run -p 8000:8000 kawane-backend
   ```

## 📝 Scripts

- `npm run dev` - Development server
- `npm run build` - Build production
- `npm start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run linter

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini.
