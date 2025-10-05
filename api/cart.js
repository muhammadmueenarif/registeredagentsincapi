// Shopping Cart API Endpoint
const { authenticateUser } = require('./auth_middleware');
const { addToCart, getCart, updateCartItem, removeFromCart, clearCart } = require('./users');

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
            // Require authentication for adding items to cart
            authenticateUser(req, res, async () => {
                try {
                    const {
                        serviceId,
                        serviceName,
                        serviceType,
                        price,
                        quantity = 1,
                        description = '',
                        category = 'business-services'
                    } = body;

                    // Validate required fields
                    if (!serviceId || !serviceName || !price) {
                        return res.status(400).json({
                            success: false,
                            error: 'Service ID, name, and price are required'
                        });
                    }

                    // Validate price
                    if (isNaN(price) || price < 0) {
                        return res.status(400).json({
                            success: false,
                            error: 'Price must be a valid positive number'
                        });
                    }

                    // Create cart item
                    const cartItem = {
                        id: 'cart-item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                        serviceId,
                        serviceName,
                        serviceType,
                        price: parseFloat(price),
                        quantity: parseInt(quantity),
                        description,
                        category,
                        addedAt: new Date().toISOString()
                    };

                    // Add item to cart
                    const success = addToCart(req.user.id, cartItem);

                    if (success) {
                        res.status(200).json({
                            success: true,
                            data: {
                                message: 'Item added to cart successfully',
                                cartItem: cartItem,
                                user: {
                                    id: req.user.id,
                                    email: req.user.email
                                }
                            }
                        });
                    } else {
                        res.status(500).json({
                            success: false,
                            error: 'Failed to add item to cart'
                        });
                    }
                } catch (error) {
                    console.error('Error adding item to cart:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to add item to cart'
                    });
                }
            });
        }
        else if (method === 'GET') {
            // Require authentication for getting cart
            authenticateUser(req, res, async () => {
                try {
                    const userCart = getCart(req.user.id);
                    const totalItems = userCart.reduce((sum, item) => sum + item.quantity, 0);
                    const totalPrice = userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    
                    res.status(200).json({
                        success: true,
                        data: {
                            message: `Found ${userCart.length} items in cart for user ${req.user.email}`,
                            cart: userCart,
                            summary: {
                                totalItems,
                                totalPrice: parseFloat(totalPrice.toFixed(2)),
                                itemCount: userCart.length
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error getting cart:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to retrieve cart'
                    });
                }
            });
        }
        else if (method === 'PATCH') {
            // Require authentication for updating cart item
            authenticateUser(req, res, async () => {
                try {
                    const { itemId, quantity } = body;

                    if (!itemId || quantity === undefined) {
                        return res.status(400).json({
                            success: false,
                            error: 'Item ID and quantity are required'
                        });
                    }

                    if (quantity < 0) {
                        return res.status(400).json({
                            success: false,
                            error: 'Quantity must be 0 or greater'
                        });
                    }

                    const success = updateCartItem(req.user.id, itemId, parseInt(quantity));

                    if (success) {
                        res.status(200).json({
                            success: true,
                            data: {
                                message: 'Cart item updated successfully',
                                itemId,
                                newQuantity: quantity
                            }
                        });
                    } else {
                        res.status(404).json({
                            success: false,
                            error: 'Cart item not found'
                        });
                    }
                } catch (error) {
                    console.error('Error updating cart item:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to update cart item'
                    });
                }
            });
        }
        else if (method === 'DELETE') {
            // Require authentication for removing items from cart
            authenticateUser(req, res, async () => {
                try {
                    const { itemId } = body;

                    if (!itemId) {
                        return res.status(400).json({
                            success: false,
                            error: 'Item ID is required'
                        });
                    }

                    const success = removeFromCart(req.user.id, itemId);

                    if (success) {
                        res.status(200).json({
                            success: true,
                            data: {
                                message: 'Item removed from cart successfully',
                                itemId
                            }
                        });
                    } else {
                        res.status(404).json({
                            success: false,
                            error: 'Cart item not found'
                        });
                    }
                } catch (error) {
                    console.error('Error removing item from cart:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to remove item from cart'
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
        console.error('Cart API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}

module.exports = handler;
