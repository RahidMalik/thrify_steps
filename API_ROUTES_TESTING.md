# Thrifty Steps API Routes - Testing Guide

## Base URL
```
http://localhost:5000/api
```

## Authentication

### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "cart": []
    }
  }
}
```

### 2. Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### 4. Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "johnupdated@example.com"
}
```

---

## Cart Management

### 5. Get Cart
```http
GET /api/auth/cart
Authorization: Bearer <token>
```

### 6. Add to Cart
```http
POST /api/auth/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "<product_id>",
  "quantity": 2,
  "size": "42",
  "color": "Black"
}
```

### 7. Update Cart Item
```http
PUT /api/auth/cart/<item_id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

### 8. Remove from Cart
```http
DELETE /api/auth/cart/<item_id>
Authorization: Bearer <token>
```

---

## Products

### 9. Get All Products (Public)
```http
GET /api/products?page=1&limit=12&category=<category_id>&search=sneaker&featured=true&sortBy=price&sortOrder=asc
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)
- `category`: Category ID (optional)
- `brand`: Brand name (optional)
- `minPrice`: Minimum price (optional)
- `maxPrice`: Maximum price (optional)
- `size`: Size filter (optional)
- `color`: Color filter (optional)
- `search`: Search term (optional)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: asc or desc (default: desc)
- `featured`: true/false (optional)

### 10. Get Single Product (Public)
```http
GET /api/products/<product_id>
```

### 11. Get Brands (Public)
```http
GET /api/products/brands
```

### 12. Create Product (Admin)
```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Classic White Sneakers",
  "brand": "Nike",
  "price": 7999,
  "discountPrice": 5999,
  "description": "Premium white leather sneakers with cushioned insole",
  "sizes": ["39", "40", "41", "42", "43"],
  "colors": ["White", "Black"],
  "stock": 50,
  "category": "<category_id>",
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
  ],
  "isFeatured": true
}
```

### 13. Update Product (Admin)
```http
PUT /api/products/<product_id>
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "price": 8999,
  "stock": 30,
  "isFeatured": false
}
```

### 14. Delete Product (Admin - Soft Delete)
```http
DELETE /api/products/<product_id>
Authorization: Bearer <admin_token>
```

---

## Categories

### 15. Get All Categories (Public)
```http
GET /api/categories
```

### 16. Get Single Category (Public)
```http
GET /api/categories/<category_id>
```

### 17. Create Category (Admin)
```http
POST /api/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Sneakers"
}
```

### 18. Update Category (Admin)
```http
PUT /api/categories/<category_id>
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Running Shoes",
  "isActive": true
}
```

### 19. Delete Category (Admin - Soft Delete)
```http
DELETE /api/categories/<category_id>
Authorization: Bearer <admin_token>
```

---

## Orders

### 20. Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product": "<product_id>",
      "quantity": 2,
      "size": "42",
      "color": "Black"
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "address": "123 Main Street",
    "city": "Lahore",
    "state": "Punjab",
    "zipCode": "54000",
    "country": "Pakistan",
    "phone": "+92 300 1234567"
  },
  "paymentMethod": "stripe",
  "paymentIntentId": "pi_xxxxx",
  "promoCode": "SAVE20"
}
```

### 21. Get My Orders
```http
GET /api/orders/my?page=1&limit=10
Authorization: Bearer <token>
```

### 22. Get Single Order
```http
GET /api/orders/<order_id>
Authorization: Bearer <token>
```

### 23. Get All Orders (Admin)
```http
GET /api/orders?page=1&limit=20&orderStatus=pending&paymentStatus=paid
Authorization: Bearer <admin_token>
```

### 24. Update Order Status (Admin)
```http
PUT /api/orders/<order_id>/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "orderStatus": "shipped",
  "paymentStatus": "paid"
}
```

**Order Status Values:**
- `pending`, `processing`, `shipped`, `delivered`, `cancelled`

**Payment Status Values:**
- `pending`, `paid`, `failed`, `refunded`

---

## Payments

### 25. Create Payment Intent
```http
POST /api/payments/create-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 8999.50,
  "currency": "pkr",
  "description": "Thrifty Steps Order"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment intent created",
  "data": {
    "clientSecret": "pi_xxxxx_secret_xxxxx",
    "paymentIntentId": "pi_xxxxx"
  }
}
```

---

## Promo Codes

### 26. Validate Promo Code (Public)
```http
POST /api/promo-codes/validate
Content-Type: application/json

