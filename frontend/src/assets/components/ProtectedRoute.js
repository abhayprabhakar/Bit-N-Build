import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/LocalAuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return currentUser ? children : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;
