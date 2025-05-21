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
  Card,
  CardContent,
  Alert,
  Chip,
  Grid,
  Avatar,
  Stack
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import FeedbackIcon from '@mui/icons-material/Feedback';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import simpleExamAPI from '../services/simpleExamAPI';

const ExamSubmissionStudentView = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchSubmissionData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        console.log('Fetching student submission data for ID:', submissionId);
        // Get the submission data using the API service
        const response = await simpleExamAPI.getStudentSubmissionById(submissionId);
        console.log('Student submission data:', response.data);
        setSubmission(response.data);
      } catch (err) {
        console.error('Error fetching submission data:', err);
        let errorMessage = 'Failed to load submission details. Please try again later.';
        
        if (err.response) {
          console.error('Server responded with:', err.response.status, err.response.data);
          errorMessage = typeof err.response.data === 'string' 
            ? err.response.data 
            : 'Server error: ' + (err.response.data.message || 'Unknown error');
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (submissionId) {
      fetchSubmissionData();
    }
  }, [submissionId]);

  const handleGoBack = () => {
    navigate('/exams'); // Go back to exams page
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
            Back to Exams
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
          Back to Exams
        </Button>
        
        {/* Submission Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
              <EmojiEventsIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="500">
                {submission.examName || 'Exam Results'}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Submitted on: {new Date(submission.submittedAt).toLocaleString()}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />

          {/* Display Submission Details */}
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Exam Details
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
                      <Typography variant="body1">{submission.examSubject || 'N/A'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Submitted On</Typography>
                      <Typography variant="body1">{new Date(submission.submittedAt).toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Questions</Typography>
                      <Typography variant="body1">{submission.questions?.length || 0} questions</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
          
        </Paper>
        
        {/* Main Content: Student Answers with Correct Answers */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          
          {/* Answers and Correct Answers Section */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <QuestionAnswerIcon />
                </Avatar>
                <Typography variant="h5">Questions & Answers</Typography>
              </Box>
              
              {submission.questions && submission.answers && 
               submission.questions.length > 0 && submission.answers.length > 0 ? (
                <Box sx={{ maxHeight: '600px', overflow: 'auto' }}>
                  {submission.questions.map((question, index) => (
                    <Card key={index} sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">
                          Question {index + 1}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                          {question}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        {/* Your Answer */}
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            bgcolor: 'rgba(76, 175, 80, 0.08)', 
                            p: 2, 
                            borderRadius: 2, 
                            border: '1px solid rgba(76, 175, 80, 0.2)',
                            mb: 2,
                            borderLeft: '4px solid #4caf50'
                          }}
                        >
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Your Answer:
                          </Typography>
                          <Typography variant="body1">
                            {submission.answers[index] ? submission.answers[index] : <em>No answer provided</em>}
                          </Typography>
                        </Paper>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  {!submission.questions || submission.questions.length === 0 ? 
                    'No questions found for this exam.' : 
                    !submission.answers || submission.answers.length === 0 ?
                    'No answers were submitted for this exam.' :
                    'Error: Mismatch between questions and answers.'}
                </Alert>
              )}
            </Paper>
          </Grid>
          
          {/* Feedback and Grading Section */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <FeedbackIcon />
                </Avatar>
                <Typography variant="h5">Feedback & Score</Typography>
              </Box>
              
              {submission.gradedAt ? (
                <Box>
                  <Alert 
                    icon={<CheckCircleIcon fontSize="inherit" />} 
                    severity="success" 
                    sx={{ mb: 3 }}
                  >
                    This submission has been graded on {new Date(submission.gradedAt).toLocaleString()}
                  </Alert>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" color="primary.main" sx={{ mr: 2 }}>
                      {submission.score}%
                    </Typography>
                    <Chip 
                      label={submission.score >= 60 ? "Passed" : "Failed"} 
                      color={submission.score >= 60 ? "success" : "error"}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Instructor Feedback:
                  </Typography>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      bgcolor: 'rgba(25, 118, 210, 0.05)', 
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid rgba(25, 118, 210, 0.2)'
                    }}
                  >
                    <Typography variant="body1">
                      {submission.instructorFeedback || <em>No feedback provided</em>}
                    </Typography>
                  </Paper>
                </Box>
              ) : (
                <Alert 
                  icon={<CancelIcon fontSize="inherit" />}
                  severity="info"
                  sx={{ mb: 3 }}
                >
                  This submission has not been graded yet. Check back later to see your feedback and score.
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ExamSubmissionStudentView;
