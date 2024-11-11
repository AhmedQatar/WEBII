const authService = require('../services/authService');

function showRegisterPage(req, res) {
  res.render('register', { csrfToken: req.csrfToken() });
}

async function register(req, res) {
  const { email, password } = req.body;
  const db = req.app.locals.db;

  try {
    await authService.registerUser(db, email, password);
    res.redirect('/auth/login'); // Redirect to login on successful registration
  } catch (error) {
    // Render the registration page with an error message if registration fails
    res.status(400).render('register', { errorMessage: error.message, csrfToken: req.csrfToken() });
  }
}

function showLoginPage(req, res) {
  res.render('login', { csrfToken: req.csrfToken() });
}

async function login(req, res) {
  const { email, password } = req.body;
  const db = req.app.locals.db;

  try {
    const user = await authService.authenticateUser(db, email, password);

    // Store user information in the session
    req.session.userId = user._id;
    req.session.userEmail = user.email; // Store user's email in the session for profile display
    req.session.isAuthenticated = true;

    // Redirect to the profile or home page after successful login
    res.redirect('/profile');
  } catch (error) {
    // Render the login page with an error message if login fails
    res.status(400).render('login', { errorMessage: 'Invalid email or password', csrfToken: req.csrfToken() });
  }
}

module.exports = {
  showRegisterPage,
  register,
  showLoginPage,
  login,
};
