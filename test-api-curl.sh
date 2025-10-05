#!/bin/bash

# CorpTools API Test Script
# Deployed URL: https://registeredagentsincapi.vercel.app/

BASE_URL="https://registeredagentsincapi.vercel.app"
API_URL="$BASE_URL/api"

echo "🚀 Testing CorpTools API at: $BASE_URL"
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
    
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$endpoint")
    else
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            "$endpoint")
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

# 1. Health Check
echo -e "\n${YELLOW}1. HEALTH CHECK${NC}"
test_endpoint "GET" "$BASE_URL/health" "" "Health Check"

# 2. Get Account Info (CorpTools API)
echo -e "\n${YELLOW}2. ACCOUNT INFO${NC}"
test_endpoint "GET" "$API_URL/auth" "" "Get Account Info from CorpTools API"

# 3. Register New User (Local)
echo -e "\n${YELLOW}3. USER REGISTRATION${NC}"
register_data='{
    "firstName": "Test",
    "lastName": "User",
    "email": "test.user@example.com",
    "password": "testpassword123"
}'
test_endpoint "POST" "$API_URL/register" "$register_data" "Register New User (Local)"

# 4. Login User (Local)
echo -e "\n${YELLOW}4. USER LOGIN${NC}"
login_data='{
    "email": "hostwinds8989@proton.me",
    "password": "Anhy123456@"
}'
test_endpoint "POST" "$API_URL/auth" "$login_data" "Login User (Local)"

# 5. Get Companies (CorpTools API)
echo -e "\n${YELLOW}5. GET COMPANIES${NC}"
test_endpoint "GET" "$API_URL/companies" "" "Get All Companies from CorpTools API"

# 6. Create Company (CorpTools API)
echo -e "\n${YELLOW}6. CREATE COMPANY${NC}"
company_data='{
    "name": "Test Company LLC",
    "state": "Wyoming",
    "entityType": "Limited Liability Company"
}'
test_endpoint "POST" "$API_URL/companies" "$company_data" "Create New Company via CorpTools API"

# 7. Get Services (CorpTools API)
echo -e "\n${YELLOW}7. GET SERVICES${NC}"
test_endpoint "GET" "$API_URL?action=services" "" "Get Services from CorpTools API"

# 8. Get Invoices (CorpTools API)
echo -e "\n${YELLOW}8. GET INVOICES${NC}"
test_endpoint "GET" "$API_URL?action=invoices" "" "Get Invoices from CorpTools API"

# 9. Get Payment Methods (CorpTools API)
echo -e "\n${YELLOW}9. GET PAYMENT METHODS${NC}"
test_endpoint "GET" "$API_URL?action=payment-methods" "" "Get Payment Methods from CorpTools API"

# 10. Test Individual Company (if we have a company ID)
echo -e "\n${YELLOW}10. GET INDIVIDUAL COMPANY${NC}"
echo "Note: This requires a valid company ID from previous responses"
test_endpoint "GET" "$API_URL/companies/1" "" "Get Specific Company (ID: 1)"

echo -e "\n${GREEN}🎉 API Testing Complete!${NC}"
echo "================================================"
echo "Summary:"
echo "- Health Check: Basic server status"
echo "- Account Info: CorpTools API integration"
echo "- User Registration: Local user management"
echo "- User Login: Local authentication"
echo "- Companies: CorpTools API company operations"
echo "- Services/Invoices: CorpTools API business data"
echo ""
echo "Check the responses above for any errors or issues."


