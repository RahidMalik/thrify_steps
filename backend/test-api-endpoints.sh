#!/bin/bash

# API Endpoint Testing Script for Thrifty Steps Backend
# Tests all authentication endpoints on port 5001

BASE_URL="http://localhost:5001"
API_URL="${BASE_URL}/api"

echo "=========================================="
echo "Testing Thrifty Steps API on Port 5001"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "1. Testing Health Check..."
echo "   GET ${BASE_URL}/health"
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "${BASE_URL}/health")
HTTP_STATUS=$(echo "$HEALTH_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$HEALTH_RESPONSE" | sed '/HTTP_STATUS/d')
echo "   Status: $HTTP_STATUS"
echo "   Response: $BODY"
echo ""

# Test 2: Register Endpoint
echo "2. Testing Register Endpoint..."
echo "   POST ${API_URL}/auth/register"
REGISTER_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User '$(date +%s)'",
    "email": "test'$(date +%s)'@example.com",
    "password": "test123456"
  }' \
  "${API_URL}/auth/register")
HTTP_STATUS=$(echo "$REGISTER_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$REGISTER_RESPONSE" | sed '/HTTP_STATUS/d')
echo "   Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" = "201" ] || [ "$HTTP_STATUS" = "200" ]; then
  echo "   ✅ SUCCESS"
  TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "   Token received: ${TOKEN:0:20}..."
else
  echo "   ❌ FAILED"
  echo "   Response: $BODY"
fi
echo ""

# Test 3: Login Endpoint (using test user)
echo "3. Testing Login Endpoint..."
echo "   POST ${API_URL}/auth/login"
LOGIN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }' \
  "${API_URL}/auth/login")
HTTP_STATUS=$(echo "$LOGIN_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$LOGIN_RESPONSE" | sed '/HTTP_STATUS/d')
echo "   Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" = "200" ]; then
  echo "   ✅ SUCCESS"
  TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  if [ ! -z "$TOKEN" ]; then
    echo "   Token received: ${TOKEN:0:20}..."
    export TEST_TOKEN="$TOKEN"
  fi
else
  echo "   ❌ FAILED or User does not exist"
  echo "   Response: $BODY"
fi
echo ""

# Test 4: Products Endpoint (public)
echo "4. Testing Products Endpoint (public)..."
echo "   GET ${API_URL}/products"
PRODUCTS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  "${API_URL}/products")
HTTP_STATUS=$(echo "$PRODUCTS_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$PRODUCTS_RESPONSE" | sed '/HTTP_STATUS/d')
echo "   Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" = "200" ]; then
  echo "   ✅ SUCCESS"
else
  echo "   ❌ FAILED"
  echo "   Response: $BODY"
fi
echo ""

# Test 5: Categories Endpoint (public)
echo "5. Testing Categories Endpoint (public)..."
echo "   GET ${API_URL}/categories"
CATEGORIES_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  "${API_URL}/categories")
HTTP_STATUS=$(echo "$CATEGORIES_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$CATEGORIES_RESPONSE" | sed '/HTTP_STATUS/d')
echo "   Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" = "200" ]; then
  echo "   ✅ SUCCESS"
else
  echo "   ❌ FAILED"
  echo "   Response: $BODY"
fi
echo ""

# Test 6: Protected Route (Get Me) - if token exists
if [ ! -z "$TEST_TOKEN" ]; then
  echo "6. Testing Protected Route (Get Me)..."
  echo "   GET ${API_URL}/auth/me"
  ME_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -H "Authorization: Bearer $TEST_TOKEN" \
    "${API_URL}/auth/me")
  HTTP_STATUS=$(echo "$ME_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
  BODY=$(echo "$ME_RESPONSE" | sed '/HTTP_STATUS/d')
  echo "   Status: $HTTP_STATUS"
  if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✅ SUCCESS"
  else
    echo "   ❌ FAILED"
    echo "   Response: $BODY"
  fi
  echo ""
fi

# Test 7: Test 404 handler
echo "7. Testing 404 Handler..."
echo "   GET ${API_URL}/nonexistent"
NOTFOUND_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  "${API_URL}/nonexistent")
HTTP_STATUS=$(echo "$NOTFOUND_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$NOTFOUND_RESPONSE" | sed '/HTTP_STATUS/d')
echo "   Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" = "404" ]; then
  echo "   ✅ SUCCESS (404 as expected)"
else
  echo "   ❌ UNEXPECTED"
  echo "   Response: $BODY"
fi
echo ""

echo "=========================================="
echo "Testing Complete!"
echo "=========================================="
