# CorpTools API - Deployment Guide

## Vercel Deployment

### 1. Prerequisites
- Node.js 22.x
- Vercel CLI installed: `npm i -g vercel`
- CorpTools API credentials

### 2. Environment Variables
Set these in your Vercel dashboard or via CLI:

```bash
vercel env add CORPTOOLS_ACCESS_KEY
vercel env add CORPTOOLS_SECRET_KEY
vercel env add DEBUG
```

Or set them in Vercel dashboard:
- `CORPTOOLS_ACCESS_KEY`: Your CorpTools API access key
- `CORPTOOLS_SECRET_KEY`: Your CorpTools API secret key
- `DEBUG`: Set to `false` for production

### 3. Deploy to Vercel

```bash
# Install dependencies
npm install

# Deploy to Vercel
vercel

# For production deployment
vercel --prod
```

### 4. Test Deployment

```bash
# Run the test script
chmod +x test-deployment.sh
./test-deployment.sh
```

## API Endpoints After Deployment

Your API will be available at: `https://your-app.vercel.app/`

### Available Endpoints:
- `GET /health` - Health check
- `GET /api/auth` - Get account info (CorpTools API)
- `POST /api/auth` - Login user (Local)
- `POST /api/register` - Register user (Local)
- `GET /api/companies` - Get companies (CorpTools API)
- `POST /api/companies` - Create company (CorpTools API)
- `GET /api/companies/:id` - Get specific company (CorpTools API)
- `PATCH /api/companies/:id` - Update company (CorpTools API)
- `GET /api?action=services` - Get services (CorpTools API)
- `GET /api?action=invoices` - Get invoices (CorpTools API)
- `GET /api?action=payment-methods` - Get payment methods (CorpTools API)

## Testing Commands

### Quick Health Check
```bash
curl -X GET "https://your-app.vercel.app/health"
```

### Test User Registration
```bash
curl -X POST "https://your-app.vercel.app/api/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Company Creation
```bash
curl -X POST "https://your-app.vercel.app/api/companies" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company LLC",
    "state": "Wyoming",
    "entityType": "Limited Liability Company"
  }'
```

## Troubleshooting

### Common Issues:

1. **404 Errors**: API not deployed or routes not configured
2. **CORS Errors**: Check CORS configuration in server.js
3. **Authentication Errors**: Verify CorpTools API credentials
4. **Environment Variables**: Ensure all required env vars are set

### Debug Steps:

1. Check Vercel deployment logs
2. Test locally first: `npm run dev`
3. Verify environment variables in Vercel dashboard
4. Check function logs in Vercel dashboard

### Local Testing:
```bash
# Start local server
npm run dev

# Test locally
curl -X GET "http://localhost:3000/health"
```


