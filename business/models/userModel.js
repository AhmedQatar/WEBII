
//business/models/userModel.js
class User {
    constructor(userData) {
        Object.assign(this, userData); // Dynamically set all fields from userData
    }

    /**
     * Validate the email format.
     * @param {string} email
     * @returns {boolean}
     */
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email regex
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format.');
        }
        return true;
    }

    /**
     * Validate the password strength.
     * @param {string} password
     * @returns {boolean}
     */
    static validatePassword(password) {
        // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number, and one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new Error(
                'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.'
            );
        }
        return true;
    }

    /**
     * Transform the user data before saving (e.g., lowercase email).
     * @param {object} user
     * @returns {object}
     */
    static transformData(user) {
        if (!user.email) {
            throw new Error('Email is required.');
        }

        return {
            ...user,
            email: user.email.toLowerCase(), // Normalize email to lowercase
            fluentLanguages: user.fluentLanguages || [],
            learningLanguages: user.learningLanguages || [],
            badges: user.badges || [],
            profilePhoto: user.profilePhoto,
            contacts:user.contacts,
            blockedUsers: user.blockedUsers,
            createdAt: user.createdAt || new Date(), // Default to now if not provided
            lastLogin: user.lastLogin || null, // Default to null if not provided
        };
    }


    /**
     * Sanitize input data (optional).
     * @param {string} input
     * @returns {string}
     */
    static sanitizeInput(input) {
        return input.replace(/[^a-zA-Z0-9@.]/g, ''); // Removes invalid characters
    }
}

module.exports = User;

