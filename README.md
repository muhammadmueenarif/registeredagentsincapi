# CorpTools API Server for Vercel

A Node.js API server that provides CorpTools API integration for your WordPress site.

## 🚀 Features

- **Account Management** - Get account information
- **Company Management** - Create and list companies
- **Authentication** - User login
- **Services** - Get available services
- **Invoices** - Get invoices
- **Payment Methods** - Get payment methods

## 📦 Installation

1. **Clone the repository:**
```bash
git clone <your-repo>
cd Nodejsapi
```

2. **Install dependencies:**
```bash
npm install
```

3. **Deploy to Vercel:**
```bash
npx vercel
```

## 🔧 Environment Variables

Set these in your Vercel dashboard:

```
CORPTOOLS_ACCESS_KEY=your-access-key
CORPTOOLS_SECRET_KEY=your-secret-key
```

## 📡 API Endpoints

### Base URL: `https://your-app.vercel.app/api`

### 1. **Account Info**
```bash
GET /api/auth
```

### 2. **Login**
```bash
POST /api/auth
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 3. **Get Companies**
```bash
GET /api/companies
```

### 4. **Create Company**
```bash
POST /api/companies
Content-Type: application/json

{
  "name": "My Company LLC",
  "state": "Wyoming",
  "entityType": "Limited Liability Company"
}
```

### 5. **Get Services**
```bash
GET /api/index?action=services
```

### 6. **Get Invoices**
```bash
GET /api/index?action=invoices
```

## 🌐 WordPress Integration

### JavaScript Example:
```javascript
// Your WordPress site
const API_BASE = 'https://your-app.vercel.app/api';

// Login user
async function loginUser(email, password) {
    const response = await fetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return await response.json();
}

// Get companies
async function getCompanies() {
    const response = await fetch(`${API_BASE}/companies`);
    return await response.json();
}

// Create company
async function createCompany(name, state = 'Wyoming') {
    const response = await fetch(`${API_BASE}/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, state })
    });
    return await response.json();
}
```

### PHP Example (WordPress):
```php
// WordPress functions.php
function corptools_api_call($endpoint, $method = 'GET', $data = null) {
    $api_url = 'https://your-app.vercel.app/api/' . $endpoint;
    
    $args = array(
        'method' => $method,
        'headers' => array('Content-Type' => 'application/json'),
        'timeout' => 30
    );
    
    if ($data) {
        $args['body'] = json_encode($data);
    }
    
    $response = wp_remote_request($api_url, $args);
    return json_decode(wp_remote_retrieve_body($response), true);
}

// Usage
$companies = corptools_api_call('companies');
$account = corptools_api_call('auth');
```

## 🧪 Testing

### Test with cURL:
```bash
# Get account
curl https://your-app.vercel.app/api/auth

# Login
curl -X POST https://your-app.vercel.app/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get companies
curl https://your-app.vercel.app/api/companies

# Create company
curl -X POST https://your-app.vercel.app/api/companies \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Company LLC","state":"Wyoming"}'
```

## 🔒 Security

- CORS enabled for cross-origin requests
- Environment variables for API keys
- Error handling and logging
- Input validation

## 📝 Logs

Check Vercel function logs for debugging:
```bash
vercel logs
```

## 🚀 Deployment

1. **Connect to Vercel:**
```bash
npx vercel
```

2. **Set Environment Variables:**
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Add `CORPTOOLS_ACCESS_KEY` and `CORPTOOLS_SECRET_KEY`

3. **Deploy:**
```bash
vercel --prod
```

Your API will be available at: `https://your-app.vercel.app/api`
# registeredagentsincapi
