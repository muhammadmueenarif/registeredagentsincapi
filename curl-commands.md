# CorpTools API - Curl Test Commands

**Deployed URL:** https://registeredagentsincapi.vercel.app/

## Quick Test Commands

### 1. Health Check
```bash
curl -X GET "https://registeredagentsincapi.vercel.app/health"
```

### 2. Get Account Info (CorpTools API)
```bash
curl -X GET "https://registeredagentsincapi.vercel.app/api/auth"
```

### 3. Register New User (Local)
```bash
curl -X POST "https://registeredagentsincapi.vercel.app/api/register" \
  -H "Content-Type: application/json" \
  -d '{
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
```

### 4. Login User (Local)
```bash
curl -X POST "https://registeredagentsincapi.vercel.app/api/auth" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hostwinds8989@proton.me",
    "password": "Anhy123456@"
  }'
```

### 5. Get All Companies (CorpTools API)
```bash
curl -X GET "https://registeredagentsincapi.vercel.app/api/companies"
```

### 6. Create New Company (CorpTools API)
```bash
# Option 1: Single jurisdiction (home_state)
curl -X POST "https://registeredagentsincapi.vercel.app/api/companies" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company LLC",
    "entity_type": "Limited Liability Company",
    "home_state": "Wyoming"
  }'

# Option 2: Multiple jurisdictions
curl -X POST "https://registeredagentsincapi.vercel.app/api/companies" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Multi-State Company LLC",
    "entity_type": "Limited Liability Company",
    "jurisdictions": ["Delaware", "California", "New York"],
    "duplicate_name_allowed": false
  }'
```

### 7. Get Specific Company (CorpTools API)
```bash
curl -X GET "https://registeredagentsincapi.vercel.app/api/companies/1"
```

### 8. Update Company (CorpTools API)
```bash
# Update company name and entity type
curl -X PATCH "https://registeredagentsincapi.vercel.app/api/companies/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Company Name",
    "entity_type": "Corporation"
  }'

# Add new jurisdictions
curl -X PATCH "https://registeredagentsincapi.vercel.app/api/companies/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Company Name",
    "entity_type": "Corporation",
    "jurisdictions": ["Texas", "Wyoming", "Ohio"]
  }'

# Change home state
curl -X PATCH "https://registeredagentsincapi.vercel.app/api/companies/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Company Name",
    "home_state": "Delaware"
  }'
```

### 9. Get Services (CorpTools API)
```bash
curl -X GET "https://registeredagentsincapi.vercel.app/api?action=services"
```

### 10. Get Invoices (CorpTools API)
```bash
curl -X GET "https://registeredagentsincapi.vercel.app/api?action=invoices"
```

### 11. Get Payment Methods (CorpTools API)
```bash
curl -X GET "https://registeredagentsincapi.vercel.app/api?action=payment-methods"
```

### 12. Add Payment Method (Local)
```bash
curl -X POST "https://registeredagentsincapi.vercel.app/api/payment" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "cardNumber": "4111-1111-1111-1111",
    "securityCode": "123",
    "expMonth": "12",
    "expYear": "2029",
    "useDifferentBilling": false
  }'
```

### 13. Add Payment Method with Billing Address
```bash
curl -X POST "https://registeredagentsincapi.vercel.app/api/payment" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "cardNumber": "4111-1111-1111-1111",
    "securityCode": "123",
    "expMonth": "12",
    "expYear": "2029",
    "useDifferentBilling": true,
    "billingCountry": "United States",
    "billingAddress": "123 Billing St",
    "billingCity": "New York",
    "billingState": "NY",
    "billingZip": "10001"
  }'
```

### 14. Get User Payment Methods (Local)
```bash
curl -X GET "https://registeredagentsincapi.vercel.app/api/payment"
```

## Run All Tests
```bash
# Make script executable and run
chmod +x test-api-curl.sh
./test-api-curl.sh
```

## Expected Responses

### Successful Health Check
```json
{
  "status": "OK",
  "message": "CorpTools API Server is running",
  "timestamp": "2025-01-27T..."
}
```

### Successful User Registration
```json
{
  "success": true,
  "data": {
    "message": "User account created successfully",
    "user": {
      "firstName": "Test",
      "lastName": "User",
      "email": "test.user@example.com",
      "createdAt": "2025-01-27T...",
      "status": "active"
    }
  }
}
```

### Successful Login
```json
{
  "success": true,
  "data": {
    "message": "Login successful",
    "user": {
      "firstName": "Hostwinds",
      "lastName": "User",
      "email": "hostwinds8989@proton.me",
      "loginTime": "2025-01-27T..."
    },
    "token": "mock-jwt-token-..."
  }
}
```

## Troubleshooting

- **CORS Issues**: The API includes CORS headers for all origins
- **Authentication**: Local users are managed separately from CorpTools API
- **Company Operations**: All company operations go through CorpTools API
- **Error Responses**: Check HTTP status codes and error messages in responses


