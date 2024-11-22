const bcrypt = require('bcryptjs');
const userRepository = require('../../persistence/repositories/userRepository');
const User = require('../models/userModel');

async function registerUser(email, password) {
    // Validate email and password
    if (!User.validateEmail(email)) {
        throw new Error('Invalid email format');
    }
    if (!User.validatePassword(password)) {
        throw new Error('Password must be at least 8 characters long, include an uppercase letter, a number, and a special character');
    }

    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    // Transform user data and hash the password
    const user = User.transformData({ email, password });
    user.password = await bcrypt.hash(password, 12);

    await userRepository.createUser(user);
}

async function authenticateUser(email, password) {
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    return user;
}

module.exports = { registerUser, authenticateUser };

