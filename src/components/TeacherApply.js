import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { teacherApplicationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'History',
  'Geography',
  'English',
  'Literature',
  'Economics',
  'Business Studies',
  'Art',
  'Music',
  'Physical Education',
  'Foreign Languages'
];

const TeacherApply = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: null,
    specialization: '',
    experience: '',
    education: '',
    subjects: [],
    about: '',
    resumeUrl: ''
  });

  useEffect(() => {
    // Check if the user already has an application
    const checkExistingApplication = async () => {
      try {
        // Using axios directly with custom error handling
        const response = await teacherApplicationAPI.axiosInstance.get('/api/teacher-applications/me', {
          validateStatus: function (status) {
            return status < 500; // Only treat 500+ status codes as errors
          }
        });
        
        if (response.status === 200 && response.data) {
          // If user has an existing application
          setExistingApplication(response.data);
          setSuccess(true);
          
          // Also set form data based on the existing application
          const app = response.data;
          
          // Extract subject information from experience field if possible
          let subjectsList = [];
          if (app.subjects) {
            subjectsList = app.subjects.split(',').map(s => s.trim());
          }
          
          setFormData({
            fullName: `${user.firstName} ${user.lastName}`,
            birthDate: app.birthDate ? new Date(app.birthDate) : null,
            specialization: app.specialization || '',
            experience: app.experience ? app.experience.match(/Years of Experience: (.+?)\n/)?.[1] || '' : '',
            education: app.education || '',
            subjects: subjectsList,
            about: app.about || '',
            resumeUrl: app.resumeUrl || ''
          });
        } else {
          // No application yet, just prefill name
          setFormData(prev => ({
            ...prev,
            fullName: `${user.firstName} ${user.lastName}`
          }));
        }
      } catch (err) {
        // Just prefill the name on error
        setFormData(prev => ({
          ...prev,
          fullName: `${user.firstName} ${user.lastName}`
        }));
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      checkExistingApplication();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      birthDate: date
    }));
  };

  const handleSubjectChange = (e) => {
    setFormData(prev => ({
      ...prev,
      subjects: e.target.value
    }));
  };

  // Add loading state component
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading application data...</Typography>
      </Box>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Format the application data
      const applicationData = {
        specialization: formData.specialization,
        experience: `
Years of Experience: ${formData.experience}

Education: ${formData.education}

Subjects: ${formData.subjects.join(', ')}

About Me: ${formData.about}

Birth Date: ${formData.birthDate ? formData.birthDate.toLocaleDateString() : 'Not provided'}
        `,
        resumeUrl: formData.resumeUrl
      };

      await teacherApplicationAPI.createApplication(applicationData);
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If application was submitted successfully or user has an existing application
  if (success || existingApplication) {
    return (
      <Paper elevation={3} sx={{ maxWidth: 800, mx: 'auto', p: 4, borderRadius: 2 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Your application has been submitted successfully!
        </Alert>
        
        <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
          Teacher Application Form (Submitted)
        </Typography>
        
        {/* Display the submitted form data in read-only mode */}
        <Box sx={{ opacity: 0.8, pointerEvents: 'none', mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
            Personal Information
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                value={formData.fullName}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Birth Date"
                value={formData.birthDate ? formData.birthDate.toLocaleDateString() : 'Not provided'}
                fullWidth
                disabled
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
            Professional Information
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Main Specialization"
                value={formData.specialization}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Years of Experience"
                value={formData.experience}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Education"
                value={formData.education}
                fullWidth
                multiline
                rows={2}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Subjects You Can Teach"
                value={formData.subjects.join(', ')}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="About You"
                value={formData.about}
                fullWidth
                multiline
                rows={3}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Resume/CV URL"
                value={formData.resumeUrl}
                fullWidth
                disabled
              />
            </Grid>
          </Grid>
        </Box>
        
        {/* Button to view application status */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/teacher/waiting')}
            startIcon={<AssignmentIcon />}
          >
            View Application Status
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary" sx={{ mb: 3, fontWeight: 'bold' }}>
          Teacher Application Form
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4 }}>
          Thank you for your interest in becoming a teacher at SmartLearn. Please fill out the form below to submit your application.
          Our team will review your information and get back to you as soon as possible.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={!!user}
                helperText={user ? "Pre-filled from your account" : ""}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Birth Date"
                value={formData.birthDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth />}
                maxDate={new Date()}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Professional Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Main Specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
                placeholder="e.g., Mathematics, Computer Science"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                name="experience"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.experience}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                required
                placeholder="e.g., Ph.D. in Computer Science, Master's in Mathematics"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="subjects-label">Subjects You Can Teach</InputLabel>
                <Select
                  labelId="subjects-label"
                  multiple
                  name="subjects"
                  value={formData.subjects}
                  onChange={handleSubjectChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="About You"
                name="about"
                value={formData.about}
                onChange={handleChange}
                required
                placeholder="Tell us about yourself, your teaching philosophy, and why you want to join our platform"
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Resume/CV URL"
                name="resumeUrl"
                value={formData.resumeUrl}
                onChange={handleChange}
                placeholder="Link to your resume or CV (Google Drive, Dropbox, etc.)"
                helperText="Provide a publicly accessible link to your resume or CV"
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                size="large"
                disabled={loading}
                sx={{ 
                  py: 1.5,
                  backgroundColor: 'primary.main',
                  '&:hover': { backgroundColor: 'primary.dark' } 
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Application"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TeacherApply;
