import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
} from '@mui/material';

const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      console.log('Sending request to:', `http://localhost:8080${endpoint}`);
      
      const requestData = isRegistering ? formData : {
        email: formData.email,
        password: formData.password
      };

      console.log('Request data:', requestData);
      const response = await axios.post(`http://localhost:8080${endpoint}`, requestData);
      console.log('Response:', response);
      
      // Both login and registration now return token and role
      const { token, role } = response.data;
      console.log('Authentication successful - Role:', role);
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      // Set the default Authorization header for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Redirect based on role
      switch (role) {
        case 'ADMIN':
          console.log('Redirecting to admin dashboard');
          navigate('/admin/dashboard');
          break;
        case 'TEACHER':
          console.log('Redirecting to teacher dashboard');
          navigate('/teacher/dashboard');
          break;
        default:
          console.log('Redirecting to student dashboard');
          navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data || 'An error occurred. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          {isRegistering ? 'Register' : 'Login'}
        </Typography>
        
        {error && (
          <Alert severity={error.includes('successful') ? 'success' : 'error'} sx={{ mb: 2 }}>
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
                  <MenuItem value="TEACHER">Teacher</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </Select>
              </FormControl>
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
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {isRegistering ? 'Register' : 'Login'}
          </Button>
        </form>

        <Box textAlign="center">
          <Button
            color="primary"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setFormData({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                role: 'STUDENT',
              });
            }}
          >
            {isRegistering
              ? "DON'T HAVE AN ACCOUNT? REGISTER"
              : "ALREADY HAVE AN ACCOUNT? LOGIN"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
