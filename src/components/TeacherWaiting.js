import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Chip } from '@mui/material';
import { teacherApplicationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TeacherWaiting = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  const fetchApplicationStatus = async () => {
    try {
      setLoading(true);
      const response = await teacherApplicationAPI.getCurrentUserApplication();
      setApplication(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching application status:', err);
      // If there's no application yet, redirect to the application form
      if (err.response?.status === 404) {
        navigate('/teacher/apply');
        return;
      }
      setError('Unable to fetch your application status. Please try again later.');
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'PENDING':
        return <Chip label="Pending Review" color="warning" sx={{ fontSize: '1rem', py: 1 }} />;
      case 'APPROVED':
        return <Chip label="Approved" color="success" sx={{ fontSize: '1rem', py: 1 }} />;
      case 'REJECTED':
        return <Chip label="Rejected" color="error" sx={{ fontSize: '1rem', py: 1 }} />;
      default:
        return <Chip label={status} sx={{ fontSize: '1rem', py: 1 }} />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4, px: 2 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Application Status
        </Typography>
        
        {error ? (
          <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
        ) : application ? (
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              {getStatusChip(application.status)}
            </Box>

            <Typography variant="body1" sx={{ mt: 3 }}>
              Your teacher application has been submitted and is currently under review. Our administrative team will review your qualifications and experience.
            </Typography>

            <Typography variant="body1" sx={{ mt: 2 }}>
              You will be notified when your application status changes. Once approved, you will gain full access to teacher features.
            </Typography>

            <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Application Details:
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Submitted:</strong> {new Date(application.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Specialization:</strong> {application.specialization || 'Not specified'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Resume/CV:</strong> {application.resumeUrl ? (
                  <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                    View Resume
                  </a>
                ) : 'Not provided'}
              </Typography>
              {application.experience && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Experience:</strong> {application.experience.split('\n').map((line, i) => (
                    <span key={i}>{line}<br/></span>
                  ))}
                </Typography>
              )}
            </Box>
          </Box>
        ) : (
          <Typography align="center">
            No application found. Please contact support if you believe this is an error.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default TeacherWaiting;
