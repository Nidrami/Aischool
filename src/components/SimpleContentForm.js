import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  FormHelperText,
  Alert,
  CircularProgress
} from '@mui/material';
import { simpleContentAPI } from '../services/simpleContentAPI';

const contentTypes = [
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'document', label: 'Document', icon: '📄' }
];

/**
 * A simplified content form that avoids complex nested objects
 */
const SimpleContentForm = ({ open, onClose, onSuccess, initialData, chapterId, contentType }) => {
  // Simple flat state structure - no nested objects
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    type: initialData?.type || contentType || 'video',
    duration: initialData?.duration || 15
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Content type is required';
    }
    
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
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
      
      console.log('Submitting simple content data:', formData);
      console.log('Chapter ID:', chapterId);
      
      let response;
      
      if (initialData?.id) {
        // Update existing content
        response = await simpleContentAPI.updateContent(
          initialData.id,
          chapterId,
          formData
        );
      } else {
        // Create new content
        response = await simpleContentAPI.createContent(
          chapterId,
          formData
        );
      }
      
      console.log('Content saved successfully:', response.data);
      
      // Call the success callback with the response data
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.response?.data || err.message || 'Failed to save course content');
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
        {initialData?.id ? 'Edit Course Content' : 'Add Course Content'}
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
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal" error={!!errors.type}>
            <InputLabel id="content-type-label">Content Type</InputLabel>
            <Select
              labelId="content-type-label"
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Content Type"
            >
              {contentTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ mr: 1 }}>{type.icon}</Typography>
                    <Typography>{type.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
          </FormControl>
          
          <TextField
            fullWidth
            label="Duration (minutes)"
            name="duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
            error={!!errors.duration}
            helperText={errors.duration}
            margin="normal"
            inputProps={{ min: 1 }}
          />
          
          <TextField
            fullWidth
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
            placeholder={
              formData.type === 'video' 
                ? 'Enter video URL or embed code' 
                : formData.type === 'document'
                ? 'Enter text content or document URL'
                : formData.type === 'assignment'
                ? 'Enter assignment instructions'
                : 'Enter quiz questions'
            }
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
          startIcon={submitting ? <CircularProgress size={20} /> : null}
        >
          {submitting ? 'Saving...' : initialData?.id ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleContentForm;
