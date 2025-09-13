import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  AppBar,
  Toolbar,
  Chip,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalance,
  ExitToApp,
  Dashboard as DashboardIcon,
  Visibility
} from '@mui/icons-material';
import { useAuth } from '../../contexts/LocalAuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { currentUser, logout, makeAuthenticatedRequest, addDepartment } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();
  const [addDeptDialogOpen, setAddDeptDialogOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', password: '', confirmPassword: '' });
  const [deptError, setDeptError] = useState('');
  const [deptSuccess, setDeptSuccess] = useState('');

  // Form state for new transaction
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    purpose: '',
    dept_id: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

const fetchDashboardData = async () => {
  try {
    // Fetch departments and transactions
    const [deptResponse, transResponse] = await Promise.all([
      makeAuthenticatedRequest('/api/departments'),
      fetch('http://localhost:5000/api/public/transactions').then(res => res.json())
    ]);

    // FIX: departments API returns an array, not {departments: [...]}
    setDepartments(Array.isArray(deptResponse) ? deptResponse : deptResponse.departments || []);

    if (transResponse.success) {
      setTransactions(transResponse.transactions || []);
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    setError('Failed to load dashboard data');
  } finally {
    setLoading(false);
  }
};

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTransaction = async () => {
    try {
      setError('');

      // Validate required fields
      if (!newTransaction.amount || !newTransaction.purpose || !newTransaction.dept_id) {
        setError('Please fill in all required fields including department selection');
        return;
      }

      const transactionData = {
        amount: parseFloat(newTransaction.amount),
        purpose: newTransaction.purpose,
        dept_id: newTransaction.dept_id,
        status: 'Pending'
      };

      // Validate we have a department
      if (!transactionData.dept_id) {
        setError('No department available. Please create a department first.');
        return;
      }

      const response = await makeAuthenticatedRequest('/api/transactions', 'POST', transactionData);
      
      if (response.success) {
        setSuccess('Transaction added successfully!');
        setOpenDialog(false);
        setNewTransaction({
          amount: '',
          purpose: '',
          dept_id: ''
        });
        // Refresh transactions
        await fetchDashboardData();
      } else {
        setError(response.message || 'Failed to add transaction');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      setError(error.message || 'Failed to add transaction');
    }
  };

  // Add Department handlers
  const handleDeptInputChange = (e) => {
    setDeptForm({ ...deptForm, [e.target.name]: e.target.value });
  };

  const handleAddDepartment = async () => {
    setDeptError('');
    setDeptSuccess('');
    // Email regex
    const emailRegex = /^[\w\.-]+@[\w\.-]+\.\w+$/;
    if (!deptForm.name || !deptForm.password || !deptForm.confirmPassword) {
      setDeptError('All fields are required');
      return;
    }
    if (!emailRegex.test(deptForm.name)) {
      setDeptError('Department name must be a valid email address');
      return;
    }
    if (deptForm.password.length < 6) {
      setDeptError('Password must be at least 6 characters');
      return;
    }
    if (deptForm.password !== deptForm.confirmPassword) {
      setDeptError('Passwords do not match');
      return;
    }
    try {
      const res = await addDepartment(deptForm.name, deptForm.password, deptForm.confirmPassword);
      if (res.success) {
        setDeptSuccess(`Department created! Login: ${res.head_user_email}`);
        setDeptForm({ name: '', password: '', confirmPassword: '' });
        setAddDeptDialogOpen(false);
        fetchDashboardData();
      } else {
        setDeptError(res.message || 'Failed to create department');
      }
    } catch (err) {
      setDeptError(err.message || 'Failed to create department');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'error';
      case 'Settled':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" mt={4}>
          <Typography>Loading dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard - Transparency Ledger
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<Visibility />}
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Public View
          </Button>
          <Button 
            color="inherit" 
            startIcon={<ExitToApp />}
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome back, {currentUser?.name}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Role: {currentUser?.role} | Email: {currentUser?.email}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            size="large"
          >
            Add Transaction
          </Button>
        </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setAddDeptDialogOpen(true)}
        sx={{ ml: 2 }}
      >
        Add Department
      </Button>
      {/* Add Department Dialog */}
      <Dialog open={addDeptDialogOpen} onClose={() => setAddDeptDialogOpen(false)}>
        <DialogTitle>Add Department</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Department Name"
            name="name"
            fullWidth
            value={deptForm.name}
            onChange={handleDeptInputChange}
          />
          <TextField
            margin="dense"
            label="Password"
            name="password"
            type="password"
            fullWidth
            value={deptForm.password}
            onChange={handleDeptInputChange}
          />
          <TextField
            margin="dense"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            value={deptForm.confirmPassword}
            onChange={handleDeptInputChange}
          />
          {deptError && <div style={{ color: 'red' }}>{deptError}</div>}
          {deptSuccess && <div style={{ color: 'green' }}>{deptSuccess}</div>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDeptDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddDepartment} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Statistics */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Blockchain Transactions
                </Typography>
                <Typography variant="h4" color="primary">
                  {transactions.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Volume
                </Typography>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(
                    transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Departments
                </Typography>
                <Typography variant="h4" color="info.main">
                  {departments.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pending Approvals
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {transactions.filter(t => t.status === 'Pending').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Transactions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Transactions
          </Typography>
          
          {transactions.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                    <TableCell><strong>Purpose</strong></TableCell>
                    <TableCell><strong>From</strong></TableCell> {/* NEW */}
                    <TableCell><strong>To</strong></TableCell>   {/* NEW */}
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Hash</strong></TableCell>
                  </TableRow>
                </TableHead>
                  <TableBody>
                    {transactions.slice(0, 10).map((transaction) => (
                      <TableRow key={transaction.transaction_id} hover>
                        <TableCell>{formatDate(transaction.created_at)}</TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            color={transaction.amount >= 0 ? 'success.main' : 'error.main'}
                            fontWeight="bold"
                          >
                            {formatCurrency(transaction.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell style={{ maxWidth: 300 }}>
                          {transaction.purpose}
                        </TableCell>
                        <TableCell>{transaction.fromDept || "Unknown"}</TableCell> {/* NEW */}
                        <TableCell>{transaction.toDept || "Unknown"}</TableCell>   {/* NEW */}
                        <TableCell>
                          <Chip 
                            label={transaction.status} 
                            color={getStatusColor(transaction.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            fontFamily="monospace"
                            style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}
                            title={transaction.transaction_hash}
                          >
                            {transaction.transaction_hash?.substring(0, 16)}...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                No transactions found
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Add Transaction Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Amount"
                    name="amount"
                    type="number"
                    value={newTransaction.amount}
                    onChange={handleInputChange}
                    required
                    inputProps={{ step: "0.01" }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Department"
                    name="dept_id"
                    value={newTransaction.dept_id}
                    onChange={handleInputChange}
                    required
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.dept_id} value={dept.dept_id}>
                        {dept.name}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Purpose (include from/to information here)"
                    name="purpose"
                    value={newTransaction.purpose}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    required
                    placeholder="e.g., Road maintenance project - From: City Budget, To: Public Works Department"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddTransaction} variant="contained">
              Add Transaction
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
