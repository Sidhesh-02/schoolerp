const sessionManager = require("../middleware/sessionManager")
const sessionMiddleware = (req, res, next) => {
    const session = sessionManager.getSession();
    if (session) {
        req.session = session; // Attach session data to the request object
    }
    next();
}

module.exports = sessionMiddleware;