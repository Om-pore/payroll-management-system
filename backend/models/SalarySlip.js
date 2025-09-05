const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalarySlip = sequelize.define('SalarySlip', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  monthYear: {
    type: DataTypes.STRING,
    allowNull: false
  },
  basicSalary: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  allowances: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  deductions: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  netSalary: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  generatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = SalarySlip;