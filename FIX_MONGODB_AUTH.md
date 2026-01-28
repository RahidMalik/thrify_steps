# Fix MongoDB Authentication Error

## Current Issue
Your MongoDB container has authentication enabled, but your connection string doesn't include credentials.

**Current `.env`:**
```
MONGODB_URI=mongodb://localhost:27017/thrify_kicks
```

## Quick Fix - Option 1: Remove Authentication (Easiest for Development)

### Step 1: Stop and Remove Current MongoDB Container
```bash
docker stop mongodb
docker rm mongodb
```

### Step 2: Start New MongoDB Container WITHOUT Authentication
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

### Step 3: Update Your `.env` File
Edit `backend/.env` and change:
```env
MONGODB_URI=mongodb://localhost:27017/thrifty_steps
```

**Note:** Changed database name from `thrify_kicks` to `thrifty_steps`

### Step 4: Test Connection
```bash
cd backend
npm run test:db
```

### Step 5: Start Server
```bash
npm run dev
```

---

## Option 2: Add Authentication to Connection String

If you want to keep authentication enabled, you need to:

### Step 1: Create a Database User
```bash
docker exec -it mongodb mongosh

# In MongoDB shell:
use admin
db.createUser({
  user: "thrifty_user",
  pwd: "thrifty_password",
  roles: [ { role: "readWrite", db: "thrifty_steps" } ]
})
```

### Step 2: Update Your `.env` File
```env
MONGODB_URI=mongodb://thrifty_user:thrifty_password@localhost:27017/thrifty_steps?authSource=admin
```

---

## Option 3: Use MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP `0.0.0.0/0` (for development)
5. Get connection string and update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/thrifty_steps?retryWrites=true&w=majority
```

---

## Recommended: Use Option 1 (No Auth for Local Development)

**Quick commands:**
```bash
# Stop and remove old container
docker stop mongodb && docker rm mongodb

# Start new container without auth
docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db mongo:latest

# Update .env file (edit manually):
# MONGODB_URI=mongodb://localhost:27017/thrifty_steps

# Test connection
cd backend && npm run test:db
```

**After fixing, your API endpoint should work:**
```bash
curl http://localhost:5000/api/products
```
