const { Sequelize } = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize(process.env.MYSQL_PUBLIC_URL, {
  dialect: 'mysql',

  // 👇 Turn ON temporarily for debugging (can set false later)
  logging: console.log,

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Connect DB
const connectDB = async () => {
  try {
    console.log("👉 Connecting to MySQL...");

    await sequelize.authenticate();

    console.log("✅ MySQL Connected Successfully");

  } catch (error) {
    console.error("❌ MySQL FULL ERROR:");
    console.error(error); // 👈 IMPORTANT (not just message)

    // ❌ DON'T exit app (prevents Render crash loop)
    // process.exit(1);
  }
};

module.exports = { sequelize, connectDB };