import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert
} from '@mui/material';

const ChapterForm = ({ open, onClose, onSubmit, initialData, courseId }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    course: { id: courseId }
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Chapter title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      // Ensure courseId is included in the form data
      const dataToSubmit = {
        ...formData,
        course: { id: courseId }
      };
      
      await onSubmit(dataToSubmit);
      onClose();
    } catch (err) {
      console.error('Error submitting chapter:', err);
      setError(err.message || 'Failed to save chapter');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleClose = () => {
    setErrors({});
    setError('');
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Edit Chapter' : 'Add Chapter'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
          <TextField
            required
            fullWidth
            label="Chapter Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Description (optional)"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            placeholder="Enter a brief description of this chapter"
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : initialData ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChapterForm;
