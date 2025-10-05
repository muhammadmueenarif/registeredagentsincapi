// Payment Details API Endpoint
const { authenticateUser } = require('./auth_middleware');
const { addPaymentToUser, getUserPayments } = require('./users');

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
            // Require authentication for adding payment details
            authenticateUser(req, res, async () => {
                try {
                    const {
                        firstName,
                        lastName,
                        cardNumber,
                        securityCode,
                        expMonth,
                        expYear,
                        useDifferentBilling = false,
                        billingCountry = '',
                        billingAddress = '',
                        billingCity = '',
                        billingState = '',
                        billingZip = ''
                    } = body;

                    // Validate required fields
                    if (!firstName || !lastName || !cardNumber || !securityCode || !expMonth || !expYear) {
                        return res.status(400).json({
                            success: false,
                            error: 'First name, last name, card number, security code, expiration month, and expiration year are required'
                        });
                    }

                    // Validate card number format (basic validation)
                    const cleanCardNumber = cardNumber.replace(/\D/g, '');
                    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
                        return res.status(400).json({
                            success: false,
                            error: 'Please enter a valid Credit Card Number'
                        });
                    }

                    // Validate security code
                    if (securityCode.length < 3 || securityCode.length > 4) {
                        return res.status(400).json({
                            success: false,
                            error: 'Security code must be 3-4 digits'
                        });
                    }

                    // Validate expiration date
                    const currentYear = new Date().getFullYear();
                    const currentMonth = new Date().getMonth() + 1;
                    
                    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
                        return res.status(400).json({
                            success: false,
                            error: 'Card has expired'
                        });
                    }

                    // Create payment details object
                    const paymentDetails = {
                        id: 'payment-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                        firstName,
                        lastName,
                        cardNumber: cardNumber.replace(/\d(?=\d{4})/g, "*"), // Mask card number for storage
                        lastFour: cleanCardNumber.slice(-4),
                        securityCode: '***', // Don't store actual CVV
                        expMonth,
                        expYear,
                        useDifferentBilling,
                        billingCountry,
                        billingAddress,
                        billingCity,
                        billingState,
                        billingZip,
                        createdAt: new Date().toISOString(),
                        isDefault: false // Will be set to true if this is the first payment method
                    };

                    // Add payment method to user
                    const success = addPaymentToUser(req.user.id, paymentDetails);

                    if (success) {
                        res.status(200).json({
                            success: true,
                            data: {
                                message: 'Payment details saved successfully',
                                payment: {
                                    id: paymentDetails.id,
                                    firstName: paymentDetails.firstName,
                                    lastName: paymentDetails.lastName,
                                    cardNumber: paymentDetails.cardNumber,
                                    lastFour: paymentDetails.lastFour,
                                    expMonth: paymentDetails.expMonth,
                                    expYear: paymentDetails.expYear,
                                    useDifferentBilling: paymentDetails.useDifferentBilling,
                                    billingCountry: paymentDetails.billingCountry,
                                    billingAddress: paymentDetails.billingAddress,
                                    billingCity: paymentDetails.billingCity,
                                    billingState: paymentDetails.billingState,
                                    billingZip: paymentDetails.billingZip,
                                    createdAt: paymentDetails.createdAt,
                                    isDefault: paymentDetails.isDefault
                                },
                                user: {
                                    id: req.user.id,
                                    email: req.user.email
                                }
                            }
                        });
                    } else {
                        res.status(500).json({
                            success: false,
                            error: 'Failed to save payment details'
                        });
                    }
                } catch (error) {
                    console.error('Error saving payment details:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to save payment details'
                    });
                }
            });
        }
        else if (method === 'GET') {
            // Require authentication for getting payment details
            authenticateUser(req, res, async () => {
                try {
                    const userPayments = getUserPayments(req.user.id);
                    
                    res.status(200).json({
                        success: true,
                        data: {
                            message: `Found ${userPayments.length} payment methods for user ${req.user.email}`,
                            payments: userPayments
                        }
                    });
                } catch (error) {
                    console.error('Error getting payment details:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to retrieve payment details'
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
        console.error('Payment API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}

module.exports = handler;
