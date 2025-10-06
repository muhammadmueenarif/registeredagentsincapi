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
            email,
            phone,
            amount,
            status = 'pending_payment',
            cardNumber,
            securityCode,
            expMonth,
            expYear,
            token, // Payment token from gateway
            useDifferentBilling = false,
            billingCountry = '',
            billingAddress = '',
            billingCity = '',
            billingState = '',
            billingZip = '',
            companyName,
            entityType
        } = body;

                    // Validate required fields - if using token, card details are optional
                    if (!firstName || !lastName) {
                        return res.status(400).json({
                            success: false,
                            error: 'First name and last name are required'
                        });
                    }

                    // If no token provided, require card details
                    if (!token && (!cardNumber || !securityCode || !expMonth || !expYear)) {
                        return res.status(400).json({
                            success: false,
                            error: 'Card number, security code, expiration month, and expiration year are required when no payment token is provided'
                        });
                    }

                    // Only validate card details if no token provided
                    let cleanCardNumber = '';
                    if (!token && cardNumber) {
                        // Validate card number format (basic validation)
                        cleanCardNumber = cardNumber.replace(/\D/g, '');
                        if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
                            return res.status(400).json({
                                success: false,
                                error: 'Please enter a valid Credit Card Number'
                            });
                        }

                        // Validate security code
                        if (securityCode && (securityCode.length < 3 || securityCode.length > 4)) {
                            return res.status(400).json({
                                success: false,
                                error: 'Security code must be 3-4 digits'
                            });
                        }

                        // Validate expiration date
                        if (expYear && expMonth) {
                            const currentYear = new Date().getFullYear();
                            const currentMonth = new Date().getMonth() + 1;
                            
                            if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
                                return res.status(400).json({
                                    success: false,
                                    error: 'Card has expired'
                                });
                            }
                        }
                    }

                    // Create payment details object
                    const paymentDetails = {
                        id: 'payment-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                        firstName,
                        lastName,
                        email: email || '',
                        phone: phone || '',
                        amount: amount || 0,
                        status: status,
                        companyName: companyName || '',
                        entityType: entityType || '',
                        // Store token if provided, otherwise mask card number
                        token: token || undefined,
                        cardNumber: cardNumber ? cardNumber.replace(/\d(?=\d{4})/g, "*") : undefined, // Mask card number for storage
                        lastFour: cleanCardNumber ? cleanCardNumber.slice(-4) : undefined,
                        securityCode: securityCode ? '***' : undefined, // Don't store actual CVV
                        expMonth: expMonth || undefined,
                        expYear: expYear || undefined,
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
                                   email: paymentDetails.email,
                                   phone: paymentDetails.phone,
                                   amount: paymentDetails.amount,
                                   status: paymentDetails.status,
                                   companyName: paymentDetails.companyName,
                                   entityType: paymentDetails.entityType,
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
