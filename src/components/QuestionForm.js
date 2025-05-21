import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControlLabel,
  Checkbox,
  Divider,
  Paper,
  Grid,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Switch,
  Tooltip
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Info as InfoIcon } from '@mui/icons-material';

const QuestionForm = ({ initialQuestion, onSave, onCancel }) => {
  const [question, setQuestion] = useState(
    initialQuestion || {
      text: '',
      correctAnswer: '', // Teacher provides the correct answer text manually
      questionType: 'MULTIPLE_CHOICE',
      options: [
        { text: '' },
        { text: '' },
        { text: '' }
      ],
      expectedAnswerText: '',
      caseSensitive: false,
      keywordsRequired: '',
      minValue: null,
      maxValue: null,
      exactValue: null
    }
  );

  const [errors, setErrors] = useState({});

  const handleQuestionTextChange = (e) => {
    setQuestion({
      ...question,
      text: e.target.value
    });
    if (errors.text) {
      setErrors({ ...errors, text: null });
    }
  };
  
  const handleCorrectAnswerChange = (e) => {
    setQuestion({
      ...question,
      correctAnswer: e.target.value
    });
  };
  
  const handleQuestionTypeChange = (e) => {
    setQuestion({
      ...question,
      questionType: e.target.value
    });
  };
  
  const handleTextAnswerChange = (e) => {
    setQuestion({
      ...question,
      expectedAnswerText: e.target.value
    });
  };
  
  const handleCaseSensitiveChange = (e) => {
    setQuestion({
      ...question,
      caseSensitive: e.target.checked
    });
  };
  
  const handleKeywordsChange = (e) => {
    setQuestion({
      ...question,
      keywordsRequired: e.target.value
    });
  };
  
  const handleNumericValueChange = (field, value) => {
    setQuestion({
      ...question,
      [field]: value === '' ? null : parseFloat(value)
    });
  };

  const handleOptionTextChange = (index, value) => {
    const updatedOptions = [...question.options];
    updatedOptions[index] = { ...updatedOptions[index], text: value };
    setQuestion({
      ...question,
      options: updatedOptions
    });
  };
  
  // Removed handleOptionCorrectChange as we no longer use checkboxes for correct answers
  // Teachers now provide the correct answer text directly

  const addOption = () => {
    setQuestion({
      ...question,
      options: [...question.options, { 
        text: ''
      }]
    });
  };

  const removeOption = (index) => {
    if (question.options.length <= 2) {
      setErrors({
        ...errors,
        options: 'A question must have at least 2 options'
      });
      return;
    }
    const updatedOptions = [...question.options];
    updatedOptions.splice(index, 1);
    setQuestion({
      ...question,
      options: updatedOptions
    });
    setErrors({ ...errors, options: null });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!question.text.trim()) {
      newErrors.text = 'Question text is required';
    }

    if (!question.correctAnswer || !question.correctAnswer.trim()) {
      newErrors.correctAnswer = 'Correct answer is required';
    }

    if (question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'MULTIPLE_SELECT') {
      // Validate options for multiple choice questions
      question.options.forEach((option, index) => {
        if (!option.text.trim()) {
          newErrors[`option-${index}`] = 'Option text is required';
        }
      });

      // No longer require marking correct options - teachers provide correct answer text manually
    } else if (question.questionType === 'TEXT_EXACT' || question.questionType === 'TEXT_KEYWORDS') {
      // Validate text-based answers
      if (question.questionType === 'TEXT_EXACT' && !question.expectedAnswerText.trim()) {
        newErrors.expectedAnswerText = 'Expected answer text is required for exact text matching';
      }
      
      if (question.questionType === 'TEXT_KEYWORDS' && !question.keywordsRequired.trim()) {
        newErrors.keywordsRequired = 'At least one keyword is required for keyword-based matching';
      }
    } else if (question.questionType === 'NUMERICAL') {
      // Validate numerical-based answers
      if (question.exactValue === null && (question.minValue === null || question.maxValue === null)) {
        newErrors.numericalValues = 'Either exact value or range (min/max) must be specified';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    // Prevent the default form submission to avoid page navigation
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Question form submitted');
    
    if (validateForm()) {
      console.log('Question form validated, saving question:', question);
      // Call the onSave callback with the question data
      onSave(question);
      return false; // Prevent any further form submission
    } else {
      console.log('Question form validation failed. Errors:', errors);
      return false;
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {initialQuestion ? 'Edit Question' : 'Add New Question'}
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Important:</strong> You must provide a correct answer that will be shown to students after submission.
      </Alert>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Question Text"
            value={question.text}
            onChange={handleQuestionTextChange}
            error={!!errors.text}
            helperText={errors.text || ''}
            multiline
            rows={2}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Correct Answer"
            value={question.correctAnswer}
            onChange={handleCorrectAnswerChange}
            error={!!errors.correctAnswer}
            helperText={errors.correctAnswer || 'Provide the correct answer that will be shown to students after submission'}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="question-type-label">Question Type</InputLabel>
            <Select
              labelId="question-type-label"
              id="questionType"
              value={question.questionType}
              onChange={handleQuestionTypeChange}
            >
              <MenuItem value="MULTIPLE_CHOICE">Multiple Choice (Single Answer)</MenuItem>
              <MenuItem value="MULTIPLE_SELECT">Multiple Select (Multiple Answers)</MenuItem>
              <MenuItem value="TEXT_EXACT">Text Input (Exact Match)</MenuItem>
              <MenuItem value="TEXT_KEYWORDS">Text Input (Keyword Match)</MenuItem>
              <MenuItem value="NUMERICAL">Numerical Input</MenuItem>
              <MenuItem value="TRUE_FALSE">True/False</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Option-based question types */}
      {(question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'MULTIPLE_SELECT') && (
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Answer Options
          </Typography>
          
          {errors.correctOption && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.correctOption}
            </Alert>
          )}
          
          {question.options.map((option, index) => (
            <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={10}>
                <TextField
                  fullWidth
                  label={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(e) => handleOptionTextChange(index, e.target.value)}
                  size="small"
                  error={!!errors[`option-${index}`]}
                  helperText={errors[`option-${index}`] || ''}
                  required
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton 
                  onClick={() => removeOption(index)} 
                  color="error"
                  disabled={question.options.length <= 2}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          
          <Button 
            startIcon={<AddIcon />} 
            onClick={addOption} 
            variant="outlined" 
            size="small" 
            sx={{ mt: 1 }}
          >
            Add Option
          </Button>
        </Box>
      )}
      
      {/* Type-specific form fields */}
      {(question.questionType === 'TEXT_EXACT' || question.questionType === 'TEXT_KEYWORDS') && (
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Text Answer Configuration
          </Typography>
          
          {question.questionType === 'TEXT_EXACT' && (
            <>
              <TextField
                fullWidth
                label="Expected Answer"
                value={question.expectedAnswerText}
                onChange={handleTextAnswerChange}
                margin="normal"
                error={!!errors.expectedAnswerText}
                helperText={errors.expectedAnswerText || 'The exact text answer that will be considered correct'}
                required
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={question.caseSensitive}
                    onChange={handleCaseSensitiveChange}
                  />
                }
                label="Case Sensitive"
              />
            </>
          )}
          
          {question.questionType === 'TEXT_KEYWORDS' && (
            <TextField
              fullWidth
              label="Required Keywords"
              value={question.keywordsRequired}
              onChange={handleKeywordsChange}
              margin="normal"
              error={!!errors.keywordsRequired}
              helperText={errors.keywordsRequired || 'Comma-separated keywords that must appear in the answer'}
              required
            />
          )}
        </Box>
      )}
      
      {question.questionType === 'NUMERICAL' && (
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Numerical Answer Configuration
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Exact Value"
                type="number"
                value={question.exactValue !== null ? question.exactValue : ''}
                onChange={(e) => handleNumericValueChange('exactValue', e.target.value)}
                margin="normal"
                helperText="Exact answer value"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Min Value"
                type="number"
                value={question.minValue !== null ? question.minValue : ''}
                onChange={(e) => handleNumericValueChange('minValue', e.target.value)}
                margin="normal"
                helperText="Minimum acceptable value"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Max Value"
                type="number"
                value={question.maxValue !== null ? question.maxValue : ''}
                onChange={(e) => handleNumericValueChange('maxValue', e.target.value)}
                margin="normal"
                helperText="Maximum acceptable value"
              />
            </Grid>
          </Grid>
          
          {errors.numericalValues && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.numericalValues}
            </Alert>
          )}
        </Box>
      )}
      
      {question.questionType === 'TRUE_FALSE' && (
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            True/False Answer
          </Typography>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={question.correctAnswer === 'true'}
                onChange={(e) => setQuestion({
                  ...question,
                  correctAnswer: e.target.checked ? 'true' : 'false'
                })}
              />
            }
            label="Correct answer is TRUE"
          />
        </Box>
      )}
        
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          {initialQuestion ? 'Update Question' : 'Add Question'}
        </Button>
      </Box>
    </Paper>
  );
};

export default QuestionForm;
