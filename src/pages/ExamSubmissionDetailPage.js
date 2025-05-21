import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  CircularProgress,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Card,
  CardContent,
  Slider,
  InputAdornment,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GradingIcon from '@mui/icons-material/Grading';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';

const ExamSubmissionDetailPage = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchSubmissionData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Direct API call to avoid any middleware issues
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/simple-exams/submissions/view/${submissionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Submission data:', response.data);
        setSubmission(response.data);
        
        // Initialize feedback and score if already graded
        if (response.data.instructorFeedback) {
          setFeedback(response.data.instructorFeedback);
        }
        if (response.data.score !== null) {
          setScore(response.data.score);
        }
      } catch (err) {
        console.error('Error fetching submission data:', err);
        setError('Failed to load submission details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (submissionId) {
      fetchSubmissionData();
    }
  }, [submissionId]);

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleScoreChange = (event, newValue) => {
    setScore(newValue);
  };

  const handleScoreInputChange = (event) => {
    const value = event.target.value === '' ? 0 : Number(event.target.value);
    setScore(Math.min(100, Math.max(0, value)));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const gradeData = {
        score: score,
        feedback: feedback
      };
      
      // Direct API call to avoid any middleware issues
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/simple-exams/submissions/${submissionId}/grade`, gradeData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setNotification({
        open: true,
        message: 'Submission graded successfully!',
        severity: 'success'
      });
      
      // Update the submission in state to reflect the new grade
      setSubmission({
        ...submission,
        score: score,
        instructorFeedback: feedback,
        gradedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error grading submission:', err);
      setNotification({
        open: true,
        message: 'Failed to grade submission: ' + (err.response?.data || err.message),
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !submission) {
    return (
      <Container maxWidth="md">
        <Box mt={4} mb={4}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography color="error">{error || 'Submission not found'}</Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mt={4} mb={4}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
          sx={{ mb: 3 }}
        >
          Back
        </Button>
        
        {/* Submission Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <GradingIcon fontSize="large" sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h4">
              {submission.exam?.name || 'Unnamed Exam'}
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            Submitted by: {submission.student?.firstName} {submission.student?.lastName}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Submitted on: {new Date(submission.submittedAt).toLocaleString()}
          </Typography>
          
          {submission.gradedAt && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body2" color="success.main">
                Graded on: {new Date(submission.gradedAt).toLocaleString()}
              </Typography>
            </Box>
          )}
        </Paper>
        
        {/* Student Answers Section */}
        <Typography variant="h5" gutterBottom>Student Answers</Typography>

        {submission.answers && submission.answers.length > 0 ? (
          <List sx={{ mb: 4 }}>
            {submission.answers.map((answer, index) => (
              <Card key={index} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Question {index + 1}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {submission.exam?.questions && submission.exam.questions[index] ? 
                      submission.exam.questions[index] : 
                      `Question ${index + 1}`}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Student's Answer:
                    </Typography>
                    <Typography variant="body1">
                      {answer ? answer : <em>No answer provided</em>}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </List>
        ) : (
          <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: 'warning.light' }}>
            <Typography>No student answers found for this submission.</Typography>
          </Paper>
        )}
        
        {/* Grading Section */}
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom>Grade Submission</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography id="score-slider" gutterBottom>
                Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Slider
                  value={score}
                  onChange={handleScoreChange}
                  aria-labelledby="score-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  min={0}
                  max={100}
                  sx={{ mr: 2, flexGrow: 1 }}
                />
                <TextField
                  value={score}
                  onChange={handleScoreInputChange}
                  variant="outlined"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: {
                      min: 0,
                      max: 100,
                      type: 'number',
                      'aria-labelledby': 'score-slider',
                    },
                  }}
                  sx={{ width: '100px' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Feedback to Student"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={feedback}
                onChange={handleFeedbackChange}
                helperText="Provide specific, constructive feedback to help the student understand their performance"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                onClick={handleSubmit}
                sx={{ mt: 2 }}
              >
                {isSubmitting ? 'Saving...' : 'Save Grade'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ExamSubmissionDetailPage;
