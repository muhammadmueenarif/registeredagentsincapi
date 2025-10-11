// Firebase Firestore integration for user storage
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (for server-side)
let db;
try {
  // Check if we have Firebase environment variables
  if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    db = admin.firestore();
    console.log('✅ Firebase Firestore initialized with environment variables');
  } else {
    console.log('⚠️ Firebase environment variables not found, falling back to in-memory storage');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  // Fallback to in-memory storage for development
  console.log('🔄 Falling back to in-memory storage');
}

// In-memory fallback for development/testing
let users = [];

async function addUser(user) {
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

    try {
        if (db) {
            // Use Firestore
            await db.collection('user_accounts').doc(userId).set({
                ...newUser,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ User saved to Firestore:', userId);
        } else {
            // Fallback to in-memory
            users.push(newUser);
        }
        return newUser;
    } catch (error) {
        console.error('❌ Error saving user:', error);
        // Fallback to in-memory
        users.push(newUser);
        return newUser;
    }
}

async function findUserByEmail(email) {
    try {
        if (db) {
            const snapshot = await db.collection('user_accounts').where('email', '==', email).get();
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
        } else {
            return users.find(u => u.email === email);
        }
    } catch (error) {
        console.error('❌ Error finding user by email:', error);
        return users.find(u => u.email === email);
    }
    return null;
}

async function findUserByCredentials(email, password) {
    try {
        if (db) {
            const snapshot = await db.collection('user_accounts').where('email', '==', email).where('password', '==', password).get();
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
        } else {
            return users.find(u => u.email === email && u.password === password);
        }
    } catch (error) {
        console.error('❌ Error finding user by credentials:', error);
        return users.find(u => u.email === email && u.password === password);
    }
    return null;
}

async function findUserById(userId) {
    try {
        if (db) {
            const doc = await db.collection('user_accounts').doc(userId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
        } else {
            return users.find(u => u.id === userId);
        }
    } catch (error) {
        console.error('❌ Error finding user by ID:', error);
        return users.find(u => u.id === userId);
    }
    return null;
}

async function addCompanyToUser(userId, companyId, companyName) {
    try {
        if (db) {
            const userRef = db.collection('user_accounts').doc(userId);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                const companies = userData.companies || [];

                companies.push({
                    id: companyId,
                    name: companyName,
                    createdAt: new Date().toISOString()
                });

                await userRef.update({ companies });
                console.log('✅ Company added to user in Firestore:', userId, companyId);
                return true;
            }
        } else {
            const user = users.find(u => u.id === userId);
            if (user) {
                user.companies.push({
                    id: companyId,
                    name: companyName,
                    createdAt: new Date().toISOString()
                });
                return true;
            }
        }
    } catch (error) {
        console.error('❌ Error adding company to user:', error);
        return false;
    }
    return false;
}

async function getUserCompanies(userId) {
    try {
        if (db) {
            const userDoc = await db.collection('user_accounts').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                return userData.companies || [];
            }
        } else {
            const user = users.find(u => u.id === userId);
            return user ? user.companies : [];
        }
    } catch (error) {
        console.error('❌ Error getting user companies:', error);
        const user = users.find(u => u.id === userId);
        return user ? user.companies : [];
    }
    return [];
}

async function addPaymentToUser(userId, paymentDetails) {
    try {
        if (db) {
            const userRef = db.collection('user_accounts').doc(userId);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                const payments = userData.payments || [];

                // If this is the first payment method, make it default
                if (payments.length === 0) {
                    paymentDetails.isDefault = true;
                }

                payments.push(paymentDetails);
                await userRef.update({ payments });
                console.log('✅ Payment added to user in Firestore:', userId);
                return true;
            }
        } else {
            const user = users.find(u => u.id === userId);
            if (user) {
                // If this is the first payment method, make it default
                if (user.payments.length === 0) {
                    paymentDetails.isDefault = true;
                }
                user.payments.push(paymentDetails);
                return true;
            }
        }
    } catch (error) {
        console.error('❌ Error adding payment to user:', error);
        return false;
    }
    return false;
}

async function getUserPayments(userId) {
    try {
        if (db) {
            const userDoc = await db.collection('user_accounts').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                return userData.payments || [];
            }
        } else {
            const user = users.find(u => u.id === userId);
            return user ? user.payments : [];
        }
    } catch (error) {
        console.error('❌ Error getting user payments:', error);
        const user = users.find(u => u.id === userId);
        return user ? user.payments : [];
    }
    return [];
}

// Attorney management functions
async function addAttorneyToUser(userId, attorneyInfo) {
    try {
        if (db) {
            const userRef = db.collection('user_accounts').doc(userId);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                const attorneys = userData.attorneys || [];
                attorneys.push(attorneyInfo);
                await userRef.update({ attorneys });
                console.log('✅ Attorney added to user in Firestore:', userId);
                return true;
            }
        } else {
            const user = users.find(u => u.id === userId);
            if (user) {
                user.attorneys.push(attorneyInfo);
                return true;
            }
        }
    } catch (error) {
        console.error('❌ Error adding attorney to user:', error);
        return false;
    }
    return false;
}

