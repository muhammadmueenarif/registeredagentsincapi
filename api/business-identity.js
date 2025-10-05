// Business Identity Services API Endpoint
const { authenticateUser } = require('./auth_middleware');
const { addBusinessIdentityToUser, getUserBusinessIdentity } = require('./users');

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
            // Require authentication for adding business identity services
            authenticateUser(req, res, async () => {
                try {
                    const {
                        domainName = '',
                        domainExtension = 'com',
                        websiteHosting = false,
                        businessEmail = '',
                        phoneNumber = '',
                        phoneAreaCode = '',
                        businessSupplies = false,
                        suppliesType = ''
                    } = body;

                    // Validate domain name if provided
                    if (domainName && domainName.length < 3) {
                        return res.status(400).json({
                            success: false,
                            error: 'Domain name must be at least 3 characters long'
                        });
                    }

                    // Validate phone number if provided
                    if (phoneNumber && phoneNumber.length < 10) {
                        return res.status(400).json({
                            success: false,
                            error: 'Phone number must be at least 10 digits'
                        });
                    }

                    // Create business identity object
                    const businessIdentity = {
                        id: 'business-identity-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                        domainName,
                        domainExtension,
                        websiteHosting,
                        businessEmail,
                        phoneNumber,
                        phoneAreaCode,
                        businessSupplies,
                        suppliesType,
                        createdAt: new Date().toISOString(),
                        status: 'pending'
                    };

                    // Add business identity to user
                    const success = addBusinessIdentityToUser(req.user.id, businessIdentity);

                    if (success) {
                        res.status(200).json({
                            success: true,
                            data: {
                                message: 'Business identity services saved successfully',
                                businessIdentity: businessIdentity,
                                user: {
                                    id: req.user.id,
                                    email: req.user.email
                                }
                            }
                        });
                    } else {
                        res.status(500).json({
                            success: false,
                            error: 'Failed to save business identity services'
                        });
                    }
                } catch (error) {
                    console.error('Error saving business identity services:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to save business identity services'
                    });
                }
            });
        }
        else if (method === 'GET') {
            // Require authentication for getting business identity services
            authenticateUser(req, res, async () => {
                try {
                    const userBusinessIdentity = getUserBusinessIdentity(req.user.id);
                    
                    res.status(200).json({
                        success: true,
                        data: {
                            message: `Found ${userBusinessIdentity.length} business identity services for user ${req.user.email}`,
                            businessIdentity: userBusinessIdentity
                        }
                    });
                } catch (error) {
                    console.error('Error getting business identity services:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to retrieve business identity services'
                    });
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
        console.error('Business Identity API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}

module.exports = handler;
