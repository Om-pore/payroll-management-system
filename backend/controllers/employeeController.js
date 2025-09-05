const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { SalarySlip, Expense } = require('../models');

// In employeeController.js, add debugging logs:
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching dashboard data for user:', userId);

    // Get salary history for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthYearFilter = sixMonthsAgo.toISOString().slice(0, 7);

    const salaryHistory = await SalarySlip.findAll({
      where: {
        userId,
        monthYear: { [Op.gte]: monthYearFilter }
      },
      order: [['monthYear', 'DESC']],
      limit: 6
    });

    console.log('Salary history found:', salaryHistory.length, 'records');

    // Get total net salary YTD
    const currentYear = new Date().getFullYear();
    const ytdSalary = await SalarySlip.sum('netSalary', {
      where: {
        userId,
        monthYear: { [Op.like]: `${currentYear}-%` }
      }
    });

    console.log('YTD Salary:', ytdSalary);

    // Get total expenses this month
    const currentMonthYear = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = await Expense.sum('amount', {
      where: {
        userId,
        monthYear: currentMonthYear
      }
    });

    console.log('Monthly expenses:', monthlyExpenses);

    // Get expenses by category for the selected month
    const expensesByCategory = await Expense.findAll({
      attributes: ['category', [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']],
      where: {
        userId,
        monthYear: currentMonthYear
      },
      group: ['category']
    });

    console.log('Expenses by category:', expensesByCategory);

    res.json({
      salaryHistory,
      ytdSalary: ytdSalary || 0,
      monthlyExpenses: monthlyExpenses || 0,
      expensesByCategory
    });
  } catch (error) {
    console.error('Get employee dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.submitExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { monthYear, category, amount, description } = req.body;

    const expense = await Expense.create({
      userId,
      monthYear,
      category,
      amount,
      description
    });

    res.status(201).json({ message: 'Expense submitted successfully', expense });
  } catch (error) {
    console.error('Submit expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.findAll({
      where: { userId },
      order: [['submittedAt', 'DESC']]
    });

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};