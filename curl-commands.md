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
    "password": "testpassword123"
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
curl -X POST "https://registeredagentsincapi.vercel.app/api/companies" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company LLC",
    "state": "Wyoming",
    "entityType": "Limited Liability Company"
  }'
```

### 7. Get Specific Company (CorpTools API)
```bash
curl -X GET "https://registeredagentsincapi.vercel.app/api/companies/1"
```

### 8. Update Company (CorpTools API)
```bash
curl -X PATCH "https://registeredagentsincapi.vercel.app/api/companies/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Company Name"
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
