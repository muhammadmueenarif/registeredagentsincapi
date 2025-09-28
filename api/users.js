// Shared user storage for the API
// In production, this would be a database

let users = [
    { 
        email: 'hostwinds8989@proton.me', 
        password: 'Anhy123456@', 
        firstName: 'Hostwinds', 
        lastName: 'User',
        createdAt: '2025-09-28T00:00:00.000Z',
        status: 'active'
    }
];

function addUser(user) {
    users.push(user);
}

function findUserByEmail(email) {
    return users.find(u => u.email === email);
}

function findUserByCredentials(email, password) {
    return users.find(u => u.email === email && u.password === password);
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
    getAllUsers,
    users
};
