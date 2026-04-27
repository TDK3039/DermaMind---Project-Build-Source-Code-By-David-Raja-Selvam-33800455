const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * -------------------------
 * This middleware protects routes by verifying the JWT token sent
 * in the `Authorization` header. If the token is valid, the decoded
 * user data is attached to `req.user` and the request continues.
 * If invalid or missing, the request is rejected.
 */
module.exports = function (req, res, next) {
    // Expecting header format: "Authorization: Bearer <token>"
    const token = req.header('Authorization');

    // No token provided → block access
    if (!token) {
        return res.status(401).json({
            message: "Access denied. No token provided."
        });
    }

    try {
        // Remove "Bearer " prefix if present
        const cleanedToken = token.replace("Bearer ", "");

        // Verify token using secret key
        const decoded = jwt.verify(cleanedToken, process.env.JWT_SECRET);

        // Attach decoded user info (e.g., user ID) to request object
        req.user = decoded;

        // Allow request to continue to protected route
        next();
    } catch (error) {
        // Token invalid or expired
        res.status(400).json({ message: "Invalid token" });
    }
};
