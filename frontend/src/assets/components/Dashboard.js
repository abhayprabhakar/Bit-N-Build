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
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance,
  TrendingUp,
  People,
  ExitToApp
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser, logout, makeAuthenticatedRequest } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
    fetchDepartments();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/firebase/profile');
      if (response.success) {
        setUserProfile(response.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load user profile');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/departments');
      if (response.success) {
        setDepartments(response.departments || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const syncUser = async () => {
    try {
      await makeAuthenticatedRequest('/api/firebase/sync-user', 'POST');
      await fetchUserProfile();
    } catch (error) {
      console.error('Error syncing user:', error);
      setError('Failed to sync user data');
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" mt={4}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <DashboardIcon sx={{ mr: 2, fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Transparency Ledger Dashboard
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ExitToApp />}
          onClick={handleLogout}
          color="secondary"
        >
          Sign Out
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* User Info */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Welcome back!
              </Typography>
              <Typography variant="body1">
                <strong>Name:</strong> {userProfile?.name || currentUser?.displayName || 'User'}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {userProfile?.email || currentUser?.email}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Role:</strong> {userProfile?.role || 'Not assigned'}
              </Typography>
              {!userProfile && (
                <Button
                  variant="contained"
                  onClick={syncUser}
                  size="small"
                >
                  Sync User Data
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Box display="flex" alignItems="center" mb={1}>
                <AccountBalance sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Departments: {departments.length}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={1}>
                <People sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Active Users: 1
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Status: 
                  <Chip 
                    label="Operational" 
                    color="success" 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Departments */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Departments
        </Typography>
        {departments.length > 0 ? (
          <List>
            {departments.map((dept) => (
              <ListItem key={dept.dept_id} divider>
                <ListItemText
                  primary={dept.name}
                  secondary={`Head: ${dept.head_user_name || 'Not assigned'} | Budget: $${dept.allocated_budget?.toLocaleString() || '0'}`}
                />
                <Chip 
                  label={dept.parent_dept_id ? 'Sub-department' : 'Main Department'} 
                  variant="outlined" 
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No departments found. Contact your administrator to create departments.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;
