// Local development server for testing CorpTools API
// Try to load dotenv, but don't fail if it's not available
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not available, continue with environment variables
}
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import our API handlers
const authHandler = require('./api/auth');
const companiesHandler = require('./api/companies');
const companyHandler = require('./api/company');
const indexHandler = require('./api/index');
const registerHandler = require('./api/register');
const paymentHandler = require('./api/payment');
const attorneyHandler = require('./api/attorney');
const businessIdentityHandler = require('./api/business-identity');
const cartHandler = require('./api/cart');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API Routes
app.get('/api/auth', authHandler);
app.post('/api/auth', authHandler);
app.get('/api/companies', companiesHandler);
app.post('/api/companies', companiesHandler);
app.get('/api/companies/:id', companyHandler);
app.patch('/api/companies/:id', companyHandler);
app.post('/api/register', registerHandler);
app.get('/api/payment', paymentHandler);
app.post('/api/payment', paymentHandler);
app.get('/api/attorney', attorneyHandler);
app.post('/api/attorney', attorneyHandler);
app.get('/api/business-identity', businessIdentityHandler);
app.post('/api/business-identity', businessIdentityHandler);
app.get('/api/cart', cartHandler);
app.post('/api/cart', cartHandler);
app.patch('/api/cart', cartHandler);
app.delete('/api/cart', cartHandler);
app.get('/api', indexHandler);
app.post('/api', indexHandler);

// Serve test page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-api.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'CorpTools API Server is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CorpTools API Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🧪 Test page: http://localhost:${PORT}`);
    console.log(`\n📡 API Endpoints:`);
    console.log(`   GET  /api/auth        - Get account info`);
    console.log(`   POST /api/auth        - Login user`);
    console.log(`   POST /api/register    - Create user account`);
    console.log(`   GET  /api/companies   - Get companies`);
    console.log(`   POST /api/companies   - Create company`);
    console.log(`   GET  /api/companies/:id - Get specific company`);
    console.log(`   PATCH /api/companies/:id - Update company`);
    console.log(`   GET  /api/payment     - Get payment methods`);
    console.log(`   POST /api/payment     - Add payment method`);
    console.log(`   GET  /api/attorney    - Get attorney information`);
    console.log(`   POST /api/attorney    - Add attorney information`);
    console.log(`   GET  /api/business-identity - Get business identity services`);
    console.log(`   POST /api/business-identity - Add business identity services`);
    console.log(`   GET  /api/cart        - Get shopping cart`);
    console.log(`   POST /api/cart        - Add item to cart`);
    console.log(`   PATCH /api/cart       - Update cart item`);
    console.log(`   DELETE /api/cart      - Remove item from cart`);
    console.log(`   GET  /api?action=services - Get services`);
    console.log(`   GET  /api?action=invoices - Get invoices`);
});

module.exports = app;
