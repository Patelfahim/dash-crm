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


// 🚀 LOGIN (FIXED → POST)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("📥 Login attempt:", email);
    console.log("🔑 Password provided:", password); // temporary for debugging

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
      console.log("❌ Password mismatch for user:", email);
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    console.log("🎉 Login successful for user:", email);

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


// 🌱 SEED USERS (CHANGED TO GET FOR BROWSER ACCESS)
router.get('/seed', async (req, res) => {
  try {
    console.log("🌱 Seeding users...");

    // Force alter the role column just in case it's an ENUM or too small
    const { sequelize } = require('../config/db');
    await sequelize.query("ALTER TABLE Users MODIFY COLUMN role VARCHAR(255) DEFAULT 'user'");

    await User.destroy({ where: {} });

    const usersToSeed = [
      { name: 'Admin User', email: 'admin@crm.com', password: 'Admin@1234', role: 'admin' },
      { name: 'Regular User', email: 'user@crm.com', password: 'User@1234', role: 'user' },
      { name: 'Sales Rep', email: 'sales@crm.com', password: 'Sales@1234', role: 'sales' },
    ];

    for (const u of usersToSeed) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      await User.create({
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
      });
      console.log(`✅ ${u.role} user created: ${u.email}`);
    }

    res.json({
      message: 'All users seeded successfully',
      users: usersToSeed.map(u => ({ email: u.email, password: u.password, role: u.role }))
    });

  } catch (error) {
    console.error("❌ Seed error:", error);
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;