# API Routes Quick Reference

## Base URL: `http://localhost:5000/api`

### Public Routes (No Auth Required)

```
GET    /health                           # Health check
GET    /api/products                     # Get all products (with filters)
GET    /api/products/:id                 # Get single product
GET    /api/products/brands              # Get all brands
GET    /api/categories                   # Get all categories
GET    /api/categories/:id               # Get single category
POST   /api/auth/register                # Register user
POST   /api/auth/login                   # Login user
POST   /api/promo-codes/validate         # Validate promo code
```

### Protected Routes (Auth Required - Customer)

```
GET    /api/auth/me                      # Get current user
PUT    /api/auth/profile                 # Update profile
GET    /api/auth/cart                    # Get cart
POST   /api/auth/cart                    # Add to cart
PUT    /api/auth/cart/:itemId            # Update cart item
DELETE /api/auth/cart/:itemId            # Remove from cart
POST   /api/orders                       # Create order
GET    /api/orders/my                    # Get my orders
GET    /api/orders/:id                   # Get single order
POST   /api/payments/create-intent       # Create payment intent
```

### Admin Routes (Auth Required - Admin Role)

```
# Products
POST   /api/products                     # Create product
PUT    /api/products/:id                 # Update product
DELETE /api/products/:id                 # Delete product

# Categories
POST   /api/categories                   # Create category
PUT    /api/categories/:id               # Update category
DELETE /api/categories/:id               # Delete category

# Orders
GET    /api/orders                       # Get all orders (with filters)
PUT    /api/orders/:id/status            # Update order status

# Promo Codes
GET    /api/promo-codes                  # Get all promo codes
GET    /api/promo-codes/:id              # Get single promo code
POST   /api/promo-codes                  # Create promo code
PUT    /api/promo-codes/:id              # Update promo code
DELETE /api/promo-codes/:id              # Delete promo code

# Admin Dashboard
GET    /api/admin/stats                  # Get dashboard statistics
GET    /api/admin/users                  # Get all users
PUT    /api/admin/users/:id/role         # Update user role
```

---

## Quick Test Examples

### Using cURL

```bash
# 1. Health Check
curl http://localhost:5000/health

# 2. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# 3. Login (save the token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# 4. Get Products
curl http://localhost:5000/api/products

# 5. Get Profile (use token from login)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 6. Add to Cart
curl -X POST http://localhost:5000/api/auth/cart \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"productId":"PRODUCT_ID","quantity":1,"size":"42","color":"Black"}'

# 7. Create Order
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "items":[{"product":"PRODUCT_ID","quantity":1,"size":"42","color":"Black"}],
    "shippingAddress":{
      "fullName":"John Doe",
      "address":"123 Main St",
      "city":"Lahore",
      "state":"Punjab",
      "zipCode":"54000",
      "country":"Pakistan",
      "phone":"+92 300 1234567"
    },
    "paymentMethod":"stripe",
    "paymentIntentId":"pi_xxxxx"
  }'

# 8. Validate Promo Code (public)
curl -X POST http://localhost:5000/api/promo-codes/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"SAVE20","subtotal":10000}'

# 9. Admin - Get Stats (use admin token)
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# 10. Admin - Create Product
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Test Product",
    "brand":"Nike",
    "price":7999,
    "description":"Test description",
    "sizes":["42","43"],
    "colors":["Black"],
    "stock":10,
    "category":"CATEGORY_ID",
    "images":["data:image/jpeg;base64,BASE64_STRING"]
  }'
```

---

## Using Browser or Postman

### 1. Health Check
```
GET http://localhost:5000/health
```

### 2. Register User
```
POST http://localhost:5000/api/auth/register
Body (JSON):
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Login
```
POST http://localhost:5000/api/auth/login
Body (JSON):
{
  "email": "john@example.com",
  "password": "password123"
}
```
*Copy the token from response*

### 4. Get Products (with filters)
```
GET http://localhost:5000/api/products?page=1&limit=12&featured=true&sortBy=price&sortOrder=asc
```

### 5. Get Single Product
```
GET http://localhost:5000/api/products/PRODUCT_ID
```

### 6. Add to Cart
```
POST http://localhost:5000/api/auth/cart
Headers:
  Authorization: Bearer YOUR_TOKEN
Body (JSON):
{
  "productId": "PRODUCT_ID",
  "quantity": 1,
  "size": "42",
  "color": "Black"
}
```

### 7. Create Payment Intent
```
POST http://localhost:5000/api/payments/create-intent
Headers:
  Authorization: Bearer YOUR_TOKEN
Body (JSON):
{
  "amount": 8999.50,
  "currency": "pkr",
  "description": "Thrifty Steps Order"
}
```

### 8. Create Order
```
POST http://localhost:5000/api/orders
Headers:
  Authorization: Bearer YOUR_TOKEN
Body (JSON):
{
  "items": [
    {
      "product": "PRODUCT_ID",
      "quantity": 1,
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

---

## Admin Operations

### Create Category
```
POST http://localhost:5000/api/categories
Headers:
  Authorization: Bearer ADMIN_TOKEN
Body (JSON):
{
  "name": "Sneakers"
}
```

### Create Promo Code
```
POST http://localhost:5000/api/promo-codes
Headers:
  Authorization: Bearer ADMIN_TOKEN
Body (JSON):
{
  "code": "SAVE20",
  "description": "20% off on orders above 5000",
  "discountType": "percentage",
  "discountValue": 20,
  "minPurchaseAmount": 5000,
  "maxDiscountAmount": 2000,
  "validFrom": "2024-01-01",
  "validUntil": "2024-12-31",
  "usageLimit": 100,
  "isActive": true
}
```

### Update Order Status
```
PUT http://localhost:5000/api/orders/ORDER_ID/status
Headers:
  Authorization: Bearer ADMIN_TOKEN
Body (JSON):
{
  "orderStatus": "shipped",
  "paymentStatus": "paid"
}
```

### Get Admin Stats
```
GET http://localhost:5000/api/admin/stats
Headers:
  Authorization: Bearer ADMIN_TOKEN
```

---

## Important Notes

1. **Authentication**: Include `Authorization: Bearer <token>` header for protected routes
2. **Admin Access**: User must have `role: "admin"` in database
3. **Base64 Images**: Product images should be base64 encoded strings
4. **Pagination**: Default page=1, limit=12 (or 20 for admin routes)
5. **Date Format**: Use ISO format or simple date strings like "2024-01-01"

---

## Testing Sequence

1. ✅ `GET /health` - Verify server is running
2. ✅ `POST /api/auth/register` - Create test user
3. ✅ `POST /api/auth/login` - Get token
4. ✅ `GET /api/products` - View products
5. ✅ `POST /api/auth/cart` - Add to cart (requires login)
6. ✅ `POST /api/payments/create-intent` - Create payment intent
7. ✅ `POST /api/orders` - Create order
8. ✅ `GET /api/orders/my` - View orders

For Admin:
1. ✅ Update user role to admin in database
2. ✅ Login as admin to get admin token
3. ✅ `POST /api/categories` - Create category
4. ✅ `POST /api/products` - Create product
5. ✅ `POST /api/promo-codes` - Create promo code
6. ✅ `GET /api/admin/stats` - View dashboard stats
