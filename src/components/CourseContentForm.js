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
  Alert
} from '@mui/material';

const contentTypes = [
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'document', label: 'Document', icon: '📄' },
  { value: 'assignment', label: 'Assignment', icon: '📝' },
  { value: 'quiz', label: 'Quiz', icon: '❓' }
];

const CourseContentForm = ({ open, onClose, onSubmit, initialData, chapterId, contentType }) => {
  // Form data initialization with proper structure
  const [formData, setFormData] = useState(() => {
    // If we have initialData, use it
    if (initialData) {
      return {
        ...initialData,
        chapter: initialData.chapter || (initialData.chapterId ? { id: Number(initialData.chapterId) } : null),
        course: initialData.course || (initialData.courseId ? { id: Number(initialData.courseId) } : null)
      };
    }
    // Otherwise create new form data
    return {
      title: '',
      content: '',
      type: contentType || 'video',
      duration: 15,
      chapter: chapterId ? { id: Number(chapterId) } : null,
      // Course will be set by the backend based on chapter
    };
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
      
      // Prepare data for submission with proper structure
      const dataToSubmit = {
        ...formData,
        // Ensure chapter is properly formatted as an object with id
        chapter: formData.chapter || (chapterId ? { id: Number(chapterId) } : null)
      };
      
      // Validate chapter information
      if (!dataToSubmit.chapter || !dataToSubmit.chapter.id) {
        setError('Chapter information is missing. Please try again or contact support.');
        return;
      }
      
      // Convert any string IDs to numbers
      if (dataToSubmit.chapter && dataToSubmit.chapter.id) {
        dataToSubmit.chapter.id = Number(dataToSubmit.chapter.id);
      }
      
      if (dataToSubmit.course && dataToSubmit.course.id) {
        dataToSubmit.course.id = Number(dataToSubmit.course.id);
      }
      
      // Make sure duration is a number
      if (dataToSubmit.duration) {
        dataToSubmit.duration = Number(dataToSubmit.duration);
      }
      
      // Log the data being submitted for debugging
      console.log('Submitting content data:', dataToSubmit);
      
      await onSubmit(dataToSubmit);
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
        {initialData ? 'Edit Course Content' : 'Add Course Content'}
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
            value={formData.content || ''}
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
        >
          {submitting ? 'Saving...' : initialData ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseContentForm;
