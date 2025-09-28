// CorpTools Companies API Endpoint
const { request } = require('./base_request');

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
            // Get all companies from CorpTools API (no auth required)
            console.log('Getting companies from CorpTools API...');
            const result = await request.get('/companies');
            res.status(200).json(result);
        } 
        else if (method === 'POST') {
            // Create new company via CorpTools API (no auth required)
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

            console.log('Creating company via CorpTools API...', companyData);
            const result = await request.post('/companies', companyData);
            res.status(200).json(result);
        } 
        else {
            res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }

    } catch (error) {
        console.error('Companies API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}

module.exports = handler;
