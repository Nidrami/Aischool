import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  InputLabel
} from '@mui/material';
import '../css/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUser(response.data);
        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          password: '',
          confirmPassword: ''
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle profile picture file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    }
  };

  // Handle profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/users/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUser(response.data);
      setSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // Handle profile picture upload
  const handlePictureUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image to upload');
      return;
    }
    
    setUploadingPicture(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/users/profile/picture`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      setUser(response.data);
      setSelectedFile(null);
      setFilePreview(null);
      setSuccess('Profile picture updated successfully');
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setError(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 5 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        My Profile
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={3} className="profile-card">
            <CardContent sx={{ textAlign: 'center' }}>
              {user.profilePicture ? (
                <Avatar 
                  src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/uploads/${user.profilePicture}`} 
                  alt="Profile"
                  sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
                />
              ) : (
                <Avatar 
                  sx={{ 
                    width: 150, 
                    height: 150, 
                    fontSize: '3rem',
                    bgcolor: 'primary.main',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </Avatar>
              )}
              
              <Typography variant="h5">{user.firstName} {user.lastName}</Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>{user.email}</Typography>
              <Typography variant="subtitle1">
                <strong>Role:</strong> {user.role}
              </Typography>
              
              <Box component="form" onSubmit={handlePictureUpload} sx={{ mt: 2 }}>
                <InputLabel htmlFor="profilePicture" sx={{ mb: 1, textAlign: 'left' }}>
                  Change Profile Picture
                </InputLabel>
                <input
                  type="file"
                  id="profilePicture"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ width: '100%', mb: 2 }}
                />
                
                {filePreview && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>Preview:</Typography>
                    <Avatar 
                      src={filePreview} 
                      alt="Preview" 
                      sx={{ width: 100, height: 100, mx: 'auto' }}
                    />
                  </Box>
                )}
                
                <Button 
                  variant="contained" 
                  type="submit" 
                  disabled={!selectedFile || uploadingPicture}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  {uploadingPicture ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} /> Uploading...
                    </>
                  ) : 'Upload Picture'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card elevation={3} className="profile-card">
            <CardContent>
              <Typography variant="h5" gutterBottom>Edit Profile Information</Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  sx={{ mt: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="New Password (leave blank to keep current password)"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mt: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mt: 2, mb: 3 }}
                />
                
                <Button 
                  variant="contained" 
                  color="success"
                  type="submit" 
                  disabled={updating}
                  fullWidth
                >
                  {updating ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} /> Updating...
                    </>
                  ) : 'Update Profile'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 