# MongoDB Setup Guide - Fixing Authentication Error

## Problem
You're getting this error:
```
Command find requires authentication
MongoServerError: Command find requires authentication
```

This means your MongoDB connection string doesn't include authentication credentials, but MongoDB requires them.

## Solutions

### Option 1: Local MongoDB without Authentication (Easiest for Development)

If you're running MongoDB locally and haven't set up authentication, use:

**Update your `.env` file:**
```env
MONGODB_URI=mongodb://localhost:27017/thrifty_steps
```

**To disable authentication in MongoDB (local only):**

1. **If using Docker:**
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

2. **If using MongoDB installed locally:**
   - Edit MongoDB config file (usually `/etc/mongod.conf` or `/usr/local/etc/mongod.conf`)
   - Set `security.authorization: disabled`
   - Restart MongoDB: `sudo systemctl restart mongod` or `brew services restart mongodb-community`

### Option 2: Local MongoDB with Authentication

If your MongoDB requires authentication, update your `.env`:

```env
MONGODB_URI=mongodb://username:password@localhost:27017/thrifty_steps?authSource=admin
```

**To create a user with authentication:**
```bash
# Connect to MongoDB
mongosh

# Switch to admin database
use admin

# Create admin user
db.createUser({
  user: "admin",
  pwd: "your_password",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})

# Create app user
use thrifty_steps
db.createUser({
  user: "thrifty_user",
  pwd: "your_password",
  roles: [ { role: "readWrite", db: "thrifty_steps" } ]
})
```

Then update `.env`:
```env
MONGODB_URI=mongodb://thrifty_user:your_password@localhost:27017/thrifty_steps
```

### Option 3: MongoDB Atlas (Cloud - Recommended)

1. **Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**

2. **Create a cluster** (Free tier available)

3. **Create a database user:**
   - Go to Database Access
   - Add New Database User
   - Username: `thrifty_steps_user`
   - Password: (generate or set your own)
   - Database User Privileges: `Read and write to any database`

4. **Whitelist IP Address:**
   - Go to Network Access
   - Add IP Address
   - For development: `0.0.0.0/0` (allows all IPs - use only for development)
   - Or add your specific IP

5. **Get Connection String:**
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<database>` with `thrifty_steps`

6. **Update `.env`:**
```env
MONGODB_URI=mongodb+srv://thrifty_steps_user:your_password@cluster0.xxxxx.mongodb.net/thrifty_steps?retryWrites=true&w=majority
```

## Quick Fix - Test Connection

1. **Update your `.env` file** with one of the options above

2. **Test the connection:**
```bash
cd backend
npm run test:db
```

3. **If connection works, start the server:**
```bash
npm run dev
```

## Verify MongoDB is Running

**Check if MongoDB is running:**
```bash
# Docker
docker ps | grep mongodb

# Local installation
brew services list | grep mongodb
# or
sudo systemctl status mongod

# Test connection
mongosh
# or
mongo
```

**Start MongoDB if not running:**
```bash
# Docker
docker start mongodb
# or
docker-compose up -d mongodb

# Local (macOS)
brew services start mongodb-community

# Local (Linux)
sudo systemctl start mongod
```

## Connection String Formats

### Without Authentication (Local Development)
```
mongodb://localhost:27017/thrifty_steps
```

### With Authentication (Local)
```
mongodb://username:password@localhost:27017/thrifty_steps?authSource=admin
```

### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster.mongodb.net/thrifty_steps?retryWrites=true&w=majority
```

## Troubleshooting

### Error: "Command find requires authentication"
- ✅ Your MongoDB requires authentication
- ✅ Add username:password to connection string
- ✅ Or disable authentication for local development

### Error: "ECONNREFUSED" or "ENOTFOUND"
- ✅ MongoDB is not running
- ✅ Start MongoDB service
- ✅ Check port 27017 is accessible

### Error: "Authentication failed"
- ✅ Wrong username or password
- ✅ Check user exists in MongoDB
- ✅ Verify authSource database

### Error: "IP not whitelisted" (MongoDB Atlas)
- ✅ Add your IP to Network Access
- ✅ Use `0.0.0.0/0` for development (not recommended for production)

## Recommended Setup for Development

**Easiest approach:**
```env
# .env file
MONGODB_URI=mongodb://localhost:27017/thrifty_steps
```

**Make sure MongoDB is running without authentication for local dev:**
```bash
# Start MongoDB Docker container (no auth)
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

This will allow you to test immediately without authentication setup.
