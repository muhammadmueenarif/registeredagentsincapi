// Attorney Information API Endpoint
const { authenticateUser } = require('./auth_middleware');
const { addAttorneyToUser, getUserAttorneys } = require('./users');

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
            // Require authentication for adding attorney information
            authenticateUser(req, res, async () => {
                try {
                    const {
                        notifyAttorney = false,
                        attorneyEmail = '',
                        attorneyFirstName = '',
                        attorneyLastName = '',
                        attorneyPhone = '',
                        attorneyFirm = ''
                    } = body;

                    // Validate required fields if attorney notification is enabled
                    if (notifyAttorney && (!attorneyEmail || !attorneyFirstName || !attorneyLastName)) {
                        return res.status(400).json({
                            success: false,
                            error: 'Attorney email, first name, and last name are required when attorney notification is enabled'
                        });
                    }

                    // Create attorney information object
                    const attorneyInfo = {
                        id: 'attorney-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                        notifyAttorney,
                        attorneyEmail,
                        attorneyFirstName,
                        attorneyLastName,
                        attorneyPhone,
                        attorneyFirm,
                        createdAt: new Date().toISOString(),
                        isDefault: false
                    };

                    // Add attorney information to user
                    const success = addAttorneyToUser(req.user.id, attorneyInfo);

                    if (success) {
                        res.status(200).json({
                            success: true,
                            data: {
                                message: 'Attorney information saved successfully',
                                attorney: attorneyInfo,
                                user: {
                                    id: req.user.id,
                                    email: req.user.email
                                }
                            }
                        });
                    } else {
                        res.status(500).json({
                            success: false,
                            error: 'Failed to save attorney information'
                        });
                    }
                } catch (error) {
                    console.error('Error saving attorney information:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to save attorney information'
                    });
                }
            });
        }
        else if (method === 'GET') {
            // Require authentication for getting attorney information
            authenticateUser(req, res, async () => {
                try {
                    const userAttorneys = getUserAttorneys(req.user.id);
                    
                    res.status(200).json({
                        success: true,
                        data: {
                            message: `Found ${userAttorneys.length} attorney records for user ${req.user.email}`,
                            attorneys: userAttorneys
                        }
                    });
                } catch (error) {
                    console.error('Error getting attorney information:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to retrieve attorney information'
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
        console.error('Attorney API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}

module.exports = handler;
