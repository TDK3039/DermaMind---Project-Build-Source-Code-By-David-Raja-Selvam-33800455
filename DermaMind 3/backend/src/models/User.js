const mongoose = require('mongoose');

/**
 * User Schema
 * -----------
 * Defines how user accounts are stored in MongoDB.
 * Each user has a name, unique email, and a hashed password.
 * `timestamps: true` automatically adds `createdAt` and `updatedAt`.
 */
const userSchema = new mongoose.Schema(
  {
    // Full name of the user
    name: {
      type: String,
      required: true,
    },

    // Email used for login (must be unique)
    email: {
      type: String,
      required: true,
      unique: true,
    },

    // Hashed password (never store plain text)
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt + updatedAt fields automatically
);

// Export model for use in authentication routes
module.exports = mongoose.model('User', userSchema);
