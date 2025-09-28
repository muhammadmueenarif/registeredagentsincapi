// Simple test endpoint
module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).json({ message: 'CORS preflight' });
        return;
    }

    res.status(200).json({
        success: true,
        message: 'Test endpoint is working!',
        timestamp: new Date().toISOString()
    });
};
