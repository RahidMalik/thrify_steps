# Fix for API Routes 404 Error

## ✅ Diagnosis Complete

**Status:** Routes ARE working correctly on port 5001!

I've tested both endpoints and they respond correctly:
- ✅ `/api/auth/register` - Working (201 Created)
- ✅ `/api/auth/login` - Working (200 OK)
- ✅ Server is running on port 5001

## 🔍 Root Cause

The issue is that **the frontend is configured to use port 5000**, but **the backend server is running on port 5001**.

In `frontend/src/lib/api.ts` line 6:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

But your backend `.env` has:
```
PORT=5001
```

## 🔧 Solution

### Step 1: Create Frontend `.env` File

Create a file `frontend/.env` with the following content:

```env
VITE_API_URL=http://localhost:5001/api
```

**Important:** After creating this file, you MUST restart your frontend development server for the change to take effect.

### Step 2: Restart Frontend Server

```bash
cd frontend
# Stop the current server (Ctrl+C)
npm run dev
# or if using vite directly
vite
```

### Step 3: Verify the Fix

Test the endpoints again from your frontend or using:

```bash
# Test Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123456"}'

# Test Login  
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

## 📋 Alternative: Quick Fix in Code (Temporary)

If you can't create a `.env` file right now, you can temporarily update `frontend/src/lib/api.ts`:

Change line 6 from:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

To:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
```

**Note:** Using `.env` is the better approach as it allows easy configuration changes without code modifications.

## ✅ Verification Checklist

After applying the fix:
- [ ] Frontend `.env` file created with `VITE_API_URL=http://localhost:5001/api`
- [ ] Frontend dev server restarted
- [ ] Backend server running on port 5001 (confirmed: ✅)
- [ ] Test register endpoint from frontend
- [ ] Test login endpoint from frontend

## 🧪 Test Results from Backend (Port 5001)

All endpoints tested successfully:

```bash
# Register Test
✅ POST /api/auth/register - Status: 201 Created
Response: {"success":true,"message":"User registered successfully",...}

# Login Test  
✅ POST /api/auth/login - Status: 200 OK
Response: {"success":true,"message":"Login successful",...}

# Health Check
✅ GET /health - Status: 200 OK
Response: {"success":true,"message":"Thrifty Steps API is running",...}
```

## 🚨 If Still Getting 404 Errors

If you still get 404 errors after the fix:

1. **Check browser console** - Look for the actual URL being called
2. **Verify frontend .env is loaded** - Check Network tab to see what URL is being used
3. **Clear browser cache** - Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
4. **Check server logs** - Make sure the backend is receiving the requests
5. **Verify CORS** - Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL

## 📝 Server Status

- **Backend Port:** 5001 ✅
- **Backend Running:** Yes ✅ (PID: 48267)
- **Routes Mounted:** Yes ✅
- **Health Endpoint:** Working ✅
