// presentation/controllers/authController.js
const authService = require('../../business/services/authService');

async function register(req, res) {
    const { email, password } = req.body;
    console.log('Request body:', req.body);
    console.log('Registration attempt:', { email, password }); // Log incoming data
    try {
        await authService.registerUser(email, password);
        res.redirect('/auth/login'); // Redirect to login page after successful registration
    } catch (error) {
        console.error('Registration error:', error.message); // Log the error
        res.status(400).render('register', { errorMessage: error.message, csrfToken: req.csrfToken() });
    }
}

async function login(req, res) {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password }); // Log incoming data
    try {
        const user = await authService.authenticateUser(email, password);
        console.log('Authenticated user:', user);
        req.session.userId = user._id; // Store user ID in the session
        req.session.isAuthenticated = true;
        res.redirect('/profile');
    } catch (error) {
        res.status(400).render('login', { errorMessage: error.message, csrfToken: req.csrfToken() });
    }
}

function logout(req, res) {
    req.session = null; // Clear session
    res.redirect('/auth/login');
}

module.exports = { register, login, logout };
