import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import userService from '../services/userService';

const UserForm = ({ user, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'STUDENT',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!user && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    try {
      if (user) {
        // If password is empty during edit, don't send it to keep the existing password
        const userData = { ...formData };
        if (!userData.password) {
          delete userData.password;
        }
        await userService.updateUser(user.id, userData);
      } else {
        await userService.createUser(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving user:', error);
      if (error.response?.data?.message) {
        // Handle server-side validation errors
        if (error.response.data.message.includes('email')) {
          setErrors(prev => ({ ...prev, email: 'Email already exists' }));
        }
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        name="firstName"
        label="First Name"
        value={formData.firstName}
        onChange={handleChange}
        error={!!errors.firstName}
        helperText={errors.firstName}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        name="lastName"
        label="Last Name"
        value={formData.lastName}
        onChange={handleChange}
        error={!!errors.lastName}
        helperText={errors.lastName}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        name="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        name="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={!!errors.password}
        helperText={user ? 'Leave blank to keep current password' : errors.password}
        margin="normal"
        required={!user}
      />

      <FormControl fullWidth margin="normal" error={!!errors.role}>
        <InputLabel>Role</InputLabel>
        <Select
          name="role"
          value={formData.role}
          onChange={handleChange}
          label="Role"
        >
          <MenuItem value="STUDENT">Student</MenuItem>
          <MenuItem value="TEACHER">Teacher</MenuItem>
          <MenuItem value="ADMIN">Admin</MenuItem>
        </Select>
        {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
      </FormControl>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="contained" color="primary">
          {user ? 'Update' : 'Create'} User
        </Button>
      </Box>
    </Box>
  );
};

export default UserForm;
