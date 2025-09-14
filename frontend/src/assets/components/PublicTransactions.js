import React, { useState, useEffect, useContext } from 'react';
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
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
// custom theme toggle will be used instead of MUI Switch
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import {
  Visibility,
  AccountBalance,
  Login as LoginIcon,
  TrendingUp,
  Security
} from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import LightMode from '@mui/icons-material/LightMode';
import DarkMode from '@mui/icons-material/DarkMode';
import { useNavigate } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { Fab, List, ListItem, ListItemText } from '@mui/material';

import HomeIcon from '@mui/icons-material/Home';
import ColorModeContext from '../../contexts/ColorModeContext';
import CurrencyContext from '../../contexts/CurrencyContext';
import { useTheme } from '@mui/material/styles';
import ContentCopy from '@mui/icons-material/ContentCopy';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';


const PublicTransactions = () => {
  const theme = useTheme();
  const { toggleColorMode } = useContext(ColorModeContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedHash, setCopiedHash] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState({ minAmount: '', maxAmount: '', from: '', to: '', status: '' });
  const [search, setSearch] = useState('');
  const { currency, setCurrency } = useContext(CurrencyContext);
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTx, setFeedbackTx] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
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
    const s = (status || '').toLowerCase();
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

  // Note: FX helpers and formatCurrency are defined earlier in this file. Ensure there's only one definition to avoid redeclaration.

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const applyFilters = (items) => {
    return items.filter((t) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const hay = `${t.purpose || ''} ${t.fromDept || ''} ${t.toDept || ''} ${t.transaction_hash || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
  // amount filter (filters are entered in selected currency; convert to USD for comparison)
  const amountUSD = Number(t.amount || 0);
  const minVal = filters.minAmount !== '' && !isNaN(Number(filters.minAmount)) ? convertToUSD(Number(filters.minAmount), currency) : null;
  const maxVal = filters.maxAmount !== '' && !isNaN(Number(filters.maxAmount)) ? convertToUSD(Number(filters.maxAmount), currency) : null;
  if (minVal !== null && amountUSD < minVal) return false;
  if (maxVal !== null && amountUSD > maxVal) return false;
      // from/to filter (case-insensitive substring)
      if (filters.from && !(t.fromDept || '').toLowerCase().includes(filters.from.toLowerCase())) return false;
      if (filters.to && !(t.toDept || '').toLowerCase().includes(filters.to.toLowerCase())) return false;
      // status filter (case-insensitive exact match)
      if (filters.status && (String(t.status || '').toLowerCase() !== String(filters.status || '').toLowerCase())) return false;
      if (filters.anomaly === "true" && !t.anomaly) return false;
      if (filters.anomaly === "false" && t.anomaly) return false;
      if (filters.special === "anomaly" && !t.anomaly) return false;
      if (filters.special === "settled" && String(t.status).toLowerCase() !== "settled") return false;
      if (filters.special === "rejected" && (String(t.status).toLowerCase() !== "rejected" || t.anomaly)) return false;
      return true;
    });
  };

  // Custom theme toggle (sun <-> moon) with smooth animation
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

  const openFeedback = async (tx) => {
    setFeedbackTx(tx);
    setFeedbackInput('');
    setFeedbackError('');
    setFeedbackOpen(true);
    setFeedbackLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/feedback/${tx.transaction_id}`);
      const data = await res.json();
      setFeedbacks(data || []);
    } catch (e) {
      setFeedbacks([]);
    }
    setFeedbackLoading(false);
  };

  const submitFeedback = async () => {
    if (!feedbackInput.trim()) {
      setFeedbackError('Please enter your feedback.');
      return;
    }
    setFeedbackLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/feedback/${feedbackTx.transaction_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: feedbackInput })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackInput('');
        // Refresh feedbacks
        const fres = await fetch(`http://localhost:5000/api/feedback/${feedbackTx.transaction_id}`);
        setFeedbacks(await fres.json());
        setFeedbackError('');
      } else {
        setFeedbackError(data.message || 'Failed to submit feedback.');
      }
    } catch (e) {
      setFeedbackError('Failed to submit feedback.');
    }
    setFeedbackLoading(false);
  };

  // derive data for small visuals
  const filtered = applyFilters(transactions);

  const getLastNDaysVolumes = (n = 7) => {
    const days = Array.from({ length: n }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (n - 1 - i));
      return { day: d.toISOString().slice(0, 10), value: 0 };
    });
    filtered.forEach((t) => {
      const d = new Date(t.created_at).toISOString().slice(0, 10);
      const idx = days.findIndex(x => x.day === d);
      if (idx >= 0) days[idx].value += Number(t.amount || 0);
    });
    return days;
  };

  const recentVolumes = getLastNDaysVolumes(7);

  // Currency conversion helpers (placeholder rates). In production these should come from a reliable FX API.
  const FX_RATES_TO_USD = {
    USD: 1,
    GBP: 1.27, // 1 GBP = 1.27 USD (example)
    INR: 0.012, // 1 INR = 0.012 USD (example)
  };

  const convertToUSD = (amount, fromCurrency) => {
    const rate = FX_RATES_TO_USD[fromCurrency] || 1;
    return amount * rate;
  };

  const convertFromUSD = (amountUSD, toCurrency) => {
    const rate = FX_RATES_TO_USD[toCurrency] || 1;
    return amountUSD / rate;
  };

  const formatCurrency = (amountUSD) => {
    const value = convertFromUSD(Number(amountUSD || 0), currency);
    switch (currency) {
      case 'GBP':
        return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
      case 'INR':
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
      default:
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
  };

  const settledCount = filtered.filter(t => String(t.status || '').toLowerCase() === 'settled').length;
  const settledRatio = filtered.length > 0 ? settledCount / filtered.length : 0;

  // Inline SVG sparkline component
  const Sparkline = ({ data = [], width = 140, height = 36, stroke = theme.palette.mode === 'dark' ? '#7dd3fc' : '#1976d2' }) => {
    if (!data || data.length === 0) return null;
    const values = data.map(d => d.value);
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

  // Simple donut showing approved ratio
  const Donut = ({ ratio = 0, size = 56, strokeWidth = 8 }) => {
    const r = (size - strokeWidth) / 2;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - ratio);
    const bg = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#eee';
    const fg = theme.palette.mode === 'dark' ? '#34d399' : '#10b981';
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <circle r={r} cx={0} cy={0} fill="none" stroke={bg} strokeWidth={strokeWidth} />
          <circle r={r} cx={0} cy={0} fill="none" stroke={fg} strokeWidth={strokeWidth} strokeDasharray={`${c}`} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90)" />
        </g>
      </svg>
    );
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
          boxShadow: 0,
          bgcolor: 'transparent',
          backgroundImage: 'none',
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(10,15,26,0.85)'
            : 'rgba(255,255,255,0.85)',
          borderRadius: '0 0 18px 18px',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          mt: 0,
          zIndex: 1201,
          transition: 'background-color 420ms ease, border-color 420ms ease, box-shadow 420ms ease'
        }}
      >
        <Toolbar>
          <AccountBalance sx={{ mr: 1.5, color: theme.palette.mode === 'dark' ? '#8ab4ff' : 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 400, color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.92)' : 'text.primary' }}>
            Transparency Ledger — Public View
          </Typography>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/home')}
            sx={{
              textTransform: 'none',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'text.primary',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'transparent',
              boxShadow: 'none',
              mr: 1,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)'
              }
            }}
          >
            Home
          </Button>
          <Button
            variant="outlined"
            startIcon={<LoginIcon />}
            onClick={() => navigate('/signin')}
            sx={{
              textTransform: 'none',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'text.primary',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'transparent',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)'
              }
            }}
          >
            Login
          </Button>
          <FormControl size="small" sx={{ ml: 1, minWidth: 120 }}>
            <InputLabel>Currency</InputLabel>
            <Select value={currency} label="Currency" onChange={(e) => setCurrency(e.target.value)}>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="GBP">GBP</MenuItem>
              <MenuItem value="INR">INR</MenuItem>
            </Select>
          </FormControl>
          <ThemeToggle />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* filters moved below statistics */}

  {/* Statistics */}
        <Grid container spacing={3} mb={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: theme.palette.mode === 'dark' ? '0 10px 28px rgba(6,182,212,0.18)' : '0 20px 60px rgba(16,24,40,0.18)',
              background: theme.palette.mode === 'dark' ? 'linear-gradient(180deg, rgba(6,182,212,0.15), rgba(6,182,212,0.06))' : 'linear-gradient(180deg, rgba(99,102,241,0.06), rgba(6,182,212,0.02))',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(6,182,212,0.35)' : '1px solid #edf2f7'
            }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'text.secondary' }}>
                  Total Transactions
                </Typography>
                <Typography variant="h4" sx={{ color: theme.palette.mode === 'dark' ? '#7dd3fc' : 'primary.main' }}>
                  {applyFilters(transactions).length}
                </Typography>
                <Box mt={1}>
                  <Sparkline data={recentVolumes.map(d => ({ value: d.value }))} width={160} height={36} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
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
                  {formatCurrency(
                    applyFilters(transactions).reduce((sum, t) => sum + (t.amount || 0), 0)
                  )}
                </Typography>
                <Box mt={1} display="flex" alignItems="center" gap={2} justifyContent="center">
                  <Sparkline data={recentVolumes.map(d => ({ value: Math.abs(convertFromUSD(d.value, currency)) }))} width={120} height={36} stroke={theme.palette.mode === 'dark' ? '#a7f3d0' : '#2e7d32'} />
                  <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>Last 7 days</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: theme.palette.mode === 'dark' ? '0 10px 28px rgba(125,211,252,0.18)' : '0 20px 60px rgba(16,24,40,0.18)',
              background: theme.palette.mode === 'dark' ? 'linear-gradient(180deg, rgba(125,211,252,0.15), rgba(125,211,252,0.06))' : 'linear-gradient(180deg, rgba(99,102,241,0.06), rgba(34,211,238,0.03))',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(125,211,252,0.35)' : '1px solid #edf2f7'
            }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'text.secondary' }}>
                  Settled Transactions
                </Typography>
                  <Typography variant="h4" sx={{ color: theme.palette.mode === 'dark' ? '#60a5fa' : 'info.main' }}>
                    {settledCount} / {applyFilters(transactions).length}
                  </Typography>
                  {/* compact: show percent label and donut */}
                  <Box mt={1} display="flex" alignItems="center" justifyContent="center" sx={{ gap: 1 }}>
                    <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.75)' : 'text.secondary' }}>{Math.round(settledRatio * 100)}% Settled</Typography>
                    <Donut ratio={settledRatio} size={40} strokeWidth={6} />
                  </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search + Filters - moved directly after statistics */}
  <Paper sx={{ p: 2, mb: 3, borderRadius: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'linear-gradient(180deg, rgba(99,102,241,0.04), rgba(6,182,212,0.02))', transition: 'background-color 420ms ease, border-color 420ms ease, box-shadow 420ms ease' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                label="Search (purpose / from / to / hash)"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: 280 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.54)' }} />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label="Min Amount"
                size="small"
                type="number"
                value={filters.minAmount}
                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon fontSize="small" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.54)' }} />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label="Max Amount"
                size="small"
                type="number"
                value={filters.maxAmount}
                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon fontSize="small" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.54)' }} />
                    </InputAdornment>
                  )
                }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Currency</InputLabel>
                <Select
                  label="Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                  <MenuItem value="INR">INR</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                label="From"
                size="small"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircleIcon fontSize="small" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.54)' }} />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label="To"
                size="small"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SwapHorizIcon fontSize="small" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.54)' }} />
                    </InputAdornment>
                  )
                }}
              />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  startAdornment={<InputAdornment position="start"><FilterListIcon fontSize="small" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.54)' }} /></InputAdornment>}
                >
                  <MenuItem value="">Any</MenuItem>
                  {/* Only show application-supported statuses */}
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Settled">Settled</MenuItem>
                </Select>
              </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                label="Filter"
                value={filters.special || ''}
                onChange={e => setFilters({ ...filters, special: e.target.value })}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="anomaly">Anomaly</MenuItem>
                <MenuItem value="settled">Settled</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
              <Button variant="text" size="small" onClick={() => { setFilters({ minAmount: '', maxAmount: '', from: '', to: '', status: '' }); setSearch(''); }} startIcon={<ClearAllIcon fontSize="small" />}>
                Clear
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Transactions Table */}
  <Paper sx={{ p: 3, borderRadius: 4, boxShadow: theme.palette.mode === 'dark' ? '0 16px 40px rgba(0,0,0,0.5)' : '0 28px 80px rgba(16,24,40,0.20)', background: theme.palette.mode === 'dark' ? 'linear-gradient(180deg, rgba(9,14,24,0.96) 0%, rgba(12,18,30,0.96) 100%)' : 'linear-gradient(180deg, #ffffff 0%, #fafcff 100%)', border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5eaf2', transition: 'background 420ms ease, border-color 420ms ease, box-shadow 420ms ease' }}>
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.92)' : 'text.primary' }}>
            All Transactions
          </Typography>
          
                  {applyFilters(transactions).length > 0 ? (
            <TableContainer sx={{ borderRadius: 3 }}>
              <Table size="medium" sx={{
                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.87)' : 'inherit',
                '& thead th': {
                  position: 'sticky',
                  top: 0,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(180deg, rgba(99,102,241,0.18) 0%, rgba(6,182,212,0.12) 100%)'
                    : 'linear-gradient(180deg, #ffffff 0%, #f3f6fb 100%)',
                  zIndex: 1,
                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.87)' : 'text.primary'
                },
                '& td, & th': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5eaf2'
                },
                '& tbody tr:hover': theme.palette.mode === 'dark' ? {
                  boxShadow: '0 0 0 1px rgba(6,182,212,0.35) inset',
                  backgroundColor: 'rgba(6,182,212,0.06)'
                } : {
                  backgroundColor: 'rgba(25,118,210,0.06)'
                }
              }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.87)' : 'text.primary' }}><strong>Date</strong></TableCell>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.87)' : 'text.primary' }}><strong>Amount</strong></TableCell>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.87)' : 'text.primary' }}><strong>Purpose</strong></TableCell>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.87)' : 'text.primary' }}><strong>From</strong></TableCell>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.87)' : 'text.primary' }}><strong>To</strong></TableCell>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.87)' : 'text.primary' }}><strong>Status</strong></TableCell>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.87)' : 'text.primary' }}><strong>Hash</strong></TableCell>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.87)' : 'text.primary' }}><strong>Feedback</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applyFilters(transactions).map((transaction) => (
                    <TableRow
                      key={transaction.transaction_id}
                      hover
                      onClick={() => { setSelectedTx(transaction); setDialogOpen(true); }}
                      sx={{
                        cursor: 'pointer',
                        '&:nth-of-type(odd)': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' },
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell>
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={transaction.amount >= 0 ? (
                            theme.palette.mode === 'dark'
                              ? {
                                  fontWeight: 800,
                                  background: 'linear-gradient(135deg, #34d399, #10b981)',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent'
                                }
                              : { color: 'success.main', fontWeight: 800 }
                          ) : { color: 'error.main', fontWeight: 700 }}
                          fontWeight="bold"
                        >
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 340, color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'text.primary' }}>
                          {transaction.purpose}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.87)' : 'text.primary' }}>{transaction.fromDept || 'Unknown'}</TableCell>
                      <TableCell sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.87)' : 'text.primary' }}>{transaction.toDept || 'Unknown'}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          color={getStatusColor(transaction.status)}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.12)',
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.87)' : 'text.primary',
                            background: (() => {
                              const s = String(transaction.status || '').toLowerCase();
                              if (s === 'approved') return theme.palette.mode === 'dark' ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.10)';
                              if (s === 'pending') return theme.palette.mode === 'dark' ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.10)';
                              if (s === 'rejected') return theme.palette.mode === 'dark' ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.10)';
                              if (s === 'settled') return theme.palette.mode === 'dark' ? 'rgba(96,165,250,0.12)' : 'rgba(59,130,246,0.10)';
                              return theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.10)';
                            })()
                          }}
                        />
                        {transaction.anomaly && (
                          <Chip label="Anomaly" color="error" size="small" sx={{ ml: 1 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" sx={{ gap: 1 }}>
                          <Tooltip title={transaction.transaction_hash || ''} placement="top">
                            <Typography
                              variant="body2"
                              fontFamily="monospace"
                              sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}
                            >
                              {transaction.transaction_hash ? `${transaction.transaction_hash.substring(0, 16)}...` : '—'}
                            </Typography>
                          </Tooltip>
                          <Tooltip title={copiedHash === transaction.transaction_hash ? 'Copied!' : 'Copy full hash'}>
                            <IconButton
                              size="small"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  if (transaction.transaction_hash) {
                                    await navigator.clipboard.writeText(transaction.transaction_hash);
                                    setCopiedHash(transaction.transaction_hash);
                                    setTimeout(() => setCopiedHash(null), 2000);
                                  }
                                } catch (err) {
                                  console.error('Copy failed', err);
                                }
                              }}
                              aria-label="copy-hash"
                            >
                              <ContentCopy fontSize="small" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.54)' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={e => { e.stopPropagation(); openFeedback(transaction); }}
                        >
                          Feedback
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
                No transactions found
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Footer */}
        <Box mt={6} pt={3} borderTop={1} borderColor="divider">
          <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'text.secondary' }} align="center">
            Transparency Ledger — Ensuring Financial Accountability
          </Typography>
        </Box>
      </Container>
      <Chatbot />
      {/* Transaction detail dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.92)' : 'text.primary',
            border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
            boxShadow: theme.palette.mode === 'dark' ? '0 12px 36px rgba(2,6,23,0.6)' : '0 30px 90px rgba(16,24,40,0.22)'
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'transparent', borderBottom: 'none', color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.94)' : 'text.primary' }}>Transaction Details</DialogTitle>
        <DialogContent dividers sx={{ bgcolor: 'transparent', color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.88)' : 'text.secondary' }}>
          {selectedTx ? (
            <Box>
              <Typography variant="subtitle2">Date</Typography>
              <Typography paragraph>{formatDate(selectedTx.created_at)}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2">Amount</Typography>
              <Typography paragraph>{formatCurrency(selectedTx.amount)}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2">Purpose</Typography>
              <Typography paragraph>{selectedTx.purpose || '—'}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2">From</Typography>
              <Typography paragraph>{selectedTx.fromDept || 'Unknown'}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2">To</Typography>
              <Typography paragraph>{selectedTx.toDept || 'Unknown'}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2">Status</Typography>
              <Chip label={selectedTx.status} color={getStatusColor(selectedTx.status)} size="small" sx={{ mt: 1 }} />
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2">Transaction Hash</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{selectedTx.transaction_hash || '—'}</Typography>
                <IconButton size="small" onClick={async () => { try { if (selectedTx.transaction_hash) { await navigator.clipboard.writeText(selectedTx.transaction_hash); setCopiedHash(selectedTx.transaction_hash); setTimeout(() => setCopiedHash(null), 2000); } } catch (err) { console.error(err); } }}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ) : null}
        {selectedTx?.status === 'Rejected' && selectedTx?.rejection_reason && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2">Rejection Reason</Typography>
            <Typography paragraph color="error">{selectedTx.rejection_reason}</Typography>
          </>
        )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'transparent', borderTop: 'none' }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'text.primary' }}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Community Feedback
          <IconButton
            aria-label="close"
            onClick={() => setFeedbackOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" gutterBottom>
            Transaction: {feedbackTx?.purpose}
          </Typography>
          <TextField
            label="Leave your feedback"
            fullWidth
            multiline
            minRows={2}
            value={feedbackInput}
            onChange={e => setFeedbackInput(e.target.value)}
            disabled={feedbackLoading}
            sx={{ mb: 2 }}
          />
          {feedbackError && <Alert severity="error" sx={{ mb: 2 }}>{feedbackError}</Alert>}
          <Button
            variant="contained"
            onClick={submitFeedback}
            disabled={feedbackLoading}
            sx={{ mb: 2 }}
          >
            Submit
          </Button>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Previous Feedback
          </Typography>
          {feedbackLoading ? (
            <CircularProgress size={24} />
          ) : (
            <List>
              {feedbacks.length === 0 && <ListItem><ListItemText primary="No feedback yet." /></ListItem>}
              {feedbacks.map(f => (
                <ListItem key={f.feedback_id} alignItems="flex-start">
                  <ListItemText
                    primary={f.comment}
                    secondary={new Date(f.created_at).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

function Chatbot() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([
    { sender: 'bot', text: 'Hi! Ask me anything about budget allocation or transactions.' }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (open && scrollRef.current) {
      // scroll to bottom
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages(msgs => [...msgs, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userText })
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { sender: 'bot', text: data.answer || "Sorry, I couldn't find an answer." }]);
    } catch (e) {
      setMessages(msgs => [...msgs, { sender: 'bot', text: 'Error connecting to chatbot.' }]);
    }
    setLoading(false);
  };

  const themeBg = theme.palette.mode === 'dark';

  return (
    <>
      <Fab
        color="primary"
        aria-label="chat"
        onClick={() => setOpen(true)}
        sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 2000 }}
      >
        <ChatIcon />
      </Fab>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: {
          borderRadius: 3,
          overflow: 'hidden',
          // Match the page background exactly
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(80% 60% at 20% 0%, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0.0) 60%), radial-gradient(90% 70% at 100% 0%, rgba(34,211,238,0.22) 0%, rgba(34,211,238,0.0) 55%), linear-gradient(180deg, #0a0f1a 0%, #0b1220 45%, #0d1117 100%)'
            : 'radial-gradient(60% 30% at 8% 0%, rgba(67,56,202,0.12) 0%, rgba(6,182,212,0.04) 55%), linear-gradient(180deg,#f7fbff 0%, #ffffff 55%, #f6fbff 100%)',
          boxShadow: theme.palette.mode === 'dark' ? '0 18px 60px rgba(2,6,23,0.6)' : '0 22px 66px rgba(16,24,40,0.12)',
          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.95)' : '#0f172a'
        } }}
      >
        <Box sx={{
          // Force a vivid header gradient to match site branding (explicit hex)
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(90deg, #0b1220 0%, #06202a 100%)'
            : 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)',
          px: 2,
          py: 1.25,
          display: 'flex',
          alignItems: 'center'
        }}>
          <Typography variant="subtitle1" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.92)' : 'text.primary', flex: 1 }}>Transparency Chatbot</Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>

  <DialogContent sx={{ p: 1, background: 'transparent' }}>
          <Box ref={scrollRef} sx={{ maxHeight: 360, overflowY: 'auto', px: 1, py: 0.5 }}>
            {messages.map((msg, idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', mb: 1 }}>
                <Box sx={{
                  // Force explicit bubble colors so they remain vibrant regardless of theme palette
                  bgcolor: msg.sender === 'user' ? (theme.palette.mode === 'dark' ? '#1e3a8a' : '#1e40af') : (theme.palette.mode === 'dark' ? '#047481' : '#06b6d4'),
                  color: '#ffffff',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: '78%',
                  boxShadow: theme.palette.mode === 'dark' ? '0 8px 24px rgba(2,6,23,0.6)' : '0 6px 18px rgba(16,24,40,0.06)'
                }}>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                <Box sx={{ bgcolor: 'transparent', color: theme.palette.text.secondary, px: 2, py: 1 }}>Thinking...</Box>
              </Box>
            )}
          </Box>
        </DialogContent>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <TextField
            placeholder="Ask about budget or transactions..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            fullWidth
            size="small"
            disabled={loading}
          />
          <Button variant="contained" onClick={handleSend} disabled={loading || !input.trim()}>
            Send
          </Button>
        </Box>
      </Dialog>
    </>
  );
}



export default PublicTransactions;