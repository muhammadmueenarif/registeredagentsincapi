// CorpTools Individual Company API Endpoint
const { request } = require('./base_request');
const { authenticateUser } = require('./auth_middleware');
const { getUserCompanies } = require('./users');

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
        const { method, params, body } = req;
        const companyId = params?.id || req.query?.id;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                error: 'Company ID is required'
            });
        }

        // Require authentication for all company operations
        authenticateUser(req, res, async () => {
            try {
                // Check if user owns this company
                const userCompanies = getUserCompanies(req.user.id);
                const userOwnsCompany = userCompanies.some(company => company.id === companyId);
                
                if (!userOwnsCompany) {
                    return res.status(403).json({
                        success: false,
                        error: 'Access denied. You can only access companies you created.'
                    });
                }

                if (method === 'GET') {
                    // Get specific company by ID from CorpTools API
                    const result = await request.get(`/companies/${companyId}`);
                    res.status(200).json(result);
                } 
                else if (method === 'PATCH') {
                    // Update company via CorpTools API
                    const result = await request.patch(`/companies/${companyId}`, body);
                    res.status(200).json(result);
                }
                else {
                    res.status(405).json({
                        success: false,
                        error: 'Method not allowed'
                    });
                }
            } catch (error) {
                console.error('Company API Error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                    message: error.message
                });
            }
        });

    } catch (error) {
        console.error('Company API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}

module.exports = handler;


