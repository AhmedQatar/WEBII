const express = require('express');
const csrf = require('csurf');
const router = express.Router();
const authController = require('../controllers/authController');

// CSRF protection
const csrfProtection = csrf({ cookie: true });

router.get('/register', csrfProtection, (req, res) => res.render('register', { csrfToken: req.csrfToken(), title: 'Login Page'}));
router.post('/register', csrfProtection, authController.register);

router.get('/login', csrfProtection, (req, res) => res.render('login', { csrfToken: req.csrfToken(), title: 'Register Page' }));
router.post('/login', csrfProtection, authController.login);

router.get('/logout', authController.logout);

module.exports = router;
