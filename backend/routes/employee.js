const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireEmployee = require('../middleware/role');
const {
  getDashboardData,
  submitExpense,
  getExpenses
} = require('../controllers/employeeController');

// All routes require authentication and employee role
router.use(requireAuth, requireEmployee('employee'));

router.get('/dashboard', getDashboardData);
router.post('/expense', submitExpense);
router.get('/expenses', getExpenses);

module.exports = router;