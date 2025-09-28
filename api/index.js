// Main API Handler - Routes between local and external APIs
const { request } = require('./base_request');

// Import shared user storage
const { addUser, findUserByEmail } = require('./users');

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
                result = await request.get('/account');
                break;

            case 'companies':
                if (method === 'GET') {
                    result = await request.get('/companies');
                } else if (method === 'POST') {
                    const { name, state = 'Wyoming', entityType = 'Limited Liability Company' } = body;
                    
                    if (!name) {
                        return res.status(400).json({
                            success: false,
                            error: 'Company name is required'
                        });
                    }

                    const companyData = {
                        companies: [{
                            name: name,
                            home_state: state,
                            entity_type: entityType
                        }]
                    };
                    
                    result = await request.post('/companies', companyData);
                }
                break;

            case 'login':
                const { email, password } = body;
                
                if (!email || !password) {
                    return res.status(400).json({
                        success: false,
                        error: 'Email and password are required'
                    });
                }

                // Check local user credentials
                const { findUserByCredentials } = require('./users');
                const user = findUserByCredentials(email, password);
                
                if (user) {
                    result = {
                        success: true,
                        data: {
                            message: 'Login successful',
                            user: {
                                firstName: user.firstName,
                                lastName: user.lastName,
                                email: user.email,
                                status: user.status,
                                createdAt: user.createdAt
                            },
                            token: 'local-auth-token', // In production, generate a real JWT token
                            expiresIn: '24h'
                        }
                    };
                } else {
                    result = {
                        success: false,
                        error: 'Invalid email or password'
                    };
                }
                break;

            case 'services':
                result = await request.get('/services');
                break;

            case 'invoices':
                result = await request.get('/invoices');
                break;

            case 'payment-methods':
                result = await request.get('/payment-methods');
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
