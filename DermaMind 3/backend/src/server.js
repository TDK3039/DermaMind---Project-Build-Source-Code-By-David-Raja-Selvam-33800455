const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

const app = express();

// Middleware
app.use(cors());            // Allow cross‑origin requests (mobile app to the backend)
app.use(express.json());    // Parse JSON request bodies

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));


// Route Imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const analysisRoutes = require('./routes/analysis');

// Route Mounting
app.use('/api/user', userRoutes);        // User profile routes (protected)
app.use('/api/auth', authRoutes);        // Register + Login
app.use('/api/analysis', analysisRoutes); // Image analysis endpoint


// Default Route
app.get('/', (req, res) => {
  res.json({ message: 'DermaMind API running' });
});


// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
