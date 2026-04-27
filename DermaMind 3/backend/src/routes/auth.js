const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

/**
 * POST /register
 * --------------
 * Registers a new user.
 * Steps:
 * 1. Validate input
 * 2. Check if email already exists
 * 3. Hash password using bcrypt
 * 4. Save user to MongoDB
 * 5. Return success response
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user document
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json({
      message: "User registered successfully",
      user: newUser,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * POST /login
 * -----------
 * Logs a user in.
 * Steps:
 * 1. Validate email + password
 * 2. Check if user exists
 * 3. Compare password with hashed password
 * 4. Generate JWT token (valid for 7 days)
 * 5. Return token + user info
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Look up user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create JWT token containing user ID
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
