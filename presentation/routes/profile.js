// presentation/routes/profile.js
const express = require('express');
const profileController = require('../controllers/profileController');
const isAuthenticated = require('../../middleware/isAuthenticated');
const router = express.Router();

router.get('/', isAuthenticated, profileController.getProfile);

module.exports = router;
