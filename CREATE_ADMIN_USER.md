# Create Admin User

## ✅ Admin User Created Successfully!

An admin user has been created with the following credentials:

**Email:** `admin@thrifysteps.com`  
**Password:** `admin123456`  
**Role:** `admin`

## 🚀 How to Use

### Login to Admin Panel

1. Go to: `http://localhost:8080/login`
2. Enter the credentials:
   - Email: `admin@thrifysteps.com`
   - Password: `admin123456`
3. Click "Sign In"
4. You'll see "Admin Panel" option in the user menu (top right)
5. Navigate to `/admin` to access the admin dashboard

## 🔧 Creating Additional Admin Users

### Method 1: Using the Script (Recommended)

```bash
cd backend
npm run create-admin
```

Or run directly:
```bash
node create-admin.js
```

### Custom Admin Credentials

You can customize the admin credentials by setting environment variables:

```bash
ADMIN_EMAIL=your-email@example.com \
ADMIN_PASSWORD=your-password \
ADMIN_NAME="Your Name" \
node create-admin.js
```

Or modify the script defaults in `backend/create-admin.js`.

### Method 2: Manual MongoDB Update

If you already have a user account, you can update their role to admin:

```javascript
// Using MongoDB Shell
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

## 📝 What the Script Does

The `create-admin.js` script:
1. Connects to MongoDB using your `.env` configuration
2. Checks if a user with the email already exists
3. If exists and is admin: Optionally updates password
4. If exists but not admin: Updates role to admin
5. If doesn't exist: Creates new admin user with hashed password
6. Displays the credentials

## 🔒 Security Note

**Important:** In production, change the default admin password immediately after first login!

You can update the password by:
1. Logging in as admin
2. Going to Profile page
3. Updating your password there

Or use the script again to update:
```bash
UPDATE_PASSWORD=true ADMIN_PASSWORD=new-secure-password node create-admin.js
```

## ✅ Verification

To verify the admin user works:

```bash
# Test login via API
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@thrifysteps.com","password":"admin123456"}'
```

You should get a response with `"role": "admin"` in the user object.

## 🎯 Admin Features Available

Once logged in as admin, you have access to:

- **Dashboard** (`/admin`) - Statistics and analytics
- **Products** (`/admin/products`) - Manage products
- **Orders** (`/admin/orders`) - Manage orders and update status
- **Promo Codes** (`/admin/promo-codes`) - Create and manage discount codes
- **Users** (`/admin/users`) - View and manage users (API ready)

## 🆘 Troubleshooting

### "User already exists"
The script will detect if the user exists and:
- If already admin: Ask if you want to update password
- If not admin: Automatically update role to admin

### "MongoDB connection failed"
- Check your `.env` file has correct `MONGODB_URI`
- Ensure MongoDB is running
- Verify connection string format

### "Login fails"
- Verify password is correct (default: `admin123456`)
- Check backend server is running on port 5001
- Check browser console for errors
