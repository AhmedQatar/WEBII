// presentation/controllers/profileController.js
const userService = require('../../business/services/userService');

async function getProfile(req, res) {
    try {
        const user = await userService.getUserById(req.session.userId);
        res.render('profile', { email: user.email });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading profile');
    }
}

module.exports = { getProfile };
