import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Table } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SalaryChart from '../components/SalaryChart';
import ExpenseChart from '../components/ExpenseChart';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Expense form state
  const [monthYear, setMonthYear] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchExpenses();
    
    // Set current month as default
    const now = new Date();
    setMonthYear(now.toISOString().slice(0, 7));
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/employee/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/employee/expenses');
      setExpenses(response.data);
    } catch (error) {
      setError('Failed to fetch expenses');
    }
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/employee/expense', {
        monthYear,
        category,
        amount: parseFloat(amount),
        description
      });
      
      setSuccess('Expense submitted successfully!');
      setShowExpenseModal(false);
      fetchExpenses();
      fetchDashboardData();
      
      // Reset form
      setCategory('');
      setAmount('');
      setDescription('');
    } catch (error) {
      setError('Failed to submit expense');
    }
  };

  // Format currency in Indian rupees
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
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
          <h2>Welcome, {user.name}</h2>
          <p className="text-muted">Employee Dashboard</p>
        </Col>
      </Row>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>YTD Salary</Card.Title>
              <Card.Text className="h3">
                {dashboardData?.ytdSalary ? formatCurrency(dashboardData.ytdSalary) : '₹0.00'}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Monthly Expenses</Card.Title>
              <Card.Text className="h3">
                {dashboardData?.monthlyExpenses ? formatCurrency(dashboardData.monthlyExpenses) : '₹0.00'}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Actions</Card.Title>
              <Button 
                variant="primary" 
                onClick={() => setShowExpenseModal(true)}
              >
                Submit Expense
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={6}>
          {dashboardData?.salaryHistory && (
            <SalaryChart data={dashboardData.salaryHistory} currency="₹" />
          )}
        </Col>
        
        <Col md={6}>
          {dashboardData?.expensesByCategory && (
            <ExpenseChart data={dashboardData.expensesByCategory} currency="₹" />
          )}
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5>Recent Expenses</h5>
            </Card.Header>
            <Card.Body>
              {expenses.length > 0 ? (
                <Table striped bordered>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(expense => (
                      <tr key={expense.id}>
                        <td>{new Date(expense.submittedAt).toLocaleDateString()}</td>
                        <td>{expense.category}</td>
                        <td>{formatCurrency(expense.amount)}</td>
                        <td>{expense.description}</td>
                        <td>
                          <span className={`badge bg-${
                            expense.status === 'approved' ? 'success' :
                            expense.status === 'rejected' ? 'danger' : 'warning'
                          }`}>
                            {expense.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No expenses submitted yet.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Expense Modal */}
      <Modal show={showExpenseModal} onHide={() => setShowExpenseModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Submit New Expense</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitExpense}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Month-Year</Form.Label>
              <Form.Control
                type="month"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                <option value="Travel">Travel</option>
                <option value="Food">Food</option>
                <option value="Supplies">Supplies</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Amount (₹)</Form.Label> {/* Changed from ($) to (₹) */}
              <Form.Control
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowExpenseModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Expense
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Dashboard;