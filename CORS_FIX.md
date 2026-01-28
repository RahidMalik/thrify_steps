# CORS Fix for Network Error

## Issue
Getting "Network error. Please check your connection and ensure the server is running." when trying to login/register.

## Root Cause
The backend CORS configuration was only allowing requests from `http://localhost:3000`, but the frontend Vite dev server runs on port `8080` (as configured in `vite.config.ts`).

## Solution
Updated the backend CORS configuration (`backend/src/app.js`) to allow localhost on any port in development mode. This is a common pattern for development environments.

### Changes Made:
- Modified CORS origin check to allow any `localhost` or `127.0.0.1` origin in development
- Production still uses the configured `FRONTEND_URL` from environment variables
- This allows the frontend to run on any port during development

## Verification
✅ Backend server is running on port 5001  
✅ Frontend can now make requests from `http://localhost:8080`  
✅ CORS headers are correctly set: `Access-Control-Allow-Origin: http://localhost:8080`

## Testing
Try logging in again from the frontend. The network error should be resolved.

If you're still seeing issues:
1. Make sure the backend server is running: `cd backend && npm run dev`
2. Make sure the frontend server is running: `cd frontend && npm run dev`
3. Check browser console for any additional errors
4. Verify the API URL in browser Network tab matches `http://localhost:5001/api/auth/login`

## Production Note
In production, make sure to set `FRONTEND_URL` environment variable to your actual frontend domain. The CORS configuration will only allow that specific origin in production mode.
