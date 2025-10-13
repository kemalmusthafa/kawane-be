# Admin Tools Endpoints Documentation

## Overview

Admin tools endpoints are production-ready utilities available in **all environments** (development, staging, production) with **admin authentication** required. These tools help manage production issues and maintain data integrity.

## Authentication

All admin tool endpoints require:

- Valid JWT token in Authorization header: `Bearer <token>`
- User must have `ADMIN` role

## Available Endpoints

### 1. Rate Limit Management

#### Clear Rate Limit for Specific IP

```
POST /api/admin-tools/rate-limit/clear/:ip
```

Clears rate limit for a specific IP address.

**Response:**

```json
{
  "success": true,
  "message": "Rate limit cleared for IP: 192.168.1.1"
}
```

#### Clear All Rate Limits

```
POST /api/admin-tools/rate-limit/clear-all
```

Clears all rate limits across the system.

**Response:**

```json
{
  "success": true,
  "message": "All rate limits cleared"
}
```

#### Get Rate Limit Status

```
GET /api/admin-tools/rate-limit/status/:ip
```

Gets current rate limit status for a specific IP.

**Response:**

```json
{
  "success": true,
  "data": {
    "ip": "192.168.1.1",
    "remaining": 100,
    "resetTime": "2024-01-01T12:00:00Z"
  }
}
```

### 2. Health Check

```
GET /api/admin-tools/health
```

Returns admin tools server status and environment information.

**Response:**

```json
{
  "success": true,
  "message": "Admin tools server is running",
  "environment": "production",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 3. Data Integrity Management

#### Fix Orders Without Payment Records

```
POST /api/admin-tools/fix-orders-payments
```

Automatically creates payment records for orders that don't have them.

**Response:**

```json
{
  "success": true,
  "message": "Fixed 5 orders",
  "data": {
    "totalOrders": 5,
    "fixedPayments": 5,
    "payments": [
      {
        "orderId": "order_1",
        "paymentId": "payment_1",
        "amount": 100000
      }
    ]
  }
}
```

## Usage Examples

### Using with curl

```bash
# Get admin token first (login as admin)
curl -X POST https://kawane-be.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'

# Use the token for admin tool endpoints
curl -X GET https://kawane-be.vercel.app/api/admin-tools/health \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Using with JavaScript/Fetch

```javascript
const response = await fetch("https://kawane-be.vercel.app/api/admin-tools/health", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${adminToken}`,
    "Content-Type": "application/json",
  },
});

const data = await response.json();
console.log(data);
```

## Security Notes

1. **Admin Only**: All endpoints require admin authentication
2. **Production Safe**: These endpoints are safe to use in production as they require admin privileges
3. **Rate Limiting**: Rate limit management endpoints help resolve production issues
4. **Data Integrity**: Order fixing endpoints help maintain data consistency
5. **Essential Tools**: Only production-essential functions are included (development-only features removed)

## Environment Availability

- ✅ **Development**: Full access
- ✅ **Staging**: Full access with admin auth
- ✅ **Production**: Full access with admin auth

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP status codes:

- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `400`: Bad Request (invalid parameters)
- `500`: Internal Server Error
