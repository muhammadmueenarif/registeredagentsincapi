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
            // Register new user with contact information
            const { 
                firstName, 
                lastName, 
                email, 
                password, 
                phone, 
                country, 
                address, 
                city, 
                state, 
                zipCode 
            } = body;
            
            if (!firstName || !lastName || !email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'First name, last name, email, and password are required'
                });
            }

            // Check if user already exists
            const existingUser = await findUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'User with this email already exists'
                });
            }

            // Create new user with contact information
            const newUser = {
                firstName,
                lastName,
                email,
                password, // In production, hash this password
                phone: phone || '',
                country: country || '',
                address: address || '',
                city: city || '',
                state: state || '',
                zipCode: zipCode || '',
                createdAt: new Date().toISOString(),
                status: 'active'
            };

            // Add to users array
            const createdUser = await addUser(newUser);

            res.status(200).json({
                success: true,
                data: {
                    message: 'User account created successfully',
                    user: {
                        id: createdUser.id,
                        firstName: createdUser.firstName,
                        lastName: createdUser.lastName,
                        email: createdUser.email,
                        phone: createdUser.phone,
                        country: createdUser.country,
                        address: createdUser.address,
                        city: createdUser.city,
                        state: createdUser.state,
                        zipCode: createdUser.zipCode,
                        createdAt: createdUser.createdAt,
                        status: createdUser.status
                    },
                    nextSteps: [
                        'You can now login with your credentials',
                        'Use the login form to access your account',
                        'You can create and manage companies after login'
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
