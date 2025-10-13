# Production User Credentials

## Database Seeding Status

✅ **Production database has been seeded successfully**

The following user accounts are available in the production database:

## Available Accounts

### Admin Account

- **Email**: `admin@kawane.com`
- **Password**: `Admin123!`
- **Role**: ADMIN
- **Status**: Verified

### Staff Account

- **Email**: `staff@kawane.com`
- **Password**: `Staff123!`
- **Role**: STAFF
- **Status**: Verified

### Customer Accounts

1. **Test Customer**

   - **Email**: `customer@kawane.com`
   - **Password**: `Customer123!`
   - **Role**: CUSTOMER
   - **Status**: Verified

2. **John Doe**

   - **Email**: `john@example.com`
   - **Password**: `Customer123!`
   - **Role**: CUSTOMER
   - **Status**: Verified

3. **Jane Smith**

   - **Email**: `jane@example.com`
   - **Password**: `Customer123!`
   - **Role**: CUSTOMER
   - **Status**: Verified

4. **Budi Santoso**

   - **Email**: `budi@example.com`
   - **Password**: `Customer123!`
   - **Role**: CUSTOMER
   - **Status**: Verified

5. **Sari Indah**
   - **Email**: `sari@example.com`
   - **Password**: `Customer123!`
   - **Role**: CUSTOMER
   - **Status**: Verified

## Testing Login

### Using cURL

```bash
# Test Admin Login
curl -X POST https://kawane-be.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@kawane.com", "password": "Admin123!"}'

# Test Customer Login
curl -X POST https://kawane-be.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@kawane.com", "password": "Customer123!"}'
```

### Expected Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "message": "Login successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "name": "Admin Kawane",
      "email": "admin@kawane.com",
      "role": "ADMIN",
      "isVerified": true,
      "avatar": "..."
    }
  }
}
```

## Troubleshooting Login Issues

### If you get "Incorrect email or password" error:

1. **Clear Browser Cache**

   - Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
   - Select "Cached images and files"
   - Clear cache

2. **Hard Refresh**

   - Press `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)

3. **Check Credentials**

   - Make sure email is exactly: `admin@kawane.com` (lowercase)
   - Make sure password is exactly: `Admin123!` (case-sensitive)
   - Check for extra spaces

4. **Try in Incognito/Private Mode**

   - Open browser in incognito mode
   - Navigate to https://kawane-fe.vercel.app/auth/sign-in/
   - Try logging in

5. **Check Network Tab**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try logging in
   - Check the request/response for `/api/auth/login`

### If the issue persists:

1. **Re-seed the database** (if needed):

   ```bash
   curl -X POST https://kawane-be.vercel.app/api/admin-tools/seed-users
   ```

2. **Verify backend is working**:
   ```bash
   curl https://kawane-be.vercel.app/api/health
   ```

## Frontend URL

- **Production**: https://kawane-fe.vercel.app/auth/sign-in/

## Backend URL

- **Production**: https://kawane-be.vercel.app/api

## Important Notes

- All passwords are case-sensitive
- Email addresses must be lowercase
- Make sure to clear browser cache if you were testing before the database was seeded
- The frontend uses `NEXT_PUBLIC_API_URL` environment variable which is already configured in Vercel

## Last Updated

- Date: 2025-10-13
- Seeding Status: ✅ Completed
- Backend Status: ✅ Working
- CORS Status: ✅ Configured
