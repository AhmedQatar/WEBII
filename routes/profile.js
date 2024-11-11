const express = require('express');
const router = express.Router();

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect('/auth/login');
  }
}

// Profile route (protected)
router.get('/', isAuthenticated, (req, res) => {
  res.render('profile', { email: req.session.userEmail });
});

module.exports = router;
