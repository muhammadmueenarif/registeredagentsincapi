// CorpTools Authentication API Endpoint
const axios = require('axios');
const CryptoJS = require('crypto-js');
const jwt_encode = require('jwt-encode');

const CORPTOOLS_API_URL = 'https://api.corporatetools.com';
const ACCESS_KEY = process.env.CORPTOOLS_ACCESS_KEY || '88ff99bede797aaae02a0c21e5feba5b97888c9dc497742bbf9030a89a6795a464a38ce0bf0fdb14';
const SECRET_KEY = process.env.CORPTOOLS_SECRET_KEY || '973cbb1d5a284c2a77fd90688f5412a39accfca933744be402901e97dd574afbfa7d19809c4ed730';

// Import shared user storage
const { findUserByCredentials } = require('./users');

function generateToken(path, body = null) {
    const header = { access_key: ACCESS_KEY };
    const payload = {
        path: path,
        content: body ? CryptoJS.SHA256(JSON.stringify(body)).toString(CryptoJS.enc.Hex) : CryptoJS.SHA256('').toString(CryptoJS.enc.Hex)
    };
    
    return jwt_encode(payload, SECRET_KEY, header);
}

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

async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).json({ message: 'CORS preflight' });
        return;
    }

    try {
        const { method, body } = req;

        if (method === 'GET') {
            // Get account info - try CorpTools API first
            const result = await makeCorpToolsRequest('GET', '/account');
            res.status(200).json(result);
        } 
        else if (method === 'POST') {
            // Login user - use our own authentication system
            const { email, password } = body;
            
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email and password are required'
                });
            }

            // Check user credentials against our user storage
            const user = findUserByCredentials(email, password);
            
            if (user) {
                res.status(200).json({
                    success: true,
                    data: {
                        message: 'Login successful',
                        user: {
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            loginTime: new Date().toISOString()
                        },
                        token: 'mock-jwt-token-' + Date.now()
                    }
                });
            } else {
                res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }
        } 
        else {
            res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }

    } catch (error) {
        console.error('Auth API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}

module.exports = handler;
