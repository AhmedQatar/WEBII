// presentation/routes/profile.js
const express = require('express');
const profileController = require('../controllers/profileController');
const isAuthenticated = require('../../middleware/isAuthenticated');
const router = express.Router();
const { assignBadges } = require('../../business/services/badgeService');
const userService = require('../../business/services/userService')

router.get('/', isAuthenticated, profileController.getProfile);



router.post('/assign-badges', async (req, res) => {
    try {
        await assignBadges(req.session.userId);
        res.redirect('/profile');
    } catch (error) {
        console.error('Error assigning badges:', error.message);
        res.status(500).send('Unable to assign badges.');
    }
});

// POST /profile/update - Update user profile (e.g., languages)
router.post('/update', isAuthenticated, async (req, res) => {
    const {  email, password, profilePhoto, fluentLanguages,
        learningLanguages, newContact, blockUser, badges } = req.body;

    try {
        // Split comma-separated strings into arrays
        const updates = {
            email,
            profilePhoto,
            fluentLanguages: fluentLanguages ? fluentLanguages.split(',').map(lang => lang.trim()) : [],
            learningLanguages: learningLanguages ? learningLanguages.split(',').map(lang => lang.trim()) : [],
            contacts: newContact ? newContact.split(',').map(contact => contact.trim()) : [],
            blockedUsers: blockUser ? blockUser.split(',').map(user => user.trim()) : [],
            badges: badges ? badges.split(',').map(badge => badge.trim()) : [],
        };

        // Only hash and update password if provided
        if (password && password.trim() !== '') {
            const bcrypt = require('bcrypt');
            updates.password = await bcrypt.hash(password, 12);
        }

        await userService.updateUserProfile(req.session.userId, updates);

        res.redirect('/profile'); // Redirect back to the profile page after successful update
    } catch (error) {
        console.error('Profile update error:', error.message);

        // Render the profile page with an error message
        res.status(500).render('profile', {
            errorMessage: 'Failed to update profile. Please try again later.',
        });
    }
});

//router.post('/update-contacts', isAuthenticated, userService.updateContacts);
router.get('/remove-contact/:contactId', isAuthenticated, userService.removeContact);
router.get('/unblock-user/:blockedUserId', isAuthenticated, userService.unblockUser);




module.exports = router;
