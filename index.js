const express = require('express');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User model
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String
});

const User = mongoose.model('User', UserSchema);

// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Routes
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/google-signin', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, sub: googleId } = payload;

    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ email, googleId });
      await user.save();
    }

    res.json({ success: true, message: 'Google sign-in successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));