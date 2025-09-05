const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/role');
const {
  getEmployees,
  createSalarySlip,
  getEmployeeExpenses,
  updateExpenseStatus,
  getDashboardData,
  getPayrollAnalytics,
  updateEmployee,        
  deleteEmployee 
} = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(requireAuth, requireAdmin('admin'));

router.get('/employees', getEmployees);
router.post('/salary-slip', createSalarySlip);
router.get('/employee-expenses/:employeeId', getEmployeeExpenses);
router.patch('/expense-status/:expenseId', updateExpenseStatus);
router.get('/dashboard-data', getDashboardData);
router.get('/payroll-analytics', getPayrollAnalytics);

router.put('/employee/:employeeId', updateEmployee);
router.delete('/employee/:employeeId', deleteEmployee);

module.exports = router;