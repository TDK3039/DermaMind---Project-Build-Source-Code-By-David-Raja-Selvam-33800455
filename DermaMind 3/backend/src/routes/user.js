const express = require('express');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

/**
 * GET /profile
 * ------------
 * Protected route that returns the authenticated user's profile.
 * - Requires a valid JWT (handled by auth middleware)
 * - Fetches user by ID stored in req.user (decoded from token)
 * - Excludes password field for security
 */
router.get('/profile', auth, async (req, res) => {
  try {
    // req.user.id comes from authMiddleware after token verification
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
