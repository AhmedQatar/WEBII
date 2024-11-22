// middleware/isAuthenticated.js
function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return next(); // User is authenticated, proceed to the next middleware or route
    }
    res.redirect('/auth/login'); // Redirect to login if not authenticated
}

module.exports = isAuthenticated;
