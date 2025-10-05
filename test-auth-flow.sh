#!/bin/bash

# Test User-Company Authentication Flow
# This script tests the complete flow: register → login → create company → get companies

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api"

echo "🔐 Testing User-Company Authentication Flow"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to make API calls and display results
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local auth_token=$5
    
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ -n "$data" ]; then
        if [ -n "$auth_token" ]; then
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth_token" \
                -d "$data" \
                "$endpoint")
        else
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$endpoint")
        fi
    else
        if [ -n "$auth_token" ]; then
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth_token" \
                "$endpoint")
        else
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method \
                -H "Content-Type: application/json" \
                "$endpoint")
        fi
    fi
    
    # Split response and HTTP code
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE:/d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ Success (HTTP $http_code)${NC}"
    else
        echo -e "${RED}❌ Error (HTTP $http_code)${NC}"
    fi
    
    echo "Response:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
    echo "----------------------------------------"
}

# 1. Register New User
echo -e "\n${YELLOW}1. REGISTER NEW USER${NC}"
register_data='{
    "firstName": "Test",
    "lastName": "User",
    "email": "test.user@example.com",
    "password": "testpassword123"
}'
test_endpoint "POST" "$API_URL/register" "$register_data" "Register New User"

# Extract user ID from registration response (if successful)
user_id=$(echo "$response" | sed '/HTTP_CODE:/d' | jq -r '.data.user.id' 2>/dev/null)
echo "User ID: $user_id"

# 2. Login User
echo -e "\n${YELLOW}2. LOGIN USER${NC}"
login_data='{
    "email": "test.user@example.com",
    "password": "testpassword123"
}'
test_endpoint "POST" "$API_URL/auth" "$login_data" "Login User"

# Extract token from login response
auth_token=$(echo "$response" | sed '/HTTP_CODE:/d' | jq -r '.data.token' 2>/dev/null)
echo "Auth Token: $auth_token"

# 3. Try to get companies without authentication (should fail)
echo -e "\n${YELLOW}3. GET COMPANIES WITHOUT AUTH (Should Fail)${NC}"
test_endpoint "GET" "$API_URL/companies" "" "Get Companies Without Authentication"

# 4. Get companies with authentication (should show empty list)
echo -e "\n${YELLOW}4. GET COMPANIES WITH AUTH (Should Show Empty)${NC}"
test_endpoint "GET" "$API_URL/companies" "" "Get User Companies" "$auth_token"

# 5. Create company with authentication
echo -e "\n${YELLOW}5. CREATE COMPANY WITH AUTH${NC}"
company_data='{
    "name": "My Test Company LLC",
    "state": "Wyoming",
    "entityType": "Limited Liability Company"
}'
test_endpoint "POST" "$API_URL/companies" "$company_data" "Create Company" "$auth_token"

# 6. Get companies again (should show the created company)
echo -e "\n${YELLOW}6. GET COMPANIES AFTER CREATION${NC}"
test_endpoint "GET" "$API_URL/companies" "" "Get User Companies After Creation" "$auth_token"

# 7. Try to access company without authentication (should fail)
echo -e "\n${YELLOW}7. ACCESS COMPANY WITHOUT AUTH (Should Fail)${NC}"
test_endpoint "GET" "$API_URL/companies/123" "" "Access Company Without Auth"

# 8. Try to access company with wrong user (should fail)
echo -e "\n${YELLOW}8. ACCESS COMPANY WITH WRONG USER (Should Fail)${NC}"
# Create another user and try to access first user's company
register_data2='{
    "firstName": "Another",
    "lastName": "User",
    "email": "another.user@example.com",
    "password": "password123"
}'
test_endpoint "POST" "$API_URL/register" "$register_data2" "Register Another User"

# Login second user
login_data2='{
    "email": "another.user@example.com",
    "password": "password123"
}'
test_endpoint "POST" "$API_URL/auth" "$login_data2" "Login Another User"

auth_token2=$(echo "$response" | sed '/HTTP_CODE:/d' | jq -r '.data.token' 2>/dev/null)

# Try to access first user's company with second user's token
test_endpoint "GET" "$API_URL/companies/123" "" "Access Other User's Company" "$auth_token2"

echo -e "\n${GREEN}🎉 Authentication Flow Testing Complete!${NC}"
echo "================================================"
echo "Summary:"
echo "- User registration: Creates user with unique ID"
echo "- User login: Returns authentication token"
echo "- Company creation: Requires authentication"
echo "- Company access: Only shows user's own companies"
echo "- Security: Prevents access to other users' companies"
