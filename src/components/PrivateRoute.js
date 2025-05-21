import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useAuth();

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role, handling both formats (with/without ROLE_ prefix)
  if (roles && user?.role) {
    const hasRequiredRole = roles.some(role => {
      // Check if the role matches directly or with ROLE_ prefix/removal
      if (user.role === role) return true;
      if (user.role === `ROLE_${role}`) return true;
      if (`ROLE_${user.role}` === role) return true;
      // Also check if the role is included in the string (for partial matches)
      return user.role.includes(role) || role.includes(user.role);
    });
    
    if (!hasRequiredRole) {
      console.log(`User role '${user.role}' does not match required roles:`, roles);
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children || <Outlet />;
};

export default PrivateRoute;
