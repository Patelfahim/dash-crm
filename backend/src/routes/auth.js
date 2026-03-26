console.log("🔥 AUTH ROUTES LOADED");

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


// 🚀 LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("📥 Login attempt:", email);

    // validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password'
      });
    }

    // find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    console.log("🔐 Stored hash:", user.password);

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    console.log("✅ Match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // success
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
    console.error("❌ Login error:", error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});


// 🔐 GET CURRENT USER
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});


// 🌱 SEED USER (FIXED)
router.post('/seed', async (req, res) => {
  try {
    console.log("🌱 Seeding user...");

    // delete old users (IMPORTANT)
    await User.destroy({ where: {} });

    // hash password
    const hashedPassword = await bcrypt.hash('Demo@1234', 10);

    const user = await User.create({
      name: 'Admin User',
      email: 'demo@crm.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log("✅ User created:", user.email);

    res.json({
      message: 'User created successfully',
      credentials: {
        email: 'demo@crm.com',
        password: 'Demo@1234'
      }
    });

  } catch (error) {
    console.error("❌ Seed error:", error);
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;