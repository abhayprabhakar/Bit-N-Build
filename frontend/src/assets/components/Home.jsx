import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
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
import { keyframes } from '@mui/system';
import Fade from '@mui/material/Fade';
import Zoom from '@mui/material/Zoom';

// Small hook for scroll-in animations
function useInView(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.unobserve(node);
      }
    }, options);
    obs.observe(node);
    return () => obs.disconnect();
  }, [options]);
  return { ref, inView };
}

// Animations
const floatBlob = keyframes`
  0% { transform: translateY(0px) translateX(0px) scale(1); filter: blur(24px); }
  50% { transform: translateY(-18px) translateX(10px) scale(1.05); filter: blur(28px); }
  100% { transform: translateY(0px) translateX(0px) scale(1); filter: blur(24px); }
`;

// Basic animated sparkline (stroke draw)
const AnimatedSparkline = ({ data = [], width = 220, height = 64, color = '#1976d2', strokeWidth = 2 }) => {
  if (!data || data.length === 0) return null;
  const values = data.map((d) => d.value ?? 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const stepX = width / Math.max(values.length - 1, 1);
  const points = values.map((v, i) => `${i * stepX},${height - ((v - min) / (max - min || 1)) * height}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 600,
          strokeDashoffset: 600,
          animation: 'dashdraw 1600ms ease-out forwards'
        }}
      />
      <style>{`@keyframes dashdraw { to { stroke-dashoffset: 0; } }`}</style>
    </svg>
  );
};

// Animated donut that eases the strokeDashoffset in
const AnimatedDonut = ({ ratio = 0.6, size = 84, strokeWidth = 10, fg = '#10b981', bg = '#e5e7eb' }) => {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);
  const offset = c * (1 - ratio);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={r} cx={0} cy={0} fill="none" stroke={bg} strokeWidth={strokeWidth} />
        <circle
          r={r}
          cx={0}
          cy={0}
          fill="none"
          stroke={fg}
          strokeWidth={strokeWidth}
          strokeDasharray={c}
          strokeDashoffset={ready ? offset : c}
          strokeLinecap="round"
          transform="rotate(-90)"
          style={{ transition: 'stroke-dashoffset 900ms ease' }}
        />
      </g>
    </svg>
  );
};

// Simple animated area chart with gradient fill
const AnimatedAreaChart = ({ data = [], width = 320, height = 120, color = '#60a5fa' }) => {
  if (!data || data.length === 0) return null;
  const values = data.map((d) => d.value ?? 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const stepX = width / Math.max(values.length - 1, 1);
  const linePoints = values.map((v, i) => `${i * stepX},${height - ((v - min) / (max - min || 1)) * height}`).join(' ');
  const areaPoints = `0,${height} ${linePoints} ${width},${height}`;
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);
  const fillId = useMemo(() => `grad-${Math.random().toString(36).slice(2,8)}`, []);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={areaPoints}
        fill={`url(#${fillId})`}
        stroke="none"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0px)' : 'translateY(12px)',
          transition: 'opacity 800ms ease, transform 800ms ease'
        }}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={2}
        points={linePoints}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 600,
          strokeDashoffset: 600,
          animation: 'dashdraw 1400ms 120ms ease-out forwards'
        }}
      />
      <style>{`@keyframes dashdraw { to { stroke-dashoffset: 0; } }`}</style>
    </svg>
  );
};

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
      transition: 'background 450ms ease',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background blobs */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Box sx={{
          position: 'absolute', width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.45), rgba(99,102,241,0))',
          top: -40, left: -20, animation: `${floatBlob} 9s ease-in-out infinite`,
          opacity: theme.palette.mode === 'dark' ? 0.6 : 0.4
        }} />
        <Box sx={{
          position: 'absolute', width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle at 60% 40%, rgba(34,211,238,0.40), rgba(34,211,238,0))',
          top: -60, right: -40, animation: `${floatBlob} 11s ease-in-out infinite`,
          opacity: theme.palette.mode === 'dark' ? 0.55 : 0.35
        }} />
      </Box>
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
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={8} alignItems="center">
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

        {/* Insights with animated charts */}
        <Box sx={{ mt: { xs: 8, md: 10 } }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            Live Insights (Sample)
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Recent Activity</Typography>
                <AnimatedSparkline
                  data={[{value:4},{value:8},{value:6},{value:10},{value:7},{value:12},{value:9}]}
                  width={360}
                  height={72}
                  color={theme.palette.mode === 'dark' ? '#7dd3fc' : theme.palette.primary.main}
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <AnimatedDonut ratio={0.68} size={96} strokeWidth={12} fg={theme.palette.mode === 'dark' ? '#34d399' : '#10b981'} bg={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#e5e7eb'} />
                <Box>
                  <Typography variant="subtitle1">Settlement Ratio</Typography>
                  <Typography variant="body2" color="text.secondary">68% of transactions settled in the latest period.</Typography>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Weekly Volume</Typography>
                <AnimatedAreaChart
                  data={[{value:10},{value:18},{value:12},{value:22},{value:26},{value:20},{value:32}]}
                  width={720}
                  height={140}
                  color={theme.palette.mode === 'dark' ? '#60a5fa' : '#1976d2'}
                />
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Features */}
        <Box sx={{ mt: { xs: 8, md: 10 } }}>
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
        <Box sx={{ mt: { xs: 8, md: 10 } }}>
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
                <Card sx={{ borderRadius: 3, boxShadow: theme.palette.mode === 'dark' ? '0 10px 28px rgba(16,24,40,0.35)' : '0 20px 60px rgba(16,24,40,0.12)', border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #edf2f7', transition: 'transform 300ms ease', '&:hover': { transform: 'translateY(-2px)' } }}>
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
        <Box sx={{ mt: { xs: 8, md: 10 }, textAlign: 'center' }}>
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
