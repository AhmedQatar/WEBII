const userRepository = require('../../persistence/repositories/userRepository');
const User = require('../models/userModel');

async function getUserById(userId) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Transform the user data before returning
    return User.transformData(user);
}

module.exports = { getUserById };

