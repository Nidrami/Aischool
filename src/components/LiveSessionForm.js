import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Grid, 
  Box, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { courseAPI } from '../services/api';

const LiveSessionForm = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledStart: new Date(),
    scheduledEnd: new Date(new Date().getTime() + 60 * 60 * 1000), // Default to 1 hour later
    meetingUrl: '',
    meetingId: '',
    meetingPassword: '',
    courseId: ''
  });
  
  const [errors, setErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseAPI.getAllCourses();
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        scheduledStart: initialData.scheduledStart ? new Date(initialData.scheduledStart) : new Date(),
        scheduledEnd: initialData.scheduledEnd ? new Date(initialData.scheduledEnd) : new Date(new Date().getTime() + 60 * 60 * 1000),
        meetingUrl: initialData.meetingUrl || '',
        meetingId: initialData.meetingId || '',
        meetingPassword: initialData.meetingPassword || '',
        courseId: initialData.course?.id || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.courseId) {
      newErrors.courseId = 'Course is required';
    }
    
    if (!formData.scheduledStart) {
      newErrors.scheduledStart = 'Start time is required';
    }
    
    if (!formData.scheduledEnd) {
      newErrors.scheduledEnd = 'End time is required';
    } else if (formData.scheduledEnd <= formData.scheduledStart) {
      newErrors.scheduledEnd = 'End time must be after start time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth required error={!!errors.courseId}>
              <InputLabel id="course-select-label">Course</InputLabel>
              <Select
                labelId="course-select-label"
                id="course-select"
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                label="Course"
              >
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title}
                  </MenuItem>
                ))}
              </Select>
              {errors.courseId && (
                <FormHelperText>{errors.courseId}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="Start Time"
              value={formData.scheduledStart}
              onChange={(newValue) => handleDateChange('scheduledStart', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  fullWidth
                  error={!!errors.scheduledStart}
                  helperText={errors.scheduledStart}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="End Time"
              value={formData.scheduledEnd}
              onChange={(newValue) => handleDateChange('scheduledEnd', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  fullWidth
                  error={!!errors.scheduledEnd}
                  helperText={errors.scheduledEnd}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Meeting URL"
              name="meetingUrl"
              value={formData.meetingUrl}
              onChange={handleChange}
              placeholder="e.g., https://zoom.us/j/123456789"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Meeting ID"
              name="meetingId"
              value={formData.meetingId}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Meeting Password"
              name="meetingPassword"
              value={formData.meetingPassword}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {initialData ? 'Update Session' : 'Create Session'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default LiveSessionForm;
