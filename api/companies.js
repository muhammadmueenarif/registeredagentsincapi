// CorpTools Companies API Endpoint
const { request } = require('./base_request');
const { authenticateUser } = require('./auth_middleware');
const { addCompanyToUser, getUserCompanies } = require('./users');

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
            // Require authentication for getting companies
            authenticateUser(req, res, async () => {
                try {
                    // Get user's companies from local storage
                    const userCompanies = getUserCompanies(req.user.id);
                    
                    if (userCompanies.length === 0) {
                        return res.status(200).json({
                            success: true,
                            data: {
                                message: 'No companies found for this user',
                                companies: []
                            }
                        });
                    }
                    
                    // Get full company details from CorpTools API for user's companies
                    const companyDetails = [];
                    for (const userCompany of userCompanies) {
                        try {
                            const result = await request.get(`/companies/${userCompany.id}`);
                            if (result.success) {
                                companyDetails.push(result.data);
                            }
                        } catch (error) {
                            console.log(`Company ${userCompany.id} not found in CorpTools API`);
                        }
                    }
                    
                    res.status(200).json({
                        success: true,
                        data: {
                            message: `Found ${companyDetails.length} companies for user ${req.user.email}`,
                            companies: companyDetails
                        }
                    });
                } catch (error) {
                    console.error('Error getting user companies:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to retrieve user companies'
                    });
                }
            });
        } 
        else if (method === 'POST') {
            // Require authentication for creating companies
            authenticateUser(req, res, async () => {
                try {
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

                    console.log('Creating company via CorpTools API for user:', req.user.email, companyData);
                    const result = await request.post('/companies', companyData);
                    
                    if (result.success && result.data && result.data.result && result.data.result.length > 0) {
                        // Company created successfully, associate it with the user
                        const createdCompany = result.data.result[0];
                        const success = addCompanyToUser(req.user.id, createdCompany.id, createdCompany.name);
                        
                        if (success) {
                            res.status(200).json({
                                success: true,
                                data: {
                                    message: 'Company created successfully and associated with your account',
                                    company: createdCompany,
                                    user: {
                                        id: req.user.id,
                                        email: req.user.email
                                    }
                                }
                            });
                        } else {
                            res.status(500).json({
                                success: false,
                                error: 'Company created but failed to associate with user account'
                            });
                        }
                    } else {
                        res.status(200).json(result);
                    }
                } catch (error) {
                    console.error('Error creating company:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to create company'
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
        console.error('Companies API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}

module.exports = handler;
