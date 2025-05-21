import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Paper,
  Grid,
  CircularProgress,
  Divider,
  OutlinedInput,
  ListItemText,
  Checkbox
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { Add as AddIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import courseService from '../services/courseService';
import userService from '../services/userService';

const SimpleAssignmentForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : new Date(),
    questions: initialData?.questions || []
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate) : new Date(),
        questions: initialData.questions || []
      });
    }
  }, [initialData]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };
  
  const handleDateChange = (date) => {
    setFormData(prevData => ({
      ...prevData,
      dueDate: date
    }));
    
    // Clear error when field is modified
    if (errors.dueDate) {
      setErrors({ ...errors, dueDate: null });
    }
  };
  
  const handleStudentChange = (event) => {
    const { value } = event.target;
    const studentIds = Array.isArray(value) ? value : [];
    
    setFormData(prevData => ({
      ...prevData,
      assignedStudentIds: studentIds
    }));
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    // Removed maxScore validation
    
    if (!formData.questions || formData.questions.length === 0) {
      newErrors.questions = 'At least one question is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setFormError('');
    setLoading(true);
    
    if (validate()) {
      try {
        // Format the data for the API
        const formattedData = {
          title: formData.title.trim(),
          description: formData.description ? formData.description.trim() : '',
          dueDate: formData.dueDate instanceof Date ? formData.dueDate.toISOString() : formData.dueDate,
          questions: formData.questions.map((q, index) => ({
            id: q.id,
            questionText: q.questionText,
            correctAnswer: q.correctAnswer || '',
            questionOrder: index + 1
          }))
        };
        
        // If editing, include the ID
        if (initialData && initialData.id) {
          formattedData.id = initialData.id;
        }
        
        await onSubmit(formattedData);
      } catch (error) {
        console.error('Error submitting form:', error);
        setFormError('An error occurred while saving the assignment. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };
  
  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {initialData ? 'Edit Assignment' : 'Create New Assignment'}
      </Typography>
      
      {formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            error={!!errors.title}
            helperText={errors.title}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            error={!!errors.description}
            helperText={errors.description}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Due Date"
              value={formData.dueDate}
              onChange={handleDateChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  error={!!errors.dueDate}
                  helperText={errors.dueDate}
                  disabled={loading}
                />
              )}
              disablePast
            />
          </LocalizationProvider>
        </Grid>
        
        {/* Removed Maximum Score field */}
        
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              const updatedQuestions = [...formData.questions];
              updatedQuestions.push({
                questionText: '',
                correctAnswer: '',
                questionOrder: updatedQuestions.length
              });
              setFormData({ ...formData, questions: updatedQuestions });
            }}
            fullWidth
            sx={{ mt: 1, mb: 3 }}
          >
            Add Question Box
          </Button>
        </Grid>
        
        {formData.questions.map((question, index) => (
          <Grid item xs={12} key={index}>
            <Box sx={{ mb: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Question Box {index + 1}</Typography>
                <Button 
                  size="small" 
                  color="error" 
                  variant="outlined"
                  onClick={() => {
                    const updatedQuestions = [...formData.questions];
                    updatedQuestions.splice(index, 1);
                    setFormData({ ...formData, questions: updatedQuestions });
                  }}
                >
                  Remove
                </Button>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Question Text"
                placeholder="Enter your question here"
                value={question.questionText || ''}
                onChange={(e) => {
                  const updatedQuestions = [...formData.questions];
                  updatedQuestions[index] = { ...updatedQuestions[index], questionText: e.target.value };
                  setFormData({ ...formData, questions: updatedQuestions });
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Correct Answer"
                placeholder="Enter the correct answer that will be shown to students"
                value={question.correctAnswer || ''}
                onChange={(e) => {
                  const updatedQuestions = [...formData.questions];
                  updatedQuestions[index] = { ...updatedQuestions[index], correctAnswer: e.target.value };
                  setFormData({ ...formData, questions: updatedQuestions });
                }}
              />
            </Box>
          </Grid>
        ))}
        
        {errors.questions && (
          <Grid item xs={12}>
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
              {errors.questions}
            </Typography>
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {initialData ? 'Update Assignment' : 'Create Assignment'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SimpleAssignmentForm;
