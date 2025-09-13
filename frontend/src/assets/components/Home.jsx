import React, { useContext } from 'react';
import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import AccountBalance from '@mui/icons-material/AccountBalance';
import Visibility from '@mui/icons-material/Visibility';
import Login from '@mui/icons-material/Login';
import Security from '@mui/icons-material/Security';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Lan from '@mui/icons-material/Lan';
import Insights from '@mui/icons-material/Insights';
import DarkMode from '@mui/icons-material/DarkMode';
import LightMode from '@mui/icons-material/LightMode';
import ColorModeContext from '../../contexts/ColorModeContext';

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { toggleColorMode } = useContext(ColorModeContext);

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
          <AccountBalance sx={{ mr: 1.5, color: theme.palette.mode === 'dark' ? '#8ab4ff' : 'primary.main' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 400 }}>
            Transparency Ledger
          </Typography>
          <Button variant="outlined" sx={{ textTransform: 'none', mr: 1 }} onClick={() => navigate('/') } startIcon={<Visibility />}>
            Public View
          </Button>
          <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => navigate('/signin')} startIcon={<Login />}>
            Admin Login
          </Button>
          <ThemeToggle />
        </Toolbar>
      </AppBar>

      {/* Hero */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Build Trust with Transparent Finance
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              MoneyLens Transparency Ledger combines a secure backend with an auditable blockchain trail and a modern UI. Track public transactions, verify integrity, and empower citizens and admins alike.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button size="large" variant="contained" onClick={() => navigate('/')} startIcon={<Visibility />}>
                View Public Ledger
              </Button>
              <Button size="large" variant="outlined" onClick={() => navigate('/signin')} startIcon={<Login />}>
                Admin Login
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: theme.palette.mode === 'dark' ? '0 10px 28px rgba(6,182,212,0.18)' : '0 20px 60px rgba(16,24,40,0.18)',
              background: theme.palette.mode === 'dark' ? 'linear-gradient(180deg, rgba(125,211,252,0.15), rgba(125,211,252,0.06))' : 'linear-gradient(180deg, rgba(99,102,241,0.06), rgba(34,211,238,0.03))',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(125,211,252,0.35)' : '1px solid #edf2f7'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Why Transparency Matters
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Trust grows when spending is visible and verifiable. Our ledger makes it easy to audit flows, deter misuse, and celebrate good governance.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Features */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            Key Features
          </Typography>
          <Grid container spacing={3}>
            {[{
              icon: <Security sx={{ color: theme.palette.mode === 'dark' ? '#a7f3d0' : 'success.main' }} />,
              title: 'Tamper-Proof Auditing',
              text: 'Every transaction can be anchored to a smart contract for immutable verification.'
            }, {
              icon: <TrendingUp sx={{ color: theme.palette.mode === 'dark' ? '#7dd3fc' : 'primary.main' }} />,
              title: 'Live Insights',
              text: 'Search, filter, and visualize activity to spot trends and anomalies fast.'
            }, {
              icon: <Lan sx={{ color: theme.palette.mode === 'dark' ? '#60a5fa' : 'info.main' }} />,
              title: 'Open APIs',
              text: 'Backend REST endpoints and a blockchain service you can integrate with.'
            }, {
              icon: <Insights sx={{ color: theme.palette.mode === 'dark' ? '#fbbf24' : 'warning.main' }} />,
              title: 'Admin Tools',
              text: 'Create departments, post transactions, and manage the ledger securely.'
            }].map((f, i) => (
              <Grid key={i} item xs={12} sm={6} md={3}>
                <Card sx={{
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: theme.palette.mode === 'dark' ? '0 10px 28px rgba(16,24,40,0.35)' : '0 20px 60px rgba(16,24,40,0.12)',
                  background: theme.palette.mode === 'dark' ? 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))' : 'linear-gradient(180deg, rgba(99,102,241,0.03), rgba(6,182,212,0.02))',
                  border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #edf2f7'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {f.icon}
                      <Typography variant="h6">{f.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">{f.text}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* How it works */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            How It Works
          </Typography>
          <Grid container spacing={3}>
            {[
              { step: '1', title: 'Record', text: 'Departments post transactions through secure admin tools.' },
              { step: '2', title: 'Anchor', text: 'Transactions are optionally anchored on-chain for proof.' },
              { step: '3', title: 'Verify', text: 'Citizens browse the public ledger with filters and details.' },
            ].map((s) => (
              <Grid key={s.step} item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, boxShadow: theme.palette.mode === 'dark' ? '0 10px 28px rgba(16,24,40,0.35)' : '0 20px 60px rgba(16,24,40,0.12)', border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #edf2f7' }}>
                  <CardContent>
                    <Typography variant="overline" sx={{ opacity: 0.7 }}>Step {s.step}</Typography>
                    <Typography variant="h6" sx={{ mb: 1 }}>{s.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{s.text}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Ready to explore?</Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button size="large" variant="contained" onClick={() => navigate('/')}>Open Public Ledger</Button>
            <Button size="large" variant="outlined" onClick={() => navigate('/signin')}>Go to Admin</Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