async function getUserAttorneys(userId) {
    try {
        if (db) {
            const userDoc = await db.collection('user_accounts').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                return userData.attorneys || [];
            }
        } else {
            const user = users.find(u => u.id === userId);
            return user ? user.attorneys : [];
        }
    } catch (error) {
        console.error('❌ Error getting user attorneys:', error);
        const user = users.find(u => u.id === userId);
        return user ? user.attorneys : [];
    }
    return [];
}

// Business identity management functions
async function addBusinessIdentityToUser(userId, businessIdentity) {
    try {
        if (db) {
            const userRef = db.collection('user_accounts').doc(userId);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                const businessIdentities = userData.businessIdentity || [];
                businessIdentities.push(businessIdentity);
                await userRef.update({ businessIdentity: businessIdentities });
                console.log('✅ Business identity added to user in Firestore:', userId);
                return true;
            }
        } else {
            const user = users.find(u => u.id === userId);
            if (user) {
                user.businessIdentity.push(businessIdentity);
                return true;
            }
        }
    } catch (error) {
        console.error('❌ Error adding business identity to user:', error);
        return false;
    }
    return false;
}

async function getUserBusinessIdentity(userId) {
    try {
        if (db) {
            const userDoc = await db.collection('user_accounts').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                return userData.businessIdentity || [];
            }
        } else {
            const user = users.find(u => u.id === userId);
            return user ? user.businessIdentity : [];
        }
    } catch (error) {
        console.error('❌ Error getting user business identity:', error);
        const user = users.find(u => u.id === userId);
        return user ? user.businessIdentity : [];
    }
    return [];
}

// Shopping cart management functions
async function addToCart(userId, cartItem) {
    try {
        if (db) {
            const userRef = db.collection('user_accounts').doc(userId);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                const cart = userData.cart || [];

                // Check if item already exists in cart
                const existingItem = cart.find(item => item.serviceId === cartItem.serviceId);
                if (existingItem) {
                    // Update quantity if item exists
                    existingItem.quantity += cartItem.quantity;
                    existingItem.updatedAt = new Date().toISOString();
                } else {
                    // Add new item to cart
                    cart.push(cartItem);
                }

                await userRef.update({ cart });
                console.log('✅ Item added to cart in Firestore:', userId);
                return true;
            }
        } else {
            const user = users.find(u => u.id === userId);
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
        }
    } catch (error) {
        console.error('❌ Error adding to cart:', error);
        return false;
    }
    return false;
}

async function getCart(userId) {
    try {
        if (db) {
            const userDoc = await db.collection('user_accounts').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                return userData.cart || [];
            }
        } else {
            const user = users.find(u => u.id === userId);
            return user ? user.cart : [];
        }
    } catch (error) {
        console.error('❌ Error getting cart:', error);
        const user = users.find(u => u.id === userId);
        return user ? user.cart : [];
    }
    return [];
}

async function updateCartItem(userId, itemId, quantity) {
    try {
        if (db) {
            const userRef = db.collection('user_accounts').doc(userId);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                const cart = userData.cart || [];
                const item = cart.find(item => item.id === itemId);

                if (item) {
                    if (quantity === 0) {
                        // Remove item if quantity is 0
                        const updatedCart = cart.filter(item => item.id !== itemId);
                        await userRef.update({ cart: updatedCart });
                    } else {
                        item.quantity = quantity;
                        item.updatedAt = new Date().toISOString();
                        await userRef.update({ cart });
                    }
                    return true;
                }
            }
        } else {
            const user = users.find(u => u.id === userId);
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
        }
    } catch (error) {
        console.error('❌ Error updating cart item:', error);
        return false;
    }
    return false;
}

async function removeFromCart(userId, itemId) {
    try {
        if (db) {
            const userRef = db.collection('user_accounts').doc(userId);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                const cart = userData.cart || [];
                const updatedCart = cart.filter(item => item.id !== itemId);
                await userRef.update({ cart: updatedCart });
                return true;
            }
        } else {
            const user = users.find(u => u.id === userId);
            if (user) {
                const initialLength = user.cart.length;
                user.cart = user.cart.filter(item => item.id !== itemId);
                return user.cart.length < initialLength;
            }
        }
    } catch (error) {
        console.error('❌ Error removing from cart:', error);
        return false;
    }
    return false;
}

async function clearCart(userId) {
    try {
        if (db) {
            const userRef = db.collection('user_accounts').doc(userId);
            await userRef.update({ cart: [] });
            console.log('✅ Cart cleared in Firestore:', userId);
            return true;
        } else {
            const user = users.find(u => u.id === userId);
            if (user) {
                user.cart = [];
                return true;
            }
        }
    } catch (error) {
        console.error('❌ Error clearing cart:', error);
        return false;
    }
    return false;
}

async function getAllUsers() {
    try {
        if (db) {
            const snapshot = await db.collection('user_accounts').get();
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone,
                    country: data.country,
                    address: data.address,
                    city: data.city,
                    state: data.state,
                    zipCode: data.zipCode,
                    createdAt: data.createdAt,
                    status: data.status
                };
            });
        } else {
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
    } catch (error) {
        console.error('❌ Error getting all users:', error);
        return [];
    }
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
