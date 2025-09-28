// CorpTools API Server for Vercel
const axios = require('axios');
const CryptoJS = require('crypto-js');
const jwt_encode = require('jwt-encode');

// Import shared user storage
const { addUser, findUserByEmail } = require('./users');

// CorpTools API Configuration
const CORPTOOLS_API_URL = 'https://api.corporatetools.com';
const ACCESS_KEY =   '88ff99bede797aaae02a0c21e5feba5b97888c9dc497742bbf9030a89a6795a464a38ce0bf0fdb14';
const SECRET_KEY =   '973cbb1d5a284c2a77fd90688f5412a39accfca933744be402901e97dd574afbfa7d19809c4ed730';

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

// CORS headers - Allow all requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
};

// Main API handler
async function handler(req, res) {
    // Set CORS headers for all requests
    Object.keys(corsHeaders).forEach(key => {
        res.setHeader(key, corsHeaders[key]);
    });

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).json({ message: 'CORS preflight successful' });
        return;
    }

    try {
        const { method, query, body } = req;
        const { action } = query;

        console.log(`API Request: ${method} ${action}`, { query, body }); // Updated

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

            case 'register':
                if (method === 'POST') {
                    // Register new user
                    const { firstName, lastName, email, password } = body;
                    
                    if (!firstName || !lastName || !email || !password) {
                        return res.status(400).json({
                            success: false,
                            error: 'First name, last name, email, and password are required'
                        });
                    }

                    // Check if user already exists
                    const existingUser = findUserByEmail(email);
                    if (existingUser) {
                        return res.status(400).json({
                            success: false,
                            error: 'User with this email already exists'
                        });
                    }

                    // Create new user
                    const newUser = {
                        firstName,
                        lastName,
                        email,
                        password, // In production, hash this password
                        createdAt: new Date().toISOString(),
                        status: 'active'
                    };

                    // Add to users array
                    addUser(newUser);

                    result = {
                        success: true,
                        data: {
                            message: 'User account created successfully',
                            user: {
                                firstName: newUser.firstName,
                                lastName: newUser.lastName,
                                email: newUser.email,
                                createdAt: newUser.createdAt,
                                status: newUser.status
                            },
                            nextSteps: [
                                'You can now login with your credentials',
                                'Use the login form to access your account',
                                'Contact support if you need CorpTools API access'
                            ]
                        }
                    };
                } else {
                    return res.status(405).json({
                        success: false,
                        error: 'Method not allowed'
                    });
                }
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid action. Available actions: account, companies, login, register, services, invoices, payment-methods'
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
