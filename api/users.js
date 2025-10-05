// Shared user storage for the API
// In production, this would be a database

let users = [
    { 
        id: 'user-001',
        email: 'hostwinds8989@proton.me', 
        password: 'Anhy123456@', 
        firstName: 'Hostwinds', 
        lastName: 'User',
        createdAt: '2025-09-28T00:00:00.000Z',
        status: 'active',
        companies: [] // Track companies created by this user
    }
];

function addUser(user) {
    // Generate unique ID for new user
    const userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const newUser = {
        ...user,
        id: userId,
        companies: [] // Initialize empty companies array
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

function getAllUsers() {
    return users.map(u => ({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
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
    getAllUsers,
    users
};
