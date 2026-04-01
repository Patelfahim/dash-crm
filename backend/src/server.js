const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

const app = express();

// DB
const { connectDB, sequelize } = require('./config/db');

// Models
const User = require('./models/User');
const Lead = require('./models/Lead');
const Task = require('./models/Task');

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

// Middleware
app.use(cors({
  origin: '*', // 🔓 Temporarily allow all for debugging
  credentials: true
}));

app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 🔍 DB Connection Test Route
app.get('/api/test-db', async (req, res) => {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("SELECT 1+1 AS result");

    res.json({
      status: 'success',
      message: 'Database connection is ACTIVE',
      db_check: results[0].result === 2
    });

  } catch (error) {
    console.error("❌ DB TEST FAILED:", error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection FAILED',
      details: error.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// PORT
const PORT = process.env.PORT || 5001;

// 🌱 AUTO SEED USERS
const seedUsers = async () => {
  const usersToSeed = [
    { name: 'Admin',      email: 'admin@crm.com', password: 'Admin@1234', role: 'admin' },
    { name: 'Regular User', email: 'user@crm.com',  password: 'User@1234',  role: 'user'  },
    { name: 'Sales Rep',  email: 'sales@crm.com', password: 'Sales@1234', role: 'sales' },
  ];

  try {
    for (const u of usersToSeed) {
      const existing = await User.findOne({ where: { email: u.email } });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        await User.create({
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
        });
        console.log(`✅ ${u.role} user created: ${u.email}`);
      } else {
        console.log(`ℹ️ ${u.role} user already exists: ${u.email}`);
      }
    }
  } catch (error) {
    console.error("❌ Seed error:", error);
  }
};

// 🚀 START SERVER
const startServer = async () => {
  console.log("🚀 Starting server...");

  try {
    console.log("👉 Connecting DB...");
    await connectDB();

    console.log("👉 Syncing database...");
    await sequelize.sync({ alter: true });

    console.log("👉 Seeding users...");
    await seedUsers();

    console.log("✅ Server ready");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ FULL STARTUP ERROR:");
    console.error(error);
  }
};

startServer();