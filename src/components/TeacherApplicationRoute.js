import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { teacherApplicationAPI } from '../services/api';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

/**
 * Protected route component for teachers who have submitted an application
 * Redirects to the application form if no application exists
 */
const TeacherApplicationRoute = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasApplication, setHasApplication] = useState(false);

  useEffect(() => {
    const checkApplication = async () => {
      try {
        if (user && user.role === 'TEACHER_PENDING') {
          // Using axios directly to suppress error messages for 404
          const response = await teacherApplicationAPI.axiosInstance.get('/api/teacher-applications/me', {
            validateStatus: function (status) {
              return status < 500; // Only treat 500+ status codes as errors
            }
          });
          
          // Set hasApplication to true only if we got a 200 response with valid data
          setHasApplication(response.status === 200 && !!response?.data?.id);
        }
      } catch (error) {
        console.log('Application check failed silently');
        setHasApplication(false);
      } finally {
        setLoading(false);
      }
    };

    checkApplication();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If user has no application, redirect to the application form
  if (!hasApplication && user?.role === 'TEACHER_PENDING') {
    return <Navigate to="/teacher/apply" replace />;
  }

  return children;
};

export default TeacherApplicationRoute;
