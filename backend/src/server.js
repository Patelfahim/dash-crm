const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// DB
const { connectDB, sequelize } = require('./config/db');

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.CLIENT_URL
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// PORT
const PORT = process.env.PORT || 5001;

// 🚀 START SERVER (FINAL FIX)
const startServer = async () => {
  console.log("🚀 Starting server...");

  try {
    console.log("👉 Connecting DB...");
    await connectDB();

    console.log("👉 Loading models...");
    require('./models/User');

    console.log("👉 Syncing database...");
    await sequelize.sync();

    console.log("✅ Models synced");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ FULL STARTUP ERROR:");
    console.error(error);
  }
};

startServer();