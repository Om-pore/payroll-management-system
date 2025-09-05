import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Tabs, Tab, Dropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminPanel = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeExpenses, setEmployeeExpenses] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false); // New modal
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false); // New modal

  // Salary form state
  const [monthYear, setMonthYear] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [allowances, setAllowances] = useState('');
  const [deductions, setDeductions] = useState('');

  // Employee edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editStatus, setEditStatus] = useState('active');

  // Format currency in Indian rupees
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Custom tooltip formatter for charts
  const formatTooltip = (value) => {
    return formatCurrency(value);
  };

  // Custom Y-axis formatter for charts
  const formatYAxis = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`; // Convert to lakhs
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`; // Convert to thousands
    }
    return `₹${value}`;
  };

  useEffect(() => {
    fetchDashboardData();
    fetchEmployees();

    // Set current month as default
    const now = new Date();
    setMonthYear(now.toISOString().slice(0, 7));
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard-data');
      setDashboardData(response.data);
    } catch (error) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/admin/employees');
      setEmployees(response.data);
    } catch (error) {
      setError('Failed to fetch employees');
    }
  };

  const fetchEmployeeExpenses = async (employeeId) => {
    try {
      const response = await api.get(`/admin/employee-expenses/${employeeId}`);
      setEmployeeExpenses(response.data);
    } catch (error) {
      setError('Failed to fetch employee expenses');
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const response = await api.get('/admin/payroll-analytics');
      setAnalyticsData(response.data);
    } catch (error) {
      setError('Failed to fetch analytics data');
    }
  };

  const handleGenerateSalary = async (e) => {
    e.preventDefault();

    try {
      await api.post('/admin/salary-slip', {
        userId: selectedEmployee.id,
        monthYear,
        basicSalary: parseFloat(basicSalary),
        allowances: parseFloat(allowances || 0),
        deductions: parseFloat(deductions || 0)
      });

      setSuccess('Salary slip generated successfully!');
      setShowSalaryModal(false);

      // Reset form
      setBasicSalary('');
      setAllowances('');
      setDeductions('');
    } catch (error) {
      setError('Failed to generate salary slip');
    }
  };

  const handleUpdateExpenseStatus = async (expenseId, status) => {
    try {
      await api.patch(`/admin/expense-status/${expenseId}`, { status });
      setSuccess('Expense status updated successfully!');

      // Refresh expenses
      if (selectedEmployee) {
        fetchEmployeeExpenses(selectedEmployee.id);
      }
    } catch (error) {
      setError('Failed to update expense status');
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/admin/employee/${selectedEmployee.id}`, {
        name: editName,
        email: editEmail,
        department: editDepartment,
        status: editStatus
      });

      setSuccess('Employee updated successfully!');
      setShowEditEmployeeModal(false);
      fetchEmployees(); // Refresh employee list
    } catch (error) {
      setError('Failed to update employee: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      await api.delete(`/admin/employee/${selectedEmployee.id}`);

      setSuccess('Employee marked as terminated successfully!');
      setShowDeleteConfirmModal(false);
      fetchEmployees(); // Refresh employee list
    } catch (error) {
      setError('Failed to terminate employee: ' + (error.response?.data?.message || error.message));
    }
  };

  const openSalaryModal = (employee) => {
    setSelectedEmployee(employee);
    setShowSalaryModal(true);
  };

  const openExpensesModal = async (employee) => {
    setSelectedEmployee(employee);
    setShowExpensesModal(true);
    await fetchEmployeeExpenses(employee.id);
  };

  const openAnalyticsModal = async () => {
    setShowAnalyticsModal(true);
    await fetchAnalyticsData();
  };

  const openEditEmployeeModal = (employee) => {
    setSelectedEmployee(employee);
    setEditName(employee.name);
    setEditEmail(employee.email);
    setEditDepartment(employee.department || '');
    setEditStatus(employee.status || 'active');
    setShowEditEmployeeModal(true);
  };

  const openDeleteConfirmModal = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteConfirmModal(true);
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">Loading...</div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2>Admin Panel</h2>
          <p className="text-muted">Welcome, {user.name}</p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Active Employees</Card.Title>
              <Card.Text className="h3">
                {dashboardData?.totalEmployees || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Payroll</Card.Title>
              <Card.Text className="h3">
                {dashboardData?.totalPayroll ? formatCurrency(dashboardData.totalPayroll) : '₹0.00'}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Pending Expenses</Card.Title>
              <Card.Text className="h3">
                {dashboardData?.pendingExpenses || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Terminated Employees</Card.Title>
              <Card.Text className="h3">
                {dashboardData?.terminatedEmployees || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>Active Employee List</h5>
              <div>
                <Button variant="outline-secondary" className="me-2" onClick={() => fetchEmployees()}>
                  View Active
                </Button>
                <Button variant="info" onClick={openAnalyticsModal}>
                  View Analytics
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {employees.length > 0 ? (
                <Table striped bordered>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(employee => (
                      <tr key={employee.id}>
                        <td>{employee.name}</td>
                        <td>{employee.email}</td>
                        <td>{employee.department || 'N/A'}</td>
                        <td>
                          <Badge bg={
                            employee.status === 'active' ? 'success' :
                              employee.status === 'inactive' ? 'warning' : 'secondary'
                          }>
                            {employee.status}
                          </Badge>
                        </td>
                        <td>{new Date(employee.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="primary" size="sm" id="dropdown-basic">
                              Actions
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => openSalaryModal(employee)}>
                                Generate Salary
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => openExpensesModal(employee)}>
                                View Expenses
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => openEditEmployeeModal(employee)}>
                                Edit Employee
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => openDeleteConfirmModal(employee)}
                                className="text-danger"
                              >
                                Terminate Employee
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No active employees found.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Generate Salary Modal */}
      <Modal show={showSalaryModal} onHide={() => setShowSalaryModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Generate Salary for {selectedEmployee?.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGenerateSalary}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Month-Year</Form.Label>
                  <Form.Control
                    type="month"
                    value={monthYear}
                    onChange={(e) => setMonthYear(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Basic Salary (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Allowances (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={allowances}
                    onChange={(e) => setAllowances(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Deductions (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Card>
                  <Card.Body>
                    <h6>Net Salary: {formatCurrency(
                      parseFloat(basicSalary || 0) +
                      parseFloat(allowances || 0) -
                      parseFloat(deductions || 0)
                    )}</h6>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSalaryModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Generate Salary Slip
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View Expenses Modal */}
      <Modal show={showExpensesModal} onHide={() => setShowExpensesModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Expenses for {selectedEmployee?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {employeeExpenses.length > 0 ? (
            <Table striped bordered>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employeeExpenses.map(expense => (
                  <tr key={expense.id}>
                    <td>{new Date(expense.submittedAt).toLocaleDateString()}</td>
                    <td>{expense.category}</td>
                    <td>{formatCurrency(expense.amount)}</td>
                    <td>{expense.description}</td>
                    <td>
                      <span className={`badge bg-${expense.status === 'approved' ? 'success' :
                        expense.status === 'rejected' ? 'danger' : 'warning'
                        }`}>
                        {expense.status}
                      </span>
                    </td>
                    <td>
                      {expense.status === 'pending' && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-1"
                            onClick={() => handleUpdateExpenseStatus(expense.id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleUpdateExpenseStatus(expense.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No expenses found for this employee.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExpensesModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal show={showEditEmployeeModal} onHide={() => setShowEditEmployeeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Employee: {selectedEmployee?.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateEmployee}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Control
                type="text"
                value={editDepartment}
                onChange={(e) => setEditDepartment(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditEmployeeModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Employee
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal - update text */}
      <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Termination</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to mark employee <strong>{selectedEmployee?.name}</strong> as terminated?</p>
          <p className="text-warning">
            <strong>Note:</strong> This will keep the employee's records but mark them as terminated.
            They will no longer appear in the active employees list.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteEmployee}>
            Mark as Terminated
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Analytics Modal */}
      <Modal show={showAnalyticsModal} onHide={() => setShowAnalyticsModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Payroll Analytics</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="payrollOverTime" className="mb-3">
            <Tab eventKey="payrollOverTime" title="Payroll Over Time">
              <h5>Company-wide Payroll Expenditure (Last 6 Months)</h5>
              {analyticsData?.payrollOverTime && (
                <div style={{ height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.payrollOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthYear" />
                      <YAxis tickFormatter={formatYAxis} />
                      <Tooltip formatter={(value) => [formatTooltip(value), 'Total Payroll']} />
                      <Legend />
                      <Bar dataKey="totalPayroll" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Tab>

            <Tab eventKey="departmentDistribution" title="Department Distribution">
              <h5>Department-wise Salary Distribution (Current Month)</h5>
              {analyticsData?.departmentDistribution && (
                <div style={{ height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.departmentDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="totalSalary"
                      >
                        {analyticsData.departmentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatTooltip(value), 'Total Salary']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAnalyticsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPanel;