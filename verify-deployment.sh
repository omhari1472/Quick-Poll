#!/bin/bash

# Deployment Verification Script for Quick Poll
# This script helps verify that your deployment is working correctly

echo "🔍 Quick Poll Deployment Verification"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if URLs are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo -e "${YELLOW}Usage: ./verify-deployment.sh <BACKEND_URL> <FRONTEND_URL>${NC}"
    echo ""
    echo "Example:"
    echo "./verify-deployment.sh https://quickpoll-backend.onrender.com https://your-app.vercel.app"
    exit 1
fi

BACKEND_URL=$1
FRONTEND_URL=$2

echo "Testing URLs:"
echo "Backend:  $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo ""

# Test 1: Backend Health Check
echo "1️⃣  Testing backend health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")

if [ "$HEALTH_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓ Backend health check passed${NC}"
else
    echo -e "${RED}✗ Backend health check failed (HTTP $HEALTH_RESPONSE)${NC}"
    echo "   Make sure your backend is deployed and running"
fi

# Test 2: Database Connection
echo ""
echo "2️⃣  Testing database connection..."
DB_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/test-db")

if [ "$DB_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Database connection failed (HTTP $DB_RESPONSE)${NC}"
    echo "   Check your DATABASE_URL environment variable"
fi

# Test 3: Frontend Accessibility
echo ""
echo "3️⃣  Testing frontend accessibility..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")

if [ "$FRONTEND_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${RED}✗ Frontend is not accessible (HTTP $FRONTEND_RESPONSE)${NC}"
    echo "   Check your Vercel deployment"
fi

# Test 4: API Endpoint
echo ""
echo "4️⃣  Testing API endpoint..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/polls")

if [ "$API_RESPONSE" == "200" ] || [ "$API_RESPONSE" == "404" ]; then
    echo -e "${GREEN}✓ API endpoint is responding${NC}"
else
    echo -e "${RED}✗ API endpoint failed (HTTP $API_RESPONSE)${NC}"
    echo "   Check your backend routes"
fi

# Test 5: CORS Headers
echo ""
echo "5️⃣  Testing CORS configuration..."
CORS_RESPONSE=$(curl -s -H "Origin: $FRONTEND_URL" -I "$BACKEND_URL/health" | grep -i "access-control-allow-origin")

if [ -n "$CORS_RESPONSE" ]; then
    echo -e "${GREEN}✓ CORS headers present${NC}"
else
    echo -e "${YELLOW}⚠ CORS headers not found${NC}"
    echo "   Make sure FRONTEND_URL is set in backend environment variables"
fi

echo ""
echo "======================================"
echo "Verification complete!"
echo ""
echo "Next steps:"
echo "1. Visit $FRONTEND_URL in your browser"
echo "2. Try creating a poll"
echo "3. Test real-time voting"
echo "4. Check browser console for any errors"
echo ""
echo "📚 For troubleshooting, see DEPLOYMENT.md"





