// Local User Registration API Endpoint
// Import shared user storage
const { addUser, findUserByEmail } = require('./users');

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

            res.status(200).json({
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
            });
        } 
        else {
            res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }

    } catch (error) {
        console.error('Register API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}

module.exports = handler;
