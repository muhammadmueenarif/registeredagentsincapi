// CorpTools API Server for Vercel
const axios = require('axios');
const CryptoJS = require('crypto-js');
const jwt_encode = require('jwt-encode');

// CorpTools API Configuration
const CORPTOOLS_API_URL = 'https://api.corporatetools.com';
const ACCESS_KEY = process.env.CORPTOOLS_ACCESS_KEY || '88ff99bede797aaae02a0c21e5feba5b97888c9dc497742bbf9030a89a6795a464a38ce0bf0fdb14';
const SECRET_KEY = process.env.CORPTOOLS_SECRET_KEY || '973cbb1d5a284c2a77fd90688f5412a39accfca933744be402901e97dd574afbfa7d19809c4ed730';

// Generate JWT token for CorpTools API
function generateToken(path, body = null) {
    const header = { access_key: ACCESS_KEY };
    const payload = {
        path: path,
        content: body ? CryptoJS.SHA256(JSON.stringify(body)).toString(CryptoJS.enc.Hex) : CryptoJS.SHA256('').toString(CryptoJS.enc.Hex)
    };
    
    return jwt_encode(payload, SECRET_KEY, header);
}

// Make request to CorpTools API
async function makeCorpToolsRequest(method, endpoint, data = null) {
    const token = generateToken(endpoint, data);
    const url = CORPTOOLS_API_URL + endpoint;
    
    try {
        const response = await axios({
            method: method,
            url: url,
            data: data,
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });
        
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('CorpTools API Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
}

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Main API handler
async function handler(req, res) {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        res.status(200).json({ message: 'CORS preflight' });
        return;
    }

    // Set CORS headers
    Object.keys(corsHeaders).forEach(key => {
        res.setHeader(key, corsHeaders[key]);
    });

    try {
        const { method, query, body } = req;
        const { action } = query;

        console.log(`API Request: ${method} ${action}`, { query, body });

        let result;

        switch (action) {
            case 'account':
                result = await makeCorpToolsRequest('GET', '/account');
                break;

            case 'companies':
                if (method === 'GET') {
                    result = await makeCorpToolsRequest('GET', '/companies');
                } else if (method === 'POST') {
                    const { name, state = 'Wyoming', entityType = 'Limited Liability Company' } = body;
                    const companyData = {
                        companies: [{
                            name: name,
                            home_state: state,
                            entity_type: entityType
                        }]
                    };
                    result = await makeCorpToolsRequest('POST', '/companies', companyData);
                }
                break;

            case 'login':
                const { email, password } = body;
                const loginData = { email, password };
                result = await makeCorpToolsRequest('POST', '/auth/login', loginData);
                break;

            case 'services':
                result = await makeCorpToolsRequest('GET', '/services');
                break;

            case 'invoices':
                result = await makeCorpToolsRequest('GET', '/invoices');
                break;

            case 'payment-methods':
                result = await makeCorpToolsRequest('GET', '/payment-methods');
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid action. Available actions: account, companies, login, services, invoices, payment-methods'
                });
        }

        res.status(200).json(result);

    } catch (error) {
        console.error('API Handler Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}

module.exports = handler;
