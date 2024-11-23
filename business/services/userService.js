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


/**
 * Update the user profile in the database.
 * @param {string} userId - The ID of the user.
 * @param {object} updates - The fields to update (e.g., fluentLanguages, learningLanguages).
 * @returns {Promise<object>} - The updated user object.
 */
async function updateUserProfile(userId, updates) {
    try {
        const updatedUser = await userRepository.updateUserProfile(userId, updates);

        if (!updatedUser) {
            throw new Error('User not found.');
        }

        return updatedUser;
    } catch (error) {
        console.error('Error updating user profile:', error.message);
        throw new Error('Failed to update user profile.');
    }
}

async function removeContact(userId, contactId) {
   await userRepository.removeContact(userId, contactId)
}

async function unblockUser(userId, blockedUserId) {
   await userRepository.unblockUser(userId,blockedUserId)
}


async function addContact(userId, contactIdOrEmail) {
   await userRepository.addContact(userId,contactIdOrEmail)
}

async function blockUser(userId, userIdOrEmail) {
   await userRepository.blockUser(userId,userIdOrEmail)
}

async function removeContact(userId, contactId) {
    return userRepository.removeContact(userId, contactId);
}

async function unblockUser(userId, blockedUserId) {
    return userRepository.unblockUser(userId, blockedUserId);
}


module.exports = { getUserById, removeContact, blockUser, unblockUser, addContact, blockUser, updateUserProfile};




