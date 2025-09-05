const { User, SalarySlip, Expense, sequelize } = require('../models');
const nodemailer = require('nodemailer');

// Create email transporter - FIXED THE TYPO HERE
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.findAll({
      where: {
        role: 'employee',
        status: 'active' // Only show active employees
      },
      attributes: ['id', 'name', 'email', 'department', 'status', 'createdAt']
    });

    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createSalarySlip = async (req, res) => {
  try {
    const { userId, monthYear, basicSalary, allowances, deductions } = req.body;

    const netSalary = basicSalary + allowances - deductions;

    const [salarySlip, created] = await SalarySlip.findOrCreate({
      where: { userId, monthYear },
      defaults: {
        userId,
        monthYear,
        basicSalary,
        allowances,
        deductions,
        netSalary
      }
    });

    if (!created) {
      await salarySlip.update({
        basicSalary,
        allowances,
        deductions,
        netSalary
      });
    }

    // Send email notification to employee
    const employee = await User.findByPk(userId);
    if (employee && employee.email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: employee.email,
        subject: `Salary Slip Generated for ${monthYear}`,
        html: `
          <h2>Hello ${employee.name},</h2>
          <p>Your salary slip for ${monthYear} has been generated.</p>
          <p><strong>Basic Salary:</strong> $${basicSalary.toFixed(2)}</p>
          <p><strong>Allowances:</strong> $${allowances.toFixed(2)}</p>
          <p><strong>Deductions:</strong> $${deductions.toFixed(2)}</p>
          <p><strong>Net Salary:</strong> $${netSalary.toFixed(2)}</p>
          <p>Login to your dashboard to view details.</p>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Email sending error:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }

    res.json({ message: 'Salary slip created/updated successfully', salarySlip });
  } catch (error) {
    console.error('Create salary slip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmployeeExpenses = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const expenses = await Expense.findAll({
      where: { userId: employeeId },
      include: [{
        model: User,
        attributes: ['name', 'email']
      }],
      order: [['submittedAt', 'DESC']]
    });

    res.json(expenses);
  } catch (error) {
    console.error('Get employee expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateExpenseStatus = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { status } = req.body;

    const expense = await Expense.findByPk(expenseId, {
      include: [User]
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.update({ status });

    // Send email notification to employee
    if (expense.User && expense.User.email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: expense.User.email,
        subject: `Expense Claim ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        html: `
          <h2>Hello ${expense.User.name},</h2>
          <p>Your expense claim submitted on ${new Date(expense.submittedAt).toLocaleDateString()} has been <strong>${status}</strong>.</p>
          <p><strong>Category:</strong> ${expense.category}</p>
          <p><strong>Amount:</strong> $${expense.amount.toFixed(2)}</p>
          <p><strong>Description:</strong> ${expense.description}</p>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Email sending error:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }

    res.json({ message: 'Expense status updated successfully', expense });
  } catch (error) {
    console.error('Update expense status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const totalEmployees = await User.count({
      where: {
        role: 'employee',
        status: 'active'  // Only count active employees
      }
    });

    const terminatedEmployees = await User.count({
      where: {
        role: 'employee',
        status: 'terminated'
      }
    });

    const currentMonthYear = new Date().toISOString().slice(0, 7);
    const totalPayroll = await SalarySlip.sum('netSalary', {
      where: { monthYear: currentMonthYear }
    });

    const pendingExpenses = await Expense.count({
      where: { status: 'pending' }
    });

    res.json({
      totalEmployees,
      terminatedEmployees,
      totalPayroll: totalPayroll || 0,
      pendingExpenses
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add these functions to your adminController.js

exports.updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { name, email, department, status } = req.body;

    const employee = await User.findByPk(employeeId);

    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await employee.update({
      name,
      email,
      department,
      status
    });

    res.json({ message: 'Employee updated successfully', employee });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await User.findByPk(employeeId);

    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Soft delete - mark as terminated instead of physical deletion
    await employee.update({
      status: 'terminated'
    });

    res.json({ message: 'Employee marked as terminated successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPayrollAnalytics = async (req, res) => {
  try {
    // Company-wide payroll expenditure over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const payrollOverTime = await SalarySlip.findAll({
      attributes: ['monthYear', [sequelize.fn('SUM', sequelize.col('netSalary')), 'totalPayroll']],
      group: ['monthYear'],
      having: sequelize.where(sequelize.col('monthYear'), '>=', sixMonthsAgo.toISOString().slice(0, 7)),
      order: [['monthYear', 'ASC']]
    });

    // Department-wise salary distribution
    const departmentDistribution = await SalarySlip.findAll({
      attributes: [[sequelize.col('User.department'), 'department'], [sequelize.fn('SUM', sequelize.col('netSalary')), 'totalSalary']],
      include: [{
        model: User,
        attributes: []
      }],
      where: { monthYear: new Date().toISOString().slice(0, 7) },
      group: ['User.department'],
      order: [[sequelize.fn('SUM', sequelize.col('netSalary')), 'DESC']]
    });

    res.json({
      payrollOverTime,
      departmentDistribution
    });
  } catch (error) {
    console.error('Get payroll analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};