const csrf = require('csurf');
const csrfMiddleware = csrf({ cookie: true });
module.exports = csrfMiddleware;