{
  "code": "SAVE20",
  "subtotal": 10000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Promo code is valid",
  "data": {
    "promoCode": {
      "id": "...",
      "code": "SAVE20",
      "discountType": "percentage",
      "discountValue": 20,
      "minPurchaseAmount": 5000,
      "maxDiscountAmount": 2000
    },
    "discount": 2000,
    "subtotal": 10000,
    "finalAmount": 8000
  }
}
```

### 27. Get All Promo Codes (Admin)
```http
GET /api/promo-codes?page=1&limit=20&isActive=true
Authorization: Bearer <admin_token>
```

### 28. Get Single Promo Code (Admin)
```http
GET /api/promo-codes/<promo_code_id>
Authorization: Bearer <admin_token>
```

### 29. Create Promo Code (Admin)
```http
POST /api/promo-codes
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "code": "SAVE20",
  "description": "20% off on orders above 5000",
  "discountType": "percentage",
  "discountValue": 20,
  "minPurchaseAmount": 5000,
  "maxDiscountAmount": 2000,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "usageLimit": 100,
  "isActive": true
}
```

### 30. Update Promo Code (Admin)
```http
PUT /api/promo-codes/<promo_code_id>
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "discountValue": 25,
  "isActive": false
}
```

### 31. Delete Promo Code (Admin - Soft Delete)
```http
DELETE /api/promo-codes/<promo_code_id>
Authorization: Bearer <admin_token>
```

---

## Admin Dashboard

### 32. Get Admin Statistics
```http
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "stats": {
      "overview": {
        "totalUsers": 150,
        "totalProducts": 50,
        "totalCategories": 5,
        "totalOrders": 200
      },
      "revenue": {
        "total": 500000,
        "averageOrderValue": 2500
      },
      "ordersByStatus": {
        "pending": 10,
        "processing": 5,
        "shipped": 20,
        "delivered": 150,
        "cancelled": 15
      },
      "revenueByMonth": [...],
      "recentOrders": [...],
      "lowStockProducts": [...]
    }
  }
}
```

### 33. Get All Users (Admin)
```http
GET /api/admin/users?page=1&limit=20&role=customer
Authorization: Bearer <admin_token>
```

### 34. Update User Role (Admin)
```http
PUT /api/admin/users/<user_id>/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "admin"
}
```

---

## Health Check

### 35. Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Thrifty Steps API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Testing with cURL Examples

### Register and Login Flow
```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# 2. Login (save token from response)
TOKEN="your_token_here"

# 3. Get Profile
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Add to Cart
curl -X POST http://localhost:5000/api/auth/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"<product_id>","quantity":1,"size":"42","color":"Black"}'
```

### Admin Operations
```bash
# Login as admin (get admin token)
ADMIN_TOKEN="admin_token_here"

# Create Category
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Sneakers"}'

# Create Product (with base64 image)
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Test Sneakers",
    "brand":"Nike",
    "price":7999,
    "description":"Test description",
    "sizes":["42","43"],
    "colors":["Black"],
    "stock":10,
    "category":"<category_id>",
    "images":["data:image/jpeg;base64,/9j/4AAQSkZJRg..."]
  }'

# Create Promo Code
curl -X POST http://localhost:5000/api/promo-codes \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code":"TEST20",
    "discountType":"percentage",
    "discountValue":20,
    "minPurchaseAmount":5000,
    "validFrom":"2024-01-01",
    "validUntil":"2024-12-31",
    "isActive":true
  }'
```

---

## Testing with Postman

### Import Collection Format
Create a Postman collection with the following structure:

1. **Authentication**
   - Register
   - Login (save token to environment variable)
   - Get Me
   - Update Profile

2. **Cart**
   - Get Cart
   - Add to Cart
   - Update Cart Item
   - Remove Cart Item

3. **Products**
   - Get All Products
   - Get Product by ID
   - Get Brands
   - Create Product (Admin)
   - Update Product (Admin)
   - Delete Product (Admin)

4. **Orders**
   - Create Order
   - Get My Orders
   - Get Order by ID
   - Get All Orders (Admin)
   - Update Order Status (Admin)

5. **Payments**
   - Create Payment Intent

6. **Promo Codes**
   - Validate Promo Code
   - Get All Promo Codes (Admin)
   - Create Promo Code (Admin)
   - Update Promo Code (Admin)
   - Delete Promo Code (Admin)

7. **Admin**
   - Get Stats
   - Get All Users
   - Update User Role

### Environment Variables
Set these in Postman:
- `base_url`: `http://localhost:5000/api`
- `token`: (from login response)
- `admin_token`: (admin user token)

---

## Quick Test Sequence

1. **Health Check**: `GET /health`
2. **Register**: `POST /api/auth/register`
3. **Login**: `POST /api/auth/login` (save token)
4. **Get Profile**: `GET /api/auth/me` (use token)
5. **Get Products**: `GET /api/products`
6. **Add to Cart**: `POST /api/auth/cart` (use token)
7. **Create Payment Intent**: `POST /api/payments/create-intent` (use token)
8. **Create Order**: `POST /api/orders` (use token)
9. **Get My Orders**: `GET /api/orders/my` (use token)

For Admin testing, use admin token and test:
- Create Category
- Create Product
- Create Promo Code
- Get Admin Stats
- Get All Orders
- Update Order Status

---

## Notes

- All protected routes require `Authorization: Bearer <token>` header
- Admin routes require user with `role: "admin"`
- Images should be base64 encoded strings starting with `data:image/...`
- Dates should be in ISO format or can be date strings like `"2024-01-01"`
- Pagination defaults: `page=1`, `limit=12` or `limit=20` for admin routes
