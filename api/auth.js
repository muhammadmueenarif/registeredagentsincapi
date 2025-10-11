// Local Authentication API Endpoint
const { request } = require('./base_request');

// Import shared user storage
const { findUserByCredentials } = require('./users');

async function handler(req, res) {
    // CORS headers - Allow all requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
        res.status(200).json({ message: 'CORS preflight successful' });
        return;
    }

    try {
        const { method, body } = req;

        if (method === 'GET') {
            // Get account info from CorpTools API
            const result = await request.get('/account');
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
            const user = await findUserByCredentials(email, password);
            
            if (user) {
                res.status(200).json({
                    success: true,
                    data: {
                        message: 'Login successful',
                        user: {
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            loginTime: new Date().toISOString()
                        },
                        token: 'user-' + user.id // Token format for authentication
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
