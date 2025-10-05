// Authentication middleware for protecting routes
const { findUserById } = require('./users');

function authenticateUser(req, res, next) {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required. Please provide a valid token.'
        });
    }
    
    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);
    
    // For now, we'll use a simple token format: "user-{userId}"
    // In production, you'd validate a proper JWT token
    if (!token.startsWith('user-')) {
        return res.status(401).json({
            success: false,
            error: 'Invalid token format'
        });
    }
    
    // Extract user ID from token
    const userId = token.replace('user-', '');
    const user = findUserById(userId);
    
    if (!user) {
        return res.status(401).json({
            success: false,
            error: 'Invalid token. User not found.'
        });
    }
    
    // Add user to request object for use in route handlers
    req.user = user;
    next();
}

module.exports = {
    authenticateUser
};
