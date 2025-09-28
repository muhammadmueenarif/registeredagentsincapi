require('dotenv').config();
const axios = require('axios');
const CryptoJS = require('crypto-js');
const jwt_encode = require('jwt-encode');

// CorpTools API Configuration - matching JavaScript examples
const DEBUG = process.env.DEBUG;
const API_URL = process.env.API_URL || 'https://api.corporatetools.com';
const ACCESS_KEY = process.env.ACCESS_KEY || '88ff99bede797aaae02a0c21e5feba5b97888c9dc497742bbf9030a89a6795a464a38ce0bf0fdb14';
const SECRET_KEY = process.env.SECRET_KEY || '973cbb1d5a284c2a77fd90688f5412a39accfca933744be402901e97dd574afbfa7d19809c4ed730';

// Generate JWT token for CorpTools API - matching JavaScript examples
function generateToken(path, body = null) {
    let token = "";
    let header = { access_key: ACCESS_KEY };
    let payload = {
        path: path
    };

    if (body) {
        payload.content = CryptoJS.SHA256(JSON.stringify(body)).toString(CryptoJS.enc.Hex);
    } else {
        payload.content = CryptoJS.SHA256(encodeURIComponent('')).toString(CryptoJS.enc.Hex);
    }
    token = jwt_encode(payload, SECRET_KEY, header);
    if (DEBUG) console.log(`token=${token}`);
    return token;
}

// Base request function for CorpTools API - matching JavaScript examples
async function makeCorpToolsRequest(method, path, body = null, queryParams = {}) {
    const token = generateToken(path, body);
    let url = API_URL + path;
    
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
    
    if (DEBUG) console.log(`Axios: ${method} request to url=${url} body=${body}`);
    
    try {
        const response = await axios({
            method: method,
            url: url,
            data: body,
            responseType: 'arraybuffer',
            headers: {
                'Authorization': 'Bearer ' + token,
            }
        });
        
        // Check content type and handle response like JavaScript examples
        const contentType = response.headers['content-type'];
        let responseData;
        
        if (contentType && contentType.includes('application/json')) {
            const dataAsString = response.data.toString();
            responseData = JSON.parse(dataAsString);
            if (DEBUG) console.log('response:', responseData);
        } else {
            responseData = response.data;
        }
        
        return {
            success: true,
            data: responseData,
            status: response.status
        };
    } catch (error) {
        console.log('error:', error.message, error.config?.data);
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
