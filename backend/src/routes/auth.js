const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const { protect } = require('../middleware/auth');

// 🔐 Generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
};


// 🚀 @route POST /api/auth/login
// @desc  Login user
// @access Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password.'
      });
    }

    // ✅ Check user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    // ✅ Compare password (FIXED)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    // ✅ Success
    res.json({
      success: true,
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      message: 'Server error during login.'
    });
  }
});


// 🔐 @route GET /api/auth/me
// @desc  Get current user
// @access Private
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});


// 🌱 @route POST /api/auth/seed
// @desc  Create demo user
// @access Public
router.post('/seed', async (req, res) => {
  try {
    const existing = await User.findOne({
      where: { email: 'demo@crm.com' }
    });

    if (existing) {
      return res.json({
        message: 'Demo user already exists',
        credentials: {
          email: 'demo@crm.com',
          password: 'Demo@1234'
        }
      });
    }

    // 🔐 Hash password before saving
    const hashedPassword = await bcrypt.hash('Demo@1234', 10);

    await User.create({
      name: 'Alex Morgan',
      email: 'demo@crm.com',
      password: hashedPassword,
      role: 'admin'
    });

    res.status(201).json({
      message: 'Demo user created!',
      credentials: {
        email: 'demo@crm.com',
        password: 'Demo@1234'
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;