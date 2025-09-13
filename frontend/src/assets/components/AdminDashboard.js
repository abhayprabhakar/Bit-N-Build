import React, { useState, useEffect, useContext } from 'react';
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
  IconButton,
  Tooltip,
  InputAdornment,
  Stack,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalance,
  ExitToApp,
  Dashboard as DashboardIcon,
  Visibility,
  Home as HomeIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/LocalAuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import ColorModeContext from '../../contexts/ColorModeContext';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopy from '@mui/icons-material/ContentCopy';
import DarkMode from '@mui/icons-material/DarkMode';
import LightMode from '@mui/icons-material/LightMode';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearAllIcon from '@mui/icons-material/ClearAll';

const AdminDashboard = () => {
  const theme = useTheme();
  const { toggleColorMode } = useContext(ColorModeContext);
  const { currentUser, logout, makeAuthenticatedRequest, addDepartment } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [detailTx, setDetailTx] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const navigate = useNavigate();
  const [addDeptDialogOpen, setAddDeptDialogOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', password: '', confirmPassword: '' });
  const [deptError, setDeptError] = useState('');
  const [deptSuccess, setDeptSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [copiedHash, setCopiedHash] = useState(null);
  const [filters, setFilters] = useState({ minAmount: '', maxAmount: '', from: '', to: '', status: '' });

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
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'settled':
        return 'info';
      default:
        return 'default';
    }
  };

  const applyFilters = (items) => {
    return items.filter((t) => {
      const q = (search || '').trim().toLowerCase();
      if (q) {
        const hay = `${t.purpose || ''} ${t.fromDept || ''} ${t.toDept || ''} ${t.transaction_hash || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const amount = Number(t.amount || 0);
      if (filters.minAmount !== '' && !isNaN(Number(filters.minAmount)) && amount < Number(filters.minAmount)) return false;
      if (filters.maxAmount !== '' && !isNaN(Number(filters.maxAmount)) && amount > Number(filters.maxAmount)) return false;
      if (filters.from && !(t.fromDept || '').toLowerCase().includes(filters.from.toLowerCase())) return false;
      if (filters.to && !(t.toDept || '').toLowerCase().includes(filters.to.toLowerCase())) return false;
      if (filters.status && (String(t.status || '').toLowerCase() !== String(filters.status || '').toLowerCase())) return false;
      return true;
    });
  };

  const filtered = applyFilters(transactions);

  // Small sparkline implementation
  const Sparkline = ({ data = [], width = 120, height = 36, stroke = theme.palette.mode === 'dark' ? '#7dd3fc' : '#1976d2' }) => {
    if (!data || data.length === 0) return null;
    const values = data.map(d => d.value || 0);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const stepX = width / Math.max(values.length - 1, 1);
    const points = values.map((v, i) => `${i * stepX},${height - ((v - min) / (max - min || 1)) * height}`).join(' ');
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline fill="none" stroke={stroke} strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const copyHash = async (hash, e) => {
    if (e) e.stopPropagation();
    try {
      await navigator.clipboard.writeText(hash || '');
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (err) {
      console.error('copy failed', err);
    }
  };

  const openDetail = (tx) => {
    setDetailTx(tx);
    setDetailOpen(true);
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const ThemeToggle = () => {
    const isDark = theme.palette.mode === 'dark';
    return (
      <Tooltip title={isDark ? 'Switch to Light' : 'Switch to Dark'}>
        <IconButton
          onClick={toggleColorMode}
          aria-label="toggle theme"
          aria-pressed={isDark}
          sx={{
            ml: 2,
            width: 54,
            height: 30,
            borderRadius: 999,
            p: 0.5,
            background: isDark ? 'linear-gradient(90deg,#0b1220,#111827)' : 'linear-gradient(90deg,#ffffff,#f7fbff)',
            border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: isDark ? 'inset 0 0 10px rgba(255,255,255,0.03)' : '0 10px 30px rgba(16,24,40,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            transition: 'background 260ms ease, border-color 260ms ease, box-shadow 260ms ease'
          }}
        >
          <Box sx={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 240ms ease, background 240ms ease, box-shadow 240ms ease',
            transform: isDark ? 'translateX(24px) rotate(8deg)' : 'translateX(0px) rotate(0deg)',
            background: isDark ? 'linear-gradient(135deg,#1f2937,#0f172a)' : 'linear-gradient(135deg,#fff7ed,#fffbeb)',
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.45)' : '0 8px 26px rgba(16,24,40,0.14)'
          }}>
            {isDark ? <DarkMode fontSize="small" sx={{ color: '#e5e7eb' }} /> : <LightMode fontSize="small" sx={{ color: '#f59e0b' }} />}
          </Box>
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: theme.palette.mode === 'dark'
        ? 'radial-gradient(80% 60% at 20% 0%, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0.0) 60%), radial-gradient(90% 70% at 100% 0%, rgba(34,211,238,0.22) 0%, rgba(34,211,238,0.0) 55%), linear-gradient(180deg, #0a0f1a 0%, #0b1220 45%, #0d1117 100%)'
        : 'radial-gradient(60% 30% at 8% 0%, rgba(67,56,202,0.12) 0%, rgba(6,182,212,0.04) 55%), linear-gradient(180deg,#f7fbff 0%, #ffffff 55%, #f6fbff 100%)',
      transition: 'background 450ms ease'
    }}>
      {/* Header */}
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'linear-gradient(90deg, rgba(99,102,241,0.06), rgba(34,211,238,0.03))',
          borderBottom: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
          transition: 'background-color 420ms ease, border-color 420ms ease, box-shadow 420ms ease'
        }}
      >
        <Toolbar>
          <DashboardIcon sx={{ mr: 2, color: theme.palette.mode === 'dark' ? '#8ab4ff' : 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 400, color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.92)' : 'text.primary' }}>
            Admin Dashboard - Transparency Ledger
          </Typography>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/home')}
            sx={{ textTransform: 'none', mr: 2 }}
          >
            Home
          </Button>
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none', mr: 2 }}
          >
            Public View
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ExitToApp />}
            onClick={handleLogout}
            sx={{ textTransform: 'none', mr: 1 }}
          >
            Sign Out
          </Button>
          <ThemeToggle />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Welcome Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome back, {currentUser?.name}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Role: {currentUser?.role} | Email: {currentUser?.email}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
              Add Transaction
            </Button>
            <Button variant="outlined" onClick={() => setAddDeptDialogOpen(true)}>Add Department</Button>
          </Stack>
        </Box>
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

        {/* Statistics (styled like Public view) */}
        <Grid container spacing={3} mb={4} justifyContent="center">
          <Grid item xs={12} md={3}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: theme.palette.mode === 'dark' ? '0 10px 28px rgba(6,182,212,0.18)' : '0 20px 60px rgba(16,24,40,0.18)',
              background: theme.palette.mode === 'dark' ? 'linear-gradient(180deg, rgba(6,182,212,0.15), rgba(6,182,212,0.06))' : 'linear-gradient(180deg, rgba(99,102,241,0.06), rgba(6,182,212,0.02))',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(6,182,212,0.35)' : '1px solid #edf2f7'
            }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'text.secondary' }}>
                  Blockchain Transactions
                </Typography>
                <Typography variant="h4" sx={{ color: theme.palette.mode === 'dark' ? '#7dd3fc' : 'primary.main' }}>
                  {filtered.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: theme.palette.mode === 'dark' ? '0 10px 28px rgba(167,243,208,0.18)' : '0 20px 60px rgba(16,24,40,0.18)',
              background: theme.palette.mode === 'dark' ? 'linear-gradient(180deg, rgba(167,243,208,0.15), rgba(167,243,208,0.06))' : 'linear-gradient(180deg, rgba(99,102,241,0.05), rgba(6,182,212,0.02))',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(167,243,208,0.35)' : '1px solid #edf2f7'
            }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'text.secondary' }}>
                  Total Volume
                </Typography>
                <Typography variant="h4" sx={{ color: theme.palette.mode === 'dark' ? '#a7f3d0' : 'success.main' }}>
                  {formatCurrency(filtered.reduce((sum, t) => sum + (t.amount || 0), 0))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: theme.palette.mode === 'dark' ? '0 10px 28px rgba(125,211,252,0.18)' : '0 20px 60px rgba(16,24,40,0.18)',
              background: theme.palette.mode === 'dark' ? 'linear-gradient(180deg, rgba(125,211,252,0.15), rgba(125,211,252,0.06))' : 'linear-gradient(180deg, rgba(99,102,241,0.06), rgba(34,211,238,0.03))',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(125,211,252,0.35)' : '1px solid #edf2f7'
            }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'text.secondary' }}>
                  Departments
                </Typography>
                <Typography variant="h4" sx={{ color: theme.palette.mode === 'dark' ? '#60a5fa' : 'info.main' }}>
                  {departments.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: theme.palette.mode === 'dark' ? '0 10px 28px rgba(234,179,8,0.18)' : '0 20px 60px rgba(16,24,40,0.18)',
              background: theme.palette.mode === 'dark' ? 'linear-gradient(180deg, rgba(234,179,8,0.15), rgba(234,179,8,0.06))' : 'linear-gradient(180deg, rgba(99,102,241,0.04), rgba(6,182,212,0.02))',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(234,179,8,0.35)' : '1px solid #edf2f7'
            }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'text.secondary' }}>
                  Pending Approvals
                </Typography>
                <Typography variant="h4" sx={{ color: theme.palette.mode === 'dark' ? '#fbbf24' : 'warning.main' }}>
                  {filtered.filter(t => String(t.status || '').toLowerCase() === 'pending').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search + Filters (match Public view) */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'linear-gradient(180deg, rgba(99,102,241,0.04), rgba(6,182,212,0.02))', transition: 'background-color 420ms ease, border-color 420ms ease, box-shadow 420ms ease' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search (purpose / from / to / hash)"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.54)' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Min Amount"
                size="small"
                type="number"
                value={filters.minAmount}
                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                sx={{ maxWidth: { xs: '100%', md: 160 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon fontSize="small" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.54)' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Max Amount"
                size="small"
                type="number"
                value={filters.maxAmount}
                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                sx={{ maxWidth: { xs: '100%', md: 160 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon fontSize="small" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.54)' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="From"
                size="small"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                sx={{ maxWidth: { xs: '100%', md: 160 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircleIcon fontSize="small" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.54)' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="To"
                size="small"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                sx={{ maxWidth: { xs: '100%', md: 160 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SwapHorizIcon fontSize="small" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.54)' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl size="small" fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  label="Status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Settled">Settled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="text"
                startIcon={<ClearAllIcon />}
                onClick={() => { setFilters({ minAmount: '', maxAmount: '', from: '', to: '', status: '' }); setSearch(''); }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Recent Transactions */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: theme.palette.mode === 'dark' ? '0 8px 30px rgba(0,0,0,0.6)' : '0 20px 60px rgba(16,24,40,0.12)' }}>
          <Typography variant="h6" gutterBottom>
            Recent Transactions
          </Typography>

          {filtered.length > 0 ? (
            <TableContainer sx={{
              borderRadius: 2,
              border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              background: theme.palette.mode === 'dark' ? 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))' : 'linear-gradient(180deg, #ffffff, #f6f6f8)'
            }}>
              <Table sx={{
                'thead th': {
                  fontWeight: 600,
                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                  borderBottom: '1px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
                },
                'tbody tr': {
                  borderBottom: '1px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
                },
                'tbody tr:nth-of-type(odd)': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.02)'
                }
              }}>
                <TableHead sx={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                  <TableRow>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                    <TableCell><strong>Purpose</strong></TableCell>
                    <TableCell><strong>From</strong></TableCell>
                    <TableCell><strong>To</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Hash</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.slice(0, 20).map((transaction) => (
                    <TableRow key={transaction.transaction_id} hover sx={{ cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(125,211,252,0.06)' : 'rgba(99,102,241,0.06)' } }} onClick={() => openDetail(transaction)}>
                      <TableCell>{formatDate(transaction.created_at)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color={transaction.amount >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell style={{ maxWidth: 300 }}>{transaction.purpose}</TableCell>
                      <TableCell>{transaction.fromDept || 'Unknown'}</TableCell>
                      <TableCell>{transaction.toDept || 'Unknown'}</TableCell>
                      <TableCell>
                        <Chip label={transaction.status} color={getStatusColor(transaction.status)} size="small" />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontFamily="monospace" sx={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }} title={transaction.transaction_hash}>
                            {transaction.transaction_hash?.substring(0, 20)}...
                          </Typography>
                          <IconButton size="small" onClick={(e) => copyHash(transaction.transaction_hash, e)}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">No transactions found</Typography>
            </Box>
          )}
        </Paper>

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogContent dividers>
            {detailTx ? (
              <Box>
                <Typography variant="subtitle2">Date</Typography>
                <Typography paragraph>{formatDate(detailTx.created_at)}</Typography>

                <Typography variant="subtitle2">Amount</Typography>
                <Typography paragraph>{formatCurrency(detailTx.amount)}</Typography>

                <Typography variant="subtitle2">Purpose</Typography>
                <Typography paragraph>{detailTx.purpose}</Typography>

                <Typography variant="subtitle2">From</Typography>
                <Typography paragraph>{detailTx.fromDept || 'Unknown'}</Typography>

                <Typography variant="subtitle2">To</Typography>
                <Typography paragraph>{detailTx.toDept || 'Unknown'}</Typography>

                <Typography variant="subtitle2">Status</Typography>
                <Chip label={detailTx.status} color={getStatusColor(detailTx.status)} sx={{ mb: 1 }} />

                <Box display="flex" alignItems="center" gap={2} mt={2}>
                  <Typography variant="body2" fontFamily="monospace">{detailTx.transaction_hash}</Typography>
                  <Button size="small" startIcon={<ContentCopy />} onClick={() => copyHash(detailTx.transaction_hash)}>
                    {copiedHash === detailTx.transaction_hash ? 'Copied' : 'Copy'}
                  </Button>
                </Box>
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

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