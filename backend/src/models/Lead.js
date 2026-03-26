const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Lead = sequelize.define('Lead', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'New'
  },
  value: {
    type: DataTypes.STRING,
    defaultValue: '₹0'
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: 'Direct'
  }
}, {
  timestamps: true
});

module.exports = Lead;
