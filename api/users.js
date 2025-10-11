// Firebase Firestore integration for user storage
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, serverTimestamp } = require('firebase/firestore');

// Initialize Firebase (client-side config for server)
let db;
try {
  // Check if we have Firebase config
  if (process.env.FIREBASE_PROJECT_ID) {
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDyL_aadGzyozNjU6QKoRgHjJ_jxlwWJxU",
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || "maple-educators-app.firebaseapp.com",
      projectId: process.env.FIREBASE_PROJECT_ID || "maple-educators-app",
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "maple-educators-app.firebasestorage.app",
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "782200920015",
      appId: process.env.FIREBASE_APP_ID || "1:782200920015:web:7c87d1cb8868e7e02024ba",
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-E4TB3CLH62"
    };

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✅ Firebase Firestore initialized with client config');
  } else {
    console.log('⚠️ Firebase config not found');
    console.log('🔄 Running without Firebase - user data will not persist');
    db = null;
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.log('🔄 Running without Firebase - user data will not persist');
  db = null;
}

// In-memory storage for testing when Firebase is not available
const inMemoryUsers = new Map();

// Initialize with existing user data for testing
const existingUser = {
    id: "user-1760200110258-x1qkcszui",
    firstName: "Usman Pervaiz",
    lastName: "Pervaiz",
    email: "creatacciutn@proton.me",
    password: "lz!0a=:T3N}6",
    phone: "03065409758",
    country: "US",
    address: "as",
    city: "Talagang",
    state: "Arkansas",
    zipCode: "48100",
    status: "active",
    companies: [
        {
            id: "test-company-001",
            name: "Test Company LLC",
            createdAt: "2025-10-11T16:59:00.000Z"
        }
    ], // Initialize with a test company
    payments: [],
    attorneys: [],
    businessIdentity: [],
    cart: [],
    createdAt: "11 October 2025 at 21:28:30 UTC+5"
};

inMemoryUsers.set(existingUser.id, existingUser);
// Also store with the ID without 'user-' prefix for compatibility
const userIdWithoutPrefix = existingUser.id.replace('user-', '');
inMemoryUsers.set(userIdWithoutPrefix, existingUser);

console.log('✅ Initialized in-memory storage with existing user data');

async function addUser(user) {
    if (db) {
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
            // Use Firestore client SDK
            await setDoc(doc(db, 'user_accounts', userId), {
                ...newUser,
                createdAt: serverTimestamp()
            });
            console.log('✅ User saved to Firestore:', userId);
            return newUser;
        } catch (error) {
            console.error('❌ Error saving user:', error);
            throw error;
        }
    } else {
        // Use in-memory storage for testing
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

        inMemoryUsers.set(userId, newUser);
        console.log('✅ User saved to in-memory storage:', userId);
        return newUser;
    }
}

