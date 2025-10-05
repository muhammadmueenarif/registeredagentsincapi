// Shared user storage for the API
// In production, this would be a database

let users = [
    { 
        id: 'user-001',
        email: 'hostwinds8989@proton.me', 
        password: 'Anhy123456@', 
        firstName: 'Hostwinds', 
        lastName: 'User',
        phone: '',
        country: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        createdAt: '2025-09-28T00:00:00.000Z',
        status: 'active',
        companies: [], // Track companies created by this user
        payments: [], // Track payment methods for this user
        attorneys: [], // Track attorney information for this user
        businessIdentity: [], // Track business identity services for this user
        cart: [] // Track shopping cart items for this user
    }
];

function addUser(user) {
    // Generate unique ID for new user
    const userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const newUser = {
        ...user,
        id: userId,
        companies: [], // Initialize empty companies array
        payments: [], // Initialize empty payments array
        attorneys: [], // Initialize empty attorneys array
        businessIdentity: [], // Initialize empty business identity array
        cart: [] // Initialize empty cart array
    };
    users.push(newUser);
    return newUser;
}

function findUserByEmail(email) {
    return users.find(u => u.email === email);
}

function findUserByCredentials(email, password) {
    return users.find(u => u.email === email && u.password === password);
}

function findUserById(userId) {
    return users.find(u => u.id === userId);
}

function addCompanyToUser(userId, companyId, companyName) {
    const user = findUserById(userId);
    if (user) {
        user.companies.push({
            id: companyId,
            name: companyName,
            createdAt: new Date().toISOString()
        });
        return true;
    }
    return false;
}

function getUserCompanies(userId) {
    const user = findUserById(userId);
    return user ? user.companies : [];
}

function addPaymentToUser(userId, paymentDetails) {
    const user = findUserById(userId);
    if (user) {
        // If this is the first payment method, make it default
        if (user.payments.length === 0) {
            paymentDetails.isDefault = true;
        }
        
        user.payments.push(paymentDetails);
        return true;
    }
    return false;
}

function getUserPayments(userId) {
    const user = findUserById(userId);
    return user ? user.payments : [];
}

// Attorney management functions
function addAttorneyToUser(userId, attorneyInfo) {
    const user = findUserById(userId);
    if (user) {
        user.attorneys.push(attorneyInfo);
        return true;
    }
    return false;
}

function getUserAttorneys(userId) {
    const user = findUserById(userId);
    return user ? user.attorneys : [];
}

// Business identity management functions
function addBusinessIdentityToUser(userId, businessIdentity) {
    const user = findUserById(userId);
    if (user) {
        user.businessIdentity.push(businessIdentity);
        return true;
    }
    return false;
}

function getUserBusinessIdentity(userId) {
    const user = findUserById(userId);
    return user ? user.businessIdentity : [];
}

// Shopping cart management functions
function addToCart(userId, cartItem) {
    const user = findUserById(userId);
    if (user) {
        // Check if item already exists in cart
        const existingItem = user.cart.find(item => item.serviceId === cartItem.serviceId);
        if (existingItem) {
            // Update quantity if item exists
            existingItem.quantity += cartItem.quantity;
            existingItem.updatedAt = new Date().toISOString();
        } else {
            // Add new item to cart
            user.cart.push(cartItem);
        }
        return true;
    }
    return false;
}

function getCart(userId) {
    const user = findUserById(userId);
    return user ? user.cart : [];
}

function updateCartItem(userId, itemId, quantity) {
    const user = findUserById(userId);
    if (user) {
        const item = user.cart.find(item => item.id === itemId);
        if (item) {
            if (quantity === 0) {
                // Remove item if quantity is 0
                user.cart = user.cart.filter(item => item.id !== itemId);
            } else {
                item.quantity = quantity;
                item.updatedAt = new Date().toISOString();
            }
            return true;
        }
    }
    return false;
}

function removeFromCart(userId, itemId) {
    const user = findUserById(userId);
    if (user) {
        const initialLength = user.cart.length;
        user.cart = user.cart.filter(item => item.id !== itemId);
        return user.cart.length < initialLength;
    }
    return false;
}

function clearCart(userId) {
    const user = findUserById(userId);
    if (user) {
        user.cart = [];
        return true;
    }
    return false;
}

function getAllUsers() {
    return users.map(u => ({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        country: u.country,
        address: u.address,
        city: u.city,
        state: u.state,
        zipCode: u.zipCode,
        createdAt: u.createdAt,
        status: u.status
    }));
}

module.exports = {
    addUser,
    findUserByEmail,
    findUserByCredentials,
    findUserById,
    addCompanyToUser,
    getUserCompanies,
    addPaymentToUser,
    getUserPayments,
    addAttorneyToUser,
    getUserAttorneys,
    addBusinessIdentityToUser,
    getUserBusinessIdentity,
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getAllUsers,
    users
};
