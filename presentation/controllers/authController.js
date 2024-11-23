// presentation/controllers/authController.js
const authService = require('../../business/services/authService');
const session = require('express-session');
const bodyParser= require('body-parser')
const sessionMiddleware= require('../../middleware/sessionMiddleware')



const userRepository = require('../../persistence/repositories/userRepository');

async function register(req, res) {
    const { email, password, fluentLanguages, learningLanguages } = req.body;
    const fluentLanguagesArray = fluentLanguages.split(',').map(lang => lang.trim());
    const learningLanguagesArray = learningLanguages.split(',').map(lang => lang.trim());

    try {
        await authService.registerUser(
            email,
            password,
            fluentLanguagesArray,
            learningLanguagesArray
        );

        console.log(`Simulated email sent to ${email}: Please verify your account.`);
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Error registering user:', error.message);
        res.status(400).render('register', { errorMessage: error.message });
    }
}


async function login(req, res) {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password }); // Log incoming data
    try {
        // Authenticate user
        const user = await authService.authenticateUser(email, password);
        
        // Store user details in the session
        req.session.userId = user._id; // Store user ID in the session
        req.session.isAuthenticated = true;
        req.session.userName = user.email;
        await req.saveSession(); // Save session to MongoDB
         // Update last login timestamp
         user.lastLogin = new Date();
         await user.save();
        res.redirect('/profile');
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(400).render('login', {
            errorMessage: 'Invalid email or password.',
            csrfToken: req.csrfToken(),
        });
    }
}

async function logout(req, res) {
    try {
        if (req.session) {
            console.log('sessionDestroy attached:', typeof req.sessionDestroy === 'function');
            if (typeof req.sessionDestroy !== 'function') {
                return res.status(500).send('Session destroy method not available.');
            }
            req.sessionDestroy(err => {
                if (err) {
                    console.error('Error destroying session:', err.message);
                    return res.status(500).send('Logout failed. Please try again.');
                }
                res.clearCookie('connect.sid'); // Clear the session cookie
                res.redirect('/auth/login');
            });
        } else {
            res.redirect('/auth/login');
        }
    } catch (error) {
        console.error('Logout error:', error.message);
        res.status(500).send('An error occurred while logging out.');
    }
}



module.exports = { register, login, logout };
