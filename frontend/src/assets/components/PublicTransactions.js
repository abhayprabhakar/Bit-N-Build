import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  AccountBalance,
  Login as LoginIcon,
  TrendingUp,
  Security
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PublicTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicTransactions();
  }, []);

  const fetchPublicTransactions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/public/transactions');
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.transactions || []);
      } else {
        setError('Failed to load transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <AccountBalance sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Transparency Ledger - Public View
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<LoginIcon />}
            onClick={() => navigate('/signin')}
          >
            Admin Login
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Card sx={{ mb: 4, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Visibility sx={{ mr: 2, fontSize: 40, color: 'white' }} />
              <Typography variant="h4" component="h1" color="white">
                Public Transaction Ledger
              </Typography>
            </Box>
            <Typography variant="h6" color="white" paragraph>
              View all financial transactions in real-time for complete transparency
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center">
                  <Security sx={{ mr: 1, color: 'white' }} />
                  <Typography color="white">Cryptographically Secured</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center">
                  <TrendingUp sx={{ mr: 1, color: 'white' }} />
                  <Typography color="white">Real-time Updates</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center">
                  <Visibility sx={{ mr: 1, color: 'white' }} />
                  <Typography color="white">Full Transparency</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Statistics */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Transactions
                </Typography>
                <Typography variant="h4" color="primary">
                  {transactions.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Approved Transactions
                </Typography>
                <Typography variant="h4" color="info.main">
                  {transactions.filter(t => t.status === 'Approved').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Transactions Table */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            All Transactions
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
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.transaction_id} hover>
                        <TableCell>
                          {formatDate(transaction.created_at)}
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            color={transaction.amount >= 0 ? 'success.main' : 'error.main'}
                            fontWeight="bold"
                          >
                            {formatCurrency(transaction.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" style={{ maxWidth: 300 }}>
                            {transaction.purpose}
                          </Typography>
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

        {/* Footer */}
        <Box mt={6} pt={3} borderTop={1} borderColor="divider">
          <Typography variant="body2" color="text.secondary" align="center">
            Transparency Ledger - Ensuring Financial Accountability
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PublicTransactions;
