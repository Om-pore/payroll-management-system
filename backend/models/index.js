const sequelize = require('../config/database');
const User = require('./User');
const SalarySlip = require('./SalarySlip');
const Expense = require('./Expense');

// Define associations
User.hasMany(SalarySlip, { foreignKey: 'userId' });
SalarySlip.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Expense, { foreignKey: 'userId' });
Expense.belongsTo(User, { foreignKey: 'userId' });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

module.exports = {
  sequelize,
  User,
  SalarySlip,
  Expense,
  syncDatabase
};