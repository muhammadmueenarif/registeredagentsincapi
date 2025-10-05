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
    "password": "testpassword123",
    "phone": "555-123-4567",
    "country": "United States",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
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
# Single jurisdiction company
company_data='{
    "name": "Test Company LLC",
    "entity_type": "Limited Liability Company",
    "home_state": "Wyoming"
}'
test_endpoint "POST" "$API_URL/companies" "$company_data" "Create Single-State Company via CorpTools API"

# Multi-jurisdiction company
multi_state_company_data='{
    "name": "Multi-State Company LLC",
    "entity_type": "Limited Liability Company",
    "jurisdictions": ["Delaware", "California", "New York"],
    "duplicate_name_allowed": false
}'
test_endpoint "POST" "$API_URL/companies" "$multi_state_company_data" "Create Multi-State Company via CorpTools API"

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

# 11. Add Payment Method
echo -e "\n${YELLOW}11. ADD PAYMENT METHOD${NC}"
payment_data='{
    "firstName": "John",
    "lastName": "Doe",
    "cardNumber": "4111-1111-1111-1111",
    "securityCode": "123",
    "expMonth": "12",
    "expYear": "2029",
    "useDifferentBilling": false
}'
test_endpoint "POST" "$API_URL/payment" "$payment_data" "Add Payment Method"

# 12. Add Payment Method with Billing Address
echo -e "\n${YELLOW}12. ADD PAYMENT WITH BILLING${NC}"
payment_billing_data='{
    "firstName": "Jane",
    "lastName": "Smith",
    "cardNumber": "5555-5555-5555-4444",
    "securityCode": "456",
    "expMonth": "06",
    "expYear": "2028",
    "useDifferentBilling": true,
    "billingCountry": "United States",
    "billingAddress": "123 Billing St",
    "billingCity": "New York",
    "billingState": "NY",
    "billingZip": "10001"
}'
test_endpoint "POST" "$API_URL/payment" "$payment_billing_data" "Add Payment Method with Billing Address"

# 13. Get Payment Methods
echo -e "\n${YELLOW}13. GET PAYMENT METHODS${NC}"
test_endpoint "GET" "$API_URL/payment" "" "Get User Payment Methods"

echo -e "\n${GREEN}🎉 API Testing Complete!${NC}"
echo "================================================"
echo "Summary:"
echo "- Health Check: Basic server status"
echo "- Account Info: CorpTools API integration"
echo "- User Registration: Local user management with contact info"
echo "- User Login: Local authentication"
echo "- Companies: CorpTools API company operations with jurisdictions"
echo "- Payment Methods: Local payment details management"
echo "- Services/Invoices: CorpTools API business data"
echo ""
echo "Check the responses above for any errors or issues."


