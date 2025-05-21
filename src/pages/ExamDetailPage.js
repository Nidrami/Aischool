import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ButtonGroup
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import simpleExamAPI from '../services/simpleExamAPI';
import { useAuth } from '../contexts/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ExamDetailPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Check if user is admin or teacher
  const isAdminOrTeacher = user && (
    user.role === 'ADMIN' || 
    user.role === 'TEACHER' || 
    user.role === 'ROLE_ADMIN' || 
    user.role === 'ROLE_TEACHER'
  );
  
  // Check if user is the creator of the exam or an admin
  const canModify = exam && user && (
    user.role === 'ADMIN' || 
    user.role === 'ROLE_ADMIN' ||
    (exam.createdById && user.id === exam.createdById)
  );

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await simpleExamAPI.getExamById(examId);
        setExam(response.data);
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

  const handleGoBack = () => {
    navigate('/exams');
  };
  
  const handleEdit = () => {
    console.log('Navigating to edit page for exam ID:', examId);
    // Navigate to the edit page with the correct path
    navigate(`/exams/edit/${examId}`);
  };
  
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await simpleExamAPI.deleteExam(examId);
      setDeleteDialogOpen(false);
      navigate('/exams', { 
        state: { 
          notification: {
            message: 'Exam deleted successfully',
            severity: 'success'
          }
        }
      });
    } catch (error) {
      console.error('Error deleting exam:', error);
      setError('Failed to delete exam. Please try again.');
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box mt={4}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack}
            sx={{ mb: 2 }}
          >
            Back to Exams
          </Button>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (!exam) {
    return (
      <Container maxWidth="md">
        <Box mt={4}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack}
            sx={{ mb: 2 }}
          >
            Back to Exams
          </Button>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography>Exam not found.</Typography>
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
          
          {/* Show edit/delete buttons only for admin or teacher */}
          {isAdminOrTeacher && (
            <ButtonGroup variant="outlined">
              <Button 
                startIcon={<EditIcon />} 
                onClick={handleEdit}
                color="primary"
                disabled={!canModify}
              >
                Edit
              </Button>
              <Button 
                startIcon={<DeleteIcon />} 
                onClick={handleDeleteClick}
                color="error"
                disabled={!canModify}
              >
                Delete
              </Button>
            </ButtonGroup>
          )}
        </Box>
        
        <Paper elevation={3} sx={{ p: 4 }}>
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
            {exam.createdAt && (
              <Typography variant="body2" color="text.secondary">
                Created on: {new Date(exam.createdAt).toLocaleDateString()}
              </Typography>
            )}
          </Box>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Questions
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {exam.questions && exam.questions.length > 0 ? (
            <List>
              {exam.questions.map((question, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={`Question ${index + 1}`}
                      secondary={question}
                    />
                  </ListItem>
                  {index < exam.questions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body1">No questions available for this exam.</Typography>
          )}
        </Paper>
        
        {/* Delete confirmation dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Delete Exam</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this exam? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ExamDetailPage;
