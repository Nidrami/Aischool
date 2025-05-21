import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getCurrentUser();
      
      // Parse the response data to ensure we have the correct user information
      const userData = response.data;
      
      // Make sure the role property is correctly set
      if (userData && userData.role) {
        // Create a proper user object with all necessary properties
        const userObject = {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          // Add any other properties you need
        };
        
        console.log('User loaded successfully:', userObject);
        setUser(userObject);
        setIsAuthenticated(true);
        setError(null);
      } else {
        console.error('Invalid user data received:', userData);
        setError('Invalid user data received');
        logout();
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Failed to load user data');
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log('Attempting login with credentials:', { email: credentials.email, passwordProvided: !!credentials.password });
      
      const response = await authAPI.login(credentials);
      console.log('Login response:', response.data);
      
      const { token, role } = response.data;
      
      if (!token) {
        console.error('No token received in login response');
        throw new Error('Authentication failed: No token received');
      }
      
      console.log('Token received, setting in localStorage and headers');
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await loadUser();
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      setError(error.response?.data?.message || 'Login failed');
      return { 
        success: false, 
        message: error.response?.data?.message || 'Invalid credentials'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      const { token, role } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await loadUser();
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed');
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        isAuthenticated, 
        error,
        login, 
        register,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
