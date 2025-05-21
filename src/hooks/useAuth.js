import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, loginFailure, logout } from '../store/slices/authSlice';
import { authAPI } from '../services/api';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      loadUser();
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      dispatch(loginSuccess({
        user: response.data,
        token: localStorage.getItem('token')
      }));
    } catch (error) {
      dispatch(loginFailure(error.response?.data?.message || 'Failed to load user'));
      localStorage.removeItem('token');
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      dispatch(loginSuccess({ user, token }));
      navigate('/dashboard');
    } catch (error) {
      dispatch(loginFailure(error.response?.data?.message || 'Login failed'));
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      dispatch(loginSuccess({ user, token }));
      navigate('/dashboard');
    } catch (error) {
      dispatch(loginFailure(error.response?.data?.message || 'Registration failed'));
      throw error;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    dispatch(logout());
    navigate('/login');
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout: logoutUser
  };
};

export default useAuth;