async function findUserByEmail(email) {
    if (db) {
        try {
            const q = query(collection(db, 'user_accounts'), where('email', '==', email));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('❌ Error finding user by email:', error);
            throw error;
        }
    } else {
        // Use in-memory storage for testing
        for (const [userId, user] of inMemoryUsers) {
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }
}

async function findUserByCredentials(email, password) {
    if (db) {
        try {
            const q = query(
                collection(db, 'user_accounts'),
                where('email', '==', email),
                where('password', '==', password)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('❌ Error finding user by credentials:', error);
            throw error;
        }
    } else {
        // Use in-memory storage for testing
        for (const [userId, user] of inMemoryUsers) {
            if (user.email === email && user.password === password) {
                return user;
            }
        }
        return null;
    }
}

async function findUserById(userId) {
    // Use in-memory storage for now since Firebase is not properly configured
    try {
        return inMemoryUsers.get(userId) || null;
    } catch (error) {
        console.error('❌ Error finding user by ID:', error);
        return null;
    }
}

async function addCompanyToUser(userId, companyId, companyName) {
    // Use in-memory storage for now since Firebase is not properly configured
    try {
        console.log('🔍 addCompanyToUser called with:', { userId, companyId, companyName });
        console.log('🔍 Available user IDs:', Array.from(inMemoryUsers.keys()));
        const user = inMemoryUsers.get(userId);
        console.log('🔍 User found:', user ? 'YES' : 'NO');
        
        if (user) {
            if (!user.companies) {
                user.companies = [];
            }

            user.companies.push({
                id: companyId,
                name: companyName,
                createdAt: new Date().toISOString()
            });

            console.log('✅ Company added to user in in-memory storage:', userId, companyId);
            console.log('✅ User now has', user.companies.length, 'companies');
            return true;
        }
        console.log('❌ User not found for ID:', userId);
        return false;
    } catch (error) {
        console.error('❌ Error adding company to user:', error);
        return false;
    }
}

async function getUserCompanies(userId) {
    // Use in-memory storage for now since Firebase is not properly configured
    try {
        const user = inMemoryUsers.get(userId);
        return user ? (user.companies || []) : [];
    } catch (error) {
        console.error('❌ Error getting user companies:', error);
        return [];
    }
}

async function addPaymentToUser(userId, paymentDetails) {
    if (!db) {
        throw new Error('Firebase not configured - cannot save user data');
    }

    try {
        const userRef = doc(db, 'user_accounts', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const payments = userData.payments || [];

            // If this is the first payment method, make it default
            if (payments.length === 0) {
                paymentDetails.isDefault = true;
            }

            payments.push(paymentDetails);
            await updateDoc(userRef, { payments });
            console.log('✅ Payment added to user in Firestore:', userId);
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Error adding payment to user:', error);
        throw error;
    }
}

async function getUserPayments(userId) {
    if (!db) {
        throw new Error('Firebase not configured - cannot access user data');
    }

    try {
        const userRef = doc(db, 'user_accounts', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            return userData.payments || [];
        }
        return [];
    } catch (error) {
        console.error('❌ Error getting user payments:', error);
        throw error;
    }
}

// Attorney management functions
async function addAttorneyToUser(userId, attorneyInfo) {
    if (!db) {
        throw new Error('Firebase not configured - cannot save user data');
    }

    try {
        const userRef = doc(db, 'user_accounts', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const attorneys = userData.attorneys || [];
            attorneys.push(attorneyInfo);
            await updateDoc(userRef, { attorneys });
            console.log('✅ Attorney added to user in Firestore:', userId);
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Error adding attorney to user:', error);
        throw error;
    }
}

async function getUserAttorneys(userId) {
    if (!db) {
        throw new Error('Firebase not configured - cannot access user data');
    }

    try {
        const userRef = doc(db, 'user_accounts', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            return userData.attorneys || [];
        }
        return [];
    } catch (error) {
        console.error('❌ Error getting user attorneys:', error);
        throw error;
    }
}

// Business identity management functions
async function addBusinessIdentityToUser(userId, businessIdentity) {
    try {
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
        return false;
    } catch (error) {
        console.error('❌ Error adding business identity to user:', error);
        return false;
    }
}

async function getUserBusinessIdentity(userId) {
    try {
        const userDoc = await db.collection('user_accounts').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            return userData.businessIdentity || [];
        }
        return [];
    } catch (error) {
        console.error('❌ Error getting user business identity:', error);
        return [];
    }
}

// Shopping cart management functions
async function addToCart(userId, cartItem) {
    try {
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
        return false;
    } catch (error) {
        console.error('❌ Error adding to cart:', error);
        return false;
    }
}

async function getCart(userId) {
    try {
        const userDoc = await db.collection('user_accounts').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            return userData.cart || [];
        }
        return [];
    } catch (error) {
        console.error('❌ Error getting cart:', error);
        return [];
    }
}

async function updateCartItem(userId, itemId, quantity) {
    try {
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
        return false;
    } catch (error) {
        console.error('❌ Error updating cart item:', error);
        return false;
    }
}

async function removeFromCart(userId, itemId) {
    try {
        const userRef = db.collection('user_accounts').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            const cart = userData.cart || [];
            const updatedCart = cart.filter(item => item.id !== itemId);
            await userRef.update({ cart: updatedCart });
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Error removing from cart:', error);
        return false;
    }
}

async function clearCart(userId) {
    try {
        const userRef = db.collection('user_accounts').doc(userId);
        await userRef.update({ cart: [] });
        console.log('✅ Cart cleared in Firestore:', userId);
        return true;
    } catch (error) {
        console.error('❌ Error clearing cart:', error);
        return false;
    }
}

async function getAllUsers() {
    try {
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
    getAllUsers
};
