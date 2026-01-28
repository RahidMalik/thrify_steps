# Admin Scenario & Implementation Guide

## Overview

The admin system provides a comprehensive dashboard for managing the Thrifty Steps e-commerce platform. Admin users have elevated privileges to manage products, orders, users, promo codes, and view analytics.

## Admin User Creation

### Default Role Assignment
- **By default**, all new users are created with role `'customer'`
- Users are registered via `/api/auth/register` and automatically assigned `role: 'customer'`
- This is defined in the User model: `role: { type: String, enum: ['admin', 'customer'], default: 'customer' }`

### How to Create an Admin User

There are **two methods** to create an admin user:

#### Method 1: Database Update (Recommended for Initial Setup)

1. **Register a user normally** through the frontend registration form
2. **Update the user in MongoDB** directly:

```javascript
// Using MongoDB Shell or MongoDB Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or using MongoDB Compass:
- Connect to your database
- Navigate to the `users` collection
- Find the user by email
- Edit the `role` field from `"customer"` to `"admin"`
- Save

#### Method 2: Using Admin API (Requires Existing Admin)

If you already have an admin user, you can use the admin API:

```bash
# Update user role to admin
PUT /api/admin/users/:id/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "admin"
}
```

**Note:** This method requires you to already be logged in as an admin.

## Admin Authentication & Authorization

### Authentication Flow

1. **User logs in** with their credentials via `/api/auth/login`
2. **JWT token is generated** containing the user ID
3. **User object is returned** including the `role` field
4. **Frontend stores token** and user data in AuthContext

### Authorization Middleware

The admin routes use two layers of middleware:

```javascript
// backend/src/routes/admin.routes.js
router.use(protect, admin);  // First authenticate, then check admin role
```

1. **`protect` middleware**: Verifies JWT token and attaches user to `req.user`
2. **`admin` middleware**: Checks if `req.user.role === 'admin'`

```javascript
// backend/src/middlewares/admin.middleware.js
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return sendError(res, 403, 'Access denied. Admin only.');
  }
};
```

### Frontend Route Protection

```typescript
// frontend/src/pages/Admin.tsx
useEffect(() => {
  if (!user) {
    navigate("/login");
  } else if (!isAdmin) {
    toast.error("Access denied. Admin privileges required.");
    navigate("/");
  }
}, [user, isAdmin, navigate]);
```

## Admin Features

### 1. Dashboard (AdminStats)
**Route:** `/admin` or `/admin/`  
**API:** `GET /api/admin/stats`

**Features:**
- **Overview Metrics:**
  - Total Users
  - Total Products (active)
  - Total Categories (active)
  - Total Orders
  
- **Revenue Analytics:**
  - Total Revenue (from paid orders)
  - Average Order Value
  - Revenue by Month (last 6 months)
  
- **Order Status Breakdown:**
  - Orders grouped by status (pending, processing, shipped, delivered, cancelled)
  
- **Recent Activity:**
  - Recent Orders (last 5)
  - Low Stock Products (stock ≤ 10)

### 2. Product Management (AdminProducts)
**Route:** `/admin/products`  
**Uses:** Product routes (requires admin middleware on backend)

**Features:**
- **View all products** with pagination
- **Create new products:**
  - Title, description, brand, category
  - Price, stock, sizes, colors
  - Image upload (base64 or Cloudinary)
  - Featured product toggle
- **Edit existing products**
- **Delete products** (soft delete via `isActive: false`)
- **Search and filter products**

### 3. Order Management (AdminOrders)
**Route:** `/admin/orders`  
**Uses:** Order routes (admin endpoints)

**Features:**
- **View all orders** with pagination
- **Filter orders by:**
  - Order status
  - Payment status
  - Date range
- **Update order status:**
  - pending → processing → shipped → delivered
  - Can cancel orders
- **Update payment status:**
  - pending → paid → refunded
- **View order details:**
  - Customer information
  - Items ordered
  - Shipping address
  - Payment information
  - Total amounts

### 4. Promo Code Management (AdminPromoCodes)
**Route:** `/admin/promo-codes`  
**Uses:** Promo code routes (admin endpoints)

**Features:**
- **View all promo codes** with pagination
- **Create promo codes:**
  - Code name (unique)
  - Discount type (percentage or fixed amount)
  - Discount value
  - Minimum purchase amount
  - Maximum discount (for percentage)
  - Usage limit (per user, total uses)
  - Valid from/to dates
  - Active status
- **Edit promo codes**
- **Delete promo codes**
- **View usage statistics**

### 5. User Management (AdminUsers - UI exists but needs implementation)
**Route:** `/admin/users` (referenced in nav but component missing)  
**API:** `GET /api/admin/users`, `PUT /api/admin/users/:id/role`

**Available APIs:**
- **Get all users:**
  ```
  GET /api/admin/users?page=1&limit=20&role=customer
  ```
- **Update user role:**
  ```
  PUT /api/admin/users/:id/role
  Body: { "role": "admin" | "customer" }
  ```

**Note:** The user management UI component needs to be created to match the other admin components.

## Admin Navigation

The admin panel has a sidebar navigation with the following sections:

1. **Dashboard** (`/admin`) - Analytics and overview
2. **Products** (`/admin/products`) - Product CRUD operations
3. **Orders** (`/admin/orders`) - Order management
4. **Promo Codes** (`/admin/promo-codes`) - Discount code management
5. **Users** (`/admin/users`) - User management (API ready, UI pending)

## Admin Access Points

### Navbar Integration

When an admin user is logged in, the Navbar displays:
- User dropdown menu with "Admin Panel" option
- Clicking it navigates to `/admin`

```typescript
// frontend/src/components/layout/Navbar.tsx
{isAdmin && (
  <DropdownMenuItem onClick={() => navigate("/admin")}>
    Admin Panel
  </DropdownMenuItem>
)}
```

## API Endpoints (All Require Admin)

### Admin Routes
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users (with pagination and filtering)
- `PUT /api/admin/users/:id/role` - Update user role

### Product Routes (Admin Only)
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product (soft delete)

### Order Routes (Admin Only)
- `GET /api/orders` - Get all orders (admin view)
- `PUT /api/orders/:id/status` - Update order/payment status

### Promo Code Routes (Admin Only)
- `POST /api/promo-codes` - Create promo code
- `GET /api/promo-codes` - Get all promo codes (admin)
- `PUT /api/promo-codes/:id` - Update promo code
- `DELETE /api/promo-codes/:id` - Delete promo code

## Quick Start: Creating Your First Admin

### Step-by-Step Guide

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Register a regular user:**
   - Go to frontend: `http://localhost:8080/register`
   - Create an account (e.g., `admin@thrifysteps.com`)

