import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  TextField,
  CircularProgress, 
  List, 
  ListItem,
  Card,
  CardContent,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import simpleExamAPI from '../services/simpleExamAPI';
import { useAuth } from '../contexts/AuthContext';

const ExamSubmissionPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await simpleExamAPI.getExamById(examId);
        setExam(response.data);
        
        // Initialize answers object with empty strings for each question
        const initialAnswers = {};
        response.data.questions.forEach((question, index) => {
          initialAnswers[index] = '';
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error('Error fetching exam details:', err);
        setError('Failed to load exam details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExamDetails();
    }
  }, [examId]);

  const handleAnswerChange = (index, value) => {
    setAnswers({
      ...answers,
      [index]: value
    });
  };

  const handleGoBack = () => {
    navigate('/exams');
  };

  const handleSubmit = async () => {
    // Check if all questions have been answered
    const unansweredQuestions = Object.values(answers).filter(answer => answer.trim() === '').length;
    
    if (unansweredQuestions > 0) {
      setNotification({
        open: true,
        message: `You have ${unansweredQuestions} unanswered question(s). Are you sure you want to submit?`,
        severity: 'warning'
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Convert answers object to array in correct order
      const answersArray = exam.questions.map((_, index) => answers[index] || '');
      
      // Prepare submission data
      const submissionData = {
        examId: exam.id,
        studentId: user.id,
        answers: answersArray
      };

      // Call the API to submit the exam
      await simpleExamAPI.submitExam(submissionData);
      
      setNotification({
        open: true,
        message: 'Exam submitted successfully!',
        severity: 'success'
      });
      
      // Redirect back to exams page after successful submission
      setTimeout(() => {
        navigate('/exams');
      }, 1500);
    } catch (err) {
      console.error('Error submitting exam:', err);
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to submit exam',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !exam) {
    return (
      <Container maxWidth="md">
        <Box mt={4} mb={4}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack}
            sx={{ mb: 2 }}
          >
            Back to Exams
          </Button>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography>{error || 'Exam not found.'}</Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box mt={4} mb={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack}
          >
            Back to Exams
          </Button>
        </Box>
        
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Typography variant="h4" gutterBottom>{exam.name}</Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Subject: {exam.subject}
            </Typography>
            {exam.createdByName && (
              <Typography variant="subtitle2" color="text.secondary">
                Created by: {exam.createdByName}
              </Typography>
            )}
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Please read each question carefully and provide your answers in the text fields below.
          </Alert>
        </Paper>
        
        <Typography variant="h5" gutterBottom>Your Answers</Typography>
        
        {exam.questions && exam.questions.length > 0 ? (
          <List>
            {exam.questions.map((question, index) => (
              <Card key={index} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Question {index + 1}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {question}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TextField
                    label="Your Answer"
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    value={answers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            ))}
          </List>
        ) : (
          <Typography variant="body1">No questions available for this exam.</Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<SendIcon />}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </Button>
        </Box>
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

export default ExamSubmissionPage;
