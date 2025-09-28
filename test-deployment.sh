#!/bin/bash

# CorpTools API Deployment Test Script
# Tests the deployed API at: https://registeredagentsincapi.vercel.app/

BASE_URL="https://registeredagentsincapi.vercel.app"
API_URL="$BASE_URL/api"

echo "🚀 Testing CorpTools API Deployment"
echo "URL: $BASE_URL"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test endpoint with error handling
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$endpoint" 2>/dev/null)
    else
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            "$endpoint" 2>/dev/null)
    fi
    
    # Check if curl command failed
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Connection failed${NC}"
        return 1
    fi
    
    # Split response and HTTP code
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE:/d')
    
    if [ -z "$http_code" ]; then
        echo -e "${RED}❌ No response received${NC}"
        echo "Response: $body"
        return 1
    fi
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ Success (HTTP $http_code)${NC}"
    elif [ "$http_code" -eq 404 ]; then
        echo -e "${YELLOW}⚠️  Not Found (HTTP $http_code) - Endpoint may not be deployed${NC}"
    else
        echo -e "${RED}❌ Error (HTTP $http_code)${NC}"
    fi
    
    echo "Response:"
    if command -v jq >/dev/null 2>&1; then
        echo "$body" | jq . 2>/dev/null || echo "$body"
    else
        echo "$body"
    fi
    echo "----------------------------------------"
}

# Test 1: Basic connectivity
echo -e "\n${YELLOW}1. BASIC CONNECTIVITY TEST${NC}"
test_endpoint "GET" "$BASE_URL" "" "Root endpoint"

# Test 2: Health check (if available)
echo -e "\n${YELLOW}2. HEALTH CHECK${NC}"
test_endpoint "GET" "$BASE_URL/health" "" "Health Check"

# Test 3: API endpoints
echo -e "\n${YELLOW}3. API ENDPOINTS${NC}"

# Test auth endpoint
test_endpoint "GET" "$API_URL/auth" "" "Get Account Info"

# Test companies endpoint
test_endpoint "GET" "$API_URL/companies" "" "Get Companies"

# Test user registration
register_data='{
    "firstName": "Test",
    "lastName": "User",
    "email": "test.user@example.com",
    "password": "testpassword123"
}'
test_endpoint "POST" "$API_URL/register" "$register_data" "Register User"

# Test user login
login_data='{
    "email": "hostwinds8989@proton.me",
    "password": "Anhy123456@"
}'
test_endpoint "POST" "$API_URL/auth" "$login_data" "Login User"

# Test services
test_endpoint "GET" "$API_URL?action=services" "" "Get Services"

echo -e "\n${GREEN}🎉 Deployment Test Complete!${NC}"
echo "================================================"

# Summary
echo -e "\n${BLUE}SUMMARY:${NC}"
echo "If you see 404 errors, the API may not be deployed yet."
echo "If you see connection errors, check the URL and deployment status."
echo ""
echo "Next steps:"
echo "1. Verify the API is deployed to Vercel"
echo "2. Check Vercel deployment logs"
echo "3. Ensure all environment variables are set"
echo "4. Test locally first: npm run dev"