3. **Connect to MongoDB:**
   ```bash
   mongosh mongodb://localhost:27017/thrify_kicks
   ```

4. **Update user role to admin:**
   ```javascript
   db.users.updateOne(
     { email: "admin@thrifysteps.com" },
     { $set: { role: "admin" } }
   )
   ```

5. **Log out and log back in:**
   - The user object will now include `role: "admin"`
   - You'll see the "Admin Panel" option in the user menu
   - Navigate to `/admin` to access the dashboard

## Security Considerations

1. **Role-based access control:** All admin routes are protected by middleware
2. **JWT authentication:** Admin privileges are verified on every request
3. **Frontend protection:** UI checks admin status before rendering admin components
4. **Default role:** New users are always created as customers
5. **Role changes:** Only admins can change user roles

## Testing Admin Features

### Using curl

```bash
# 1. Login as admin
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  | jq -r '.data.token')

# 2. Get admin stats
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/api/admin/stats

# 3. Get all users
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/api/admin/users

# 4. Update user role
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}' \
  http://localhost:5001/api/admin/users/USER_ID/role
```

## Current Implementation Status

✅ **Implemented:**
- Admin authentication & authorization
- Dashboard with statistics
- Product management (CRUD)
- Order management (view & update status)
- Promo code management (CRUD)
- Admin route protection (backend & frontend)
- Navbar integration with admin menu

⚠️ **Needs Implementation:**
- User management UI component (`AdminUsers.tsx`)
- Complete the user management section in Admin.tsx routes

## Future Enhancements

Potential admin features to add:
- [ ] Bulk operations (delete multiple products, update multiple orders)
- [ ] Export data (CSV/Excel export for orders, users)
- [ ] Email notifications for order status changes
- [ ] Advanced analytics and reporting
- [ ] Inventory alerts and notifications
- [ ] User activity logs
- [ ] System settings configuration
