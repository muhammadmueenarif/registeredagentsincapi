// Health check endpoint for Vercel
export default function handler(req, res) {
    res.status(200).json({
        status: 'OK',
        message: 'CorpTools API Server is running',
        timestamp: new Date().toISOString()
    });
}
