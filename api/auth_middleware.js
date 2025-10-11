// Authentication middleware for protecting routes
const { findUserById } = require('./users');

function authenticateUser(req, res, next) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        console.log('Auth header:', authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required. Please provide a valid token.'
            });
        }

        // Extract token (remove 'Bearer ' prefix)
        const token = authHeader.substring(7);
        console.log('Token:', token);

        // For now, we'll use a simple token format: "user-{userId}"
        // In production, you'd validate a proper JWT token
        if (!token.startsWith('user-')) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token format'
            });
        }

        // Extract user ID from token (token is already "user-{userId}")
        const userId = token;
        console.log('User ID:', userId);

        const user = findUserById(userId);
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token. User not found.'
            });
        }

        // Add user to request object for use in route handlers
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication error'
        });
    }
}

module.exports = {
    authenticateUser
};
