// presentation/controllers/profileController.js
const userService = require('../../business/services/userService');

function formatDate(date) {
    if (!date) return 'Never logged in';
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}


async function getProfile(req, res) {
    try {
        const user = await userService.getUserById(req.session.userId);
  
        console.log(user)
        res.render('profile', {

            title: 'User Profile', // Dynamic title
            email: user.email || 'N/A',
            fluentLanguages: Array.isArray(user.fluentLanguages) ? user.fluentLanguages : [],
            learningLanguages: Array.isArray(user.learningLanguages) ? user.learningLanguages : [],
            badges: Array.isArray(user.badges) && user.badges.length ? user.badges : ['No badges earned yet.'],
            profilePhoto:user.profilePhoto ,
            contacts:Array.isArray(user.contacts) ? user.contacts : [],
            blockedUsers:Array.isArray(user.blockedUsers) ? user.blockedUsers : [],
            registrationDate: user.createdAt ? user.createdAt.toDateString() : 'Unknown',
            lastLogin: formatDate(user.lastLogin),
            isAuthenticated: !!req.session.userId,
            csrfToken: req.csrfToken(),
        });
    }  catch (error) {
        // Log error with context
        console.error(`Error loading profile for user ${req.session.userId || 'unknown'}:`, error.message);

        // Render error page
        res.status(500).render('error', {
            message: 'We encountered an issue loading your profile. Please try again later.',
        });
    }
}

module.exports = { getProfile };
