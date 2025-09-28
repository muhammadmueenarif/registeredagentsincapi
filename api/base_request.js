const axios = require('axios');
const CryptoJS = require('crypto-js');
const jwt_encode = require('jwt-encode');

// CorpTools API Configuration
const CORPTOOLS_API_URL = 'https://api.corporatetools.com';
const ACCESS_KEY = process.env.CORPTOOLS_ACCESS_KEY || '88ff99bede797aaae02a0c21e5feba5b97888c9dc497742bbf9030a89a6795a464a38ce0bf0fdb14';
const SECRET_KEY = process.env.CORPTOOLS_SECRET_KEY || '973cbb1d5a284c2a77fd90688f5412a39accfca933744be402901e97dd574afbfa7d19809c4ed730';

const DEBUG = process.env.DEBUG === 'true';

// Generate JWT token for CorpTools API
function generateToken(path, body = null) {
    const header = { access_key: ACCESS_KEY };
    const payload = {
        path: path,
        content: body ? CryptoJS.SHA256(JSON.stringify(body)).toString(CryptoJS.enc.Hex) : CryptoJS.SHA256('').toString(CryptoJS.enc.Hex)
    };
    
    const token = jwt_encode(payload, SECRET_KEY, header);
    if (DEBUG) console.log(`Generated token for path: ${path}`);
    return token;
}

// Base request function for CorpTools API
async function makeCorpToolsRequest(method, path, body = null, queryParams = {}) {
    const token = generateToken(path, body);
    let url = CORPTOOLS_API_URL + path;
    
    // Add query parameters if provided
    if (Object.keys(queryParams).length > 0) {
        const queryArray = [];
        for (let key in queryParams) {
            if (queryParams.hasOwnProperty(key)) {
                const value = queryParams[key];
                if (Array.isArray(value)) {
                    for (const v of value) {
                        queryArray.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`);
                    }
                } else if (typeof value === 'object') {
                    queryArray.push(`${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`);
                } else {
                    queryArray.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
                }
            }
        }
        const queryString = queryArray.join('&');
        url += '?' + queryString;
    }
    
    if (DEBUG) console.log(`Making ${method} request to: ${url}`);
    if (DEBUG && body) console.log('Request body:', JSON.stringify(body, null, 2));
    
    try {
        const response = await axios({
            method: method,
            url: url,
            data: body,
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });
        
        if (DEBUG) console.log('Response status:', response.status);
        if (DEBUG) console.log('Response data:', JSON.stringify(response.data, null, 2));
        
        return {
            success: true,
            data: response.data,
            status: response.status
        };
    } catch (error) {
        console.error('CorpTools API Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message,
            status: error.response?.status || 500
        };
    }
}

// Convenience methods
const request = {
    get: (path, queryParams = {}) => makeCorpToolsRequest('GET', path, null, queryParams),
    post: (path, body = {}) => makeCorpToolsRequest('POST', path, body),
    patch: (path, body = {}) => makeCorpToolsRequest('PATCH', path, body),
    delete: (path, body = {}) => makeCorpToolsRequest('DELETE', path, body),
    put: (path, body = {}) => makeCorpToolsRequest('PUT', path, body)
};

module.exports = {
    generateToken,
    makeCorpToolsRequest,
    request,
    CORPTOOLS_API_URL,
    ACCESS_KEY,
    SECRET_KEY
};
