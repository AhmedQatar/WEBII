class User {
    constructor({ email, password }) {
        this.email = email;
        this.password = password;
    }

    /**
     * Validate the email format.
     */
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate the password strength.
     */
    static validatePassword(password) {
        // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number, and one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    /**
     * Transform the user data before saving (e.g., lowercase email).
     */
    static transformData(user) {
        return {
            ...user,
            email: user.email.toLowerCase(),
        };
    }
}

module.exports = User;
