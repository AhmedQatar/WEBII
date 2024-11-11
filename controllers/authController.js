// controllers/authController.js
const path = require('path');
const authService = require('../services/authService');

function showRegisterPage(req, res) {
  res.sendFile(path.join(__dirname, '../views/register.html'));
}

async function register(req, res) {
  const { email, password } = req.body;
  const db = req.app.locals.db;

  try {
    await authService.registerUser(db, email, password);
    res.redirect('/auth/login');
  } catch (error) {
    res.status(400).send('Error: ' + error.message);
  }
}

function showLoginPage(req, res) {
  res.sendFile(path.join(__dirname, '../views/login.html'));
}

async function login(req, res) {
  const { email, password } = req.body;
  const db = req.app.locals.db;

  try {
    const user = await authService.authenticateUser(db, email, password);
    req.session.userId = user._id;
    res.redirect('/');
  } catch (error) {
    res.status(400).send('Error: ' + error.message);
  }
}

module.exports = {
  showRegisterPage,
  register,
  showLoginPage,
  login,
};
