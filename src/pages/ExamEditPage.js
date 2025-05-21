import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  IconButton,
  Grid, 
  CircularProgress,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import simpleExamAPI from '../services/simpleExamAPI';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

const ExamEditPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const [examData, setExamData] = useState({
    name: '',
    subject: '',
    questions: ['']
  });

  // Check if user is admin or teacher
  const isAdminOrTeacher = user && (
    user.role === 'ADMIN' || 
    user.role === 'TEACHER' || 
    user.role === 'ROLE_ADMIN' || 
    user.role === 'ROLE_TEACHER'
  );

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await simpleExamAPI.getExamById(examId);
        const exam = response.data;
        
        // Check if user has permission to edit this exam
        if (!isAdminOrTeacher || 
            (user.role !== 'ADMIN' && 
             user.role !== 'ROLE_ADMIN' && 
             exam.createdById !== user.id)) {
          navigate('/exams');
          return;
        }
        
        setExamData({
          id: exam.id,
          name: exam.name,
          subject: exam.subject,
          questions: exam.questions.length > 0 ? exam.questions : ['']
        });
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
  }, [examId, navigate, user, isAdminOrTeacher]);

  const handleGoBack = () => {
    navigate(`/exams/${examId}`);
  };

  const handleNameChange = (e) => {
    setExamData({ ...examData, name: e.target.value });
  };

  const handleSubjectChange = (e) => {
    setExamData({ ...examData, subject: e.target.value });
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...examData.questions];
    newQuestions[index] = value;
    setExamData({ ...examData, questions: newQuestions });
  };

  const handleAddQuestion = () => {
    setExamData({
      ...examData,
      questions: [...examData.questions, '']
    });
  };

  const handleRemoveQuestion = (index) => {
    if (examData.questions.length > 1) {
      const newQuestions = [...examData.questions];
      newQuestions.splice(index, 1);
      setExamData({ ...examData, questions: newQuestions });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!examData.name.trim()) {
      setError('Exam name is required');
      return;
    }
    
    if (!examData.subject.trim()) {
      setError('Subject is required');
      return;
    }
    
    const filteredQuestions = examData.questions.filter(q => q.trim() !== '');
    if (filteredQuestions.length === 0) {
      setError('At least one question is required');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      
      // Create a simplified data structure that matches what the backend expects
      const updatedExamData = {
        // Don't send the ID in the body as it's already in the URL
        name: examData.name.trim(),
        subject: examData.subject.trim(),
        questions: filteredQuestions
      };
      
      console.log('Sending update with data:', JSON.stringify(updatedExamData));
      
      // Make the API call to update the exam
      const response = await simpleExamAPI.updateExam(examId, updatedExamData);
      console.log('Update response:', response);
      
      setNotification({
        open: true,
        message: 'Exam updated successfully!',
        severity: 'success'
      });
      
      // Navigate back to exam details after successful update
      setTimeout(() => {
        navigate(`/exams/${examId}`);
      }, 1500);
    } catch (err) {
      console.error('Error updating exam:', err.response?.data || err.message || err);
      setError(`Failed to update exam: ${err.response?.data?.message || err.message || 'Please try again'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdminOrTeacher) {
    return (
      <Container maxWidth="md">
        <Box mt={4}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography color="error">You don't have permission to edit this exam.</Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }} 
              onClick={() => navigate('/exams')}
            >
              Back to Exams
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box mt={4} mb={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack}
          >
            Back to Exam
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>Edit Exam</Typography>
          <Divider sx={{ mb: 3 }} />
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Exam Name"
                  value={examData.name}
                  onChange={handleNameChange}
                  error={!examData.name.trim()}
                  helperText={!examData.name.trim() ? 'Exam name is required' : ''}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Subject"
                  value={examData.subject}
                  onChange={handleSubjectChange}
                  error={!examData.subject.trim()}
                  helperText={!examData.subject.trim() ? 'Subject is required' : ''}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Questions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {examData.questions.map((question, index) => (
                  <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                    <Grid item xs={10}>
                      <TextField
                        required
                        fullWidth
                        multiline
                        rows={2}
                        label={`Question ${index + 1}`}
                        value={question}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        error={!question.trim() && index === 0}
                        helperText={!question.trim() && index === 0 ? 'At least one question is required' : ''}
                      />
                    </Grid>
                    <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveQuestion(index)}
                        disabled={examData.questions.length <= 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddQuestion}
                  sx={{ mt: 1 }}
                >
                  Add Question
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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

export default ExamEditPage;
