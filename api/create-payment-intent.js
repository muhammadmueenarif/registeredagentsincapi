// Stripe configuration - use environment variable for security
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe
let stripe;
try {
    if (!STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    const Stripe = require('stripe');
    stripe = new Stripe(STRIPE_SECRET_KEY);
    console.log('✅ Stripe initialized with environment key');
} catch (error) {
    console.log('⚠️ Stripe initialization failed:', error.message);
}

// Create payment intent handler function
async function createPaymentIntentHandler(req, res) {
    console.log('🔔 Payment intent endpoint called with:', req.body);
    try {
        const { amount, currency = 'usd', customer_email, metadata } = req.body;

        if (!amount) {
            return res.status(400).json({
                success: false,
                error: 'Amount is required'
            });
        }

        if (!stripe) {
            return res.status(500).json({
                success: false,
                error: 'Stripe not configured. Please install stripe package.'
            });
        }

        // Create payment intent with Stripe (without payment method - let frontend handle it)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            // Don't pass payment_method - let frontend create and confirm in one step
            confirm: false, // Don't auto-confirm, let client handle confirmation
            receipt_email: customer_email,
            metadata: {
                company_name: metadata?.company_name || 'Unknown Company',
                entity_type: metadata?.entity_type || 'Unknown',
                user_id: metadata?.user_id || 'unknown'
            },
            description: `Business formation order - ${metadata?.company_name || 'Company'}`
        });

        console.log('✅ Payment intent created:', paymentIntent.id);

        res.status(200).json({
            success: true,
            paymentIntent: {
                id: paymentIntent.id,
                client_secret: paymentIntent.client_secret,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status
            }
        });

    } catch (error) {
        console.error('❌ Error creating payment intent:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create payment intent'
        });
    }
}

module.exports = createPaymentIntentHandler;