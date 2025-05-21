import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import AIChatBot from '../components/chatbot/AIChatBot';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, loading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (isRegistering) {
      if (!formData.firstName) {
        setError('First name is required');
        return false;
      }
      if (!formData.lastName) {
        setError('Last name is required');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isRegistering) {
        const result = await register(formData);
        if (!result.success) {
          setError(result.message);
        }
      } else {
        await handleLogin();
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleLogin = async () => {
    try {
      setError('');
      
      // Basic validation
      if (!formData.email.trim() || !formData.password) {
        setError('Please enter both email and password');
        return;
      }
      
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (!result.success) {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error in component:', err);
      setError('Authentication error: ' + (err.message || 'Unknown error'));
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'STUDENT',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      {/* Logo and School Name */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#fff', 
              width: 60,
              height: 60,
              borderRadius: '8px',
              mr: 2,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <SchoolIcon 
              sx={{ 
                color: '#00843D', 
                fontSize: 40,
                filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.2))' 
              }} 
            />
          </Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#00843D' }}>
            School of Excellence
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" sx={{ textAlign: 'center' }}>
          Empowering students with knowledge and excellence
        </Typography>
      </Box>

      {/* Login/Register Form */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderTop: '4px solid #00843D',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          mb: 4
        }}
      >
        <Typography component="h1" variant="h5" align="center" gutterBottom color="primary">
          {isRegistering ? 'Create Account' : 'Sign In'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                >
                  <MenuItem value="STUDENT">Student</MenuItem>
                  <MenuItem value="TEACHER_PENDING">Teacher</MenuItem>
                
                </Select>
              </FormControl>
              {formData.role === 'TEACHER_PENDING' && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Teacher accounts require admin approval. You'll be directed to an application page after registration.
                </Alert>
              )}
            </>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            autoFocus={!isRegistering}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            value={formData.password}
            onChange={handleChange}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.5, 
              fontSize: '1rem',
              backgroundColor: '#00843D',
              '&:hover': {
                backgroundColor: '#005025'
              }
            }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              isRegistering ? 'Register' : 'Sign In'
            )}
          </Button>

          <Divider sx={{ my: 2 }} />
          
          <Box textAlign="center">
            <Button
              onClick={toggleMode}
              sx={{ 
                textTransform: 'none',
                color: '#00843D',
                '&:hover': {
                  backgroundColor: 'rgba(0, 132, 61, 0.04)'
                }
              }}
              disabled={loading}
            >
              {isRegistering
                ? "Already have an account? Sign In"
                : "Don't have an account? Register"}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Information Box */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: '#f8f8f8' }}>
        <Typography variant="h6" gutterBottom color="primary">
          Welcome to School of Excellence
        </Typography>
        <Typography variant="body2" paragraph>
          Our platform offers a variety of courses taught by expert instructors. You can ask our AI assistant any questions about our programs or educational opportunities.
        </Typography>
        <Typography variant="body2">
          Have questions? Use the chat icon in the bottom-right corner to get immediate assistance!
        </Typography>
      </Paper>

      {/* AI Chatbot for pre-login access */}
      <AIChatBot />
    </Container>
  );
};

export default Login;
