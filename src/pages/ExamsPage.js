import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Button, Snackbar, Alert, CircularProgress, Grid, Tabs, Tab, Divider, Chip, List, ListItem, ListItemText } from '@mui/material';
import simpleExamAPI from '../services/simpleExamAPI';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExamForm from '../components/ExamForm';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import GradingIcon from '@mui/icons-material/Grading';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// TabPanel component for the tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`exam-tabpanel-${index}`}
      aria-labelledby={`exam-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Create a separate SubmissionsList component
const SubmissionsList = ({ examId, onViewSubmission }) => {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Function to fetch submissions
  const loadSubmissions = async () => {
    if (!isExpanded) return;
    
    try {
      setIsLoading(true);
      setError('');
      const response = await simpleExamAPI.getExamSubmissions(examId);
      setSubmissions(response.data || []);
      
      if (response.data && response.data.length === 0) {
        setSuccessMessage('No submissions found for this exam yet.');
      }
    } catch (error) {
      console.error(`Error fetching submissions for exam ${examId}:`, error);
      setSuccessMessage('Unable to load submissions right now. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load submissions when expanded
  useEffect(() => {
    if (isExpanded) {
      loadSubmissions();
    }
  }, [isExpanded, examId]);
  
  // Toggle submissions list visibility
  const toggleSubmissions = () => {
    setIsExpanded(prev => !prev);
  };
  
  return (
    <Box sx={{ mt: 2 }}>
      <Button
        onClick={toggleSubmissions}
        variant="outlined"
        color="info"
        size="small"
        startIcon={isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        sx={{ mb: 2 }}
      >
        {isExpanded ? 'Hide Submissions' : 'Show Student Submissions'}
      </Button>
      
      {isExpanded && (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            borderRadius: '8px', 
            bgcolor: '#f8f9fa', 
            border: '1px solid #e0e0e0' 
          }}
        >
          <Typography variant="subtitle1" fontWeight="500" gutterBottom>
            Student Submissions
          </Typography>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : successMessage ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
              {successMessage}
            </Typography>
          ) : submissions.length > 0 ? (
            <List dense>
              {submissions.map((submission) => (
                <Paper
                  key={submission.id}
                  elevation={0}
                  sx={{ 
                    mb: 1.5, 
                    p: 1, 
                    bgcolor: 'white', 
                    border: '1px solid #eeeeee',
                    borderRadius: '6px',
                    borderLeft: submission.score !== null ? '4px solid #4caf50' : '1px solid #eeeeee'
                  }}
                >
                  <ListItem
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {submission.score !== null ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            sx={{ mr: 1, borderRadius: '6px' }}
                            onClick={() => onViewSubmission(submission.id)}
                          >
                            Graded ({submission.score}%)
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => onViewSubmission(submission.id)}
                            startIcon={<GradingIcon />}
                            sx={{ borderRadius: '6px' }}
                          >
                            Grade
                          </Button>
                        )}
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight="500">
                          {submission.studentFirstName || ''} {submission.studentLastName || ''}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          Submitted: {new Date(submission.submittedAt).toLocaleString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              py: 3,
              px: 2
            }}>
              <Typography variant="body1" color="text.secondary" align="center">
                No submissions found for this exam.
              </Typography>
              <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 1 }}>
                When students complete this exam, their submissions will appear here.
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

const ExamsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openForm, setOpenForm] = useState(false);
  const [exams, setExams] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submissionsError, setSubmissionsError] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchExams();
    
    // If user is a student, also fetch their submissions
    if (user && (user.role === 'STUDENT' || user.role === 'ROLE_STUDENT')) {
      fetchMySubmissions();
    }
  }, [user]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      
      // Check user role to determine which API endpoint to use
      if (user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN')) {
        if (typeof simpleExamAPI.getAllExamsForAdmin === 'function') {
          response = await simpleExamAPI.getAllExamsForAdmin();
        } else {
          // Fallback to regular exams if admin-specific function is not available
          console.warn('getAllExamsForAdmin is not available, falling back to getAllExams');
          response = await simpleExamAPI.getAllExams();
        }
      } else if (user && (user.role === 'TEACHER' || user.role === 'ROLE_TEACHER')) {
        if (typeof simpleExamAPI.getMyExams === 'function') {
          response = await simpleExamAPI.getMyExams();
        } else if (typeof simpleExamAPI.getTeacherExams === 'function') {
          // Fallback to getTeacherExams if getMyExams doesn't exist
          response = await simpleExamAPI.getTeacherExams();
        } else {
          // Last resort fallback
          console.warn('Teacher-specific exam functions are not available, falling back to getAllExams');
          response = await simpleExamAPI.getAllExams();
        }
      } else {
        response = await simpleExamAPI.getAllExams();
      }
      
      // Ensure we have a valid response with data
      if (response && response.data) {
        setExams(Array.isArray(response.data) ? response.data : []);
      } else {
        console.error('Invalid response format:', response);
        setExams([]);
        setError('Received invalid data format from server.');
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
      setExams([]);
      setError('Failed to load exams. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMySubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      setSubmissionsError('');
      
      let response;
      
      // Check which function is available
      if (typeof simpleExamAPI.getStudentSubmissions === 'function') {
        response = await simpleExamAPI.getStudentSubmissions();
      } else {
        console.warn('getStudentSubmissions function not found, attempting fallback');
        // Check for other potential function names that might do the same thing
        if (typeof simpleExamAPI.getMySubmissions === 'function') {
          response = await simpleExamAPI.getMySubmissions();
        } else {
          throw new Error('No suitable API function found for fetching student submissions');
        }
      }
      
      // Ensure we have a valid response with data
      if (response && response.data) {
        setMySubmissions(Array.isArray(response.data) ? response.data : []);
      } else {
        console.error('Invalid response format for submissions:', response);
        setMySubmissions([]);
        setSubmissionsError('Received invalid data format from server.');
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setMySubmissions([]);
      setSubmissionsError('Failed to load your exam submissions. Please try again later.');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleOpenForm = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleExamSubmit = async (examData) => {
    try {
      const response = await simpleExamAPI.createExam(examData);
      setNotification({
        open: true,
        message: 'Exam created successfully!',
        severity: 'success'
      });
      
      // Close the form
      handleCloseForm();
      
      // Refresh the exam list
      fetchExams();
      
      return response;
    } catch (err) {
      setNotification({
        open: true,
        message: `Failed to create exam: ${err.response?.data?.message || err.message}`,
        severity: 'error'
      });
      throw err;
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Add function to show snackbar notifications
  const showSnackbar = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Add this function to handle viewing a submission
  const handleViewSubmission = (submissionId) => {
    navigate(`/submissions/${submissionId}/view`);
  };

  // Teacher/Admin view rendering
  const renderTeacherExamItem = (exam) => {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 2 }} key={exam.id}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6">{exam.name}</Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Subject: {exam.subject}
            </Typography>
            <Typography variant="body2">
              {exam.questions.length} question{exam.questions.length !== 1 ? 's' : ''}
            </Typography>
            {exam.createdByName && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Created by: {exam.createdByName}
              </Typography>
            )}
            
            {/* Add action buttons */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => navigate(`/exams/${exam.id}`)}
                color="info"
              >
                View Exam
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/exams/edit/${exam.id}`)}
                color="primary"
              >
                Edit
              </Button>
            </Box>
          </Box>
        </Box>
        
        {/* Use the SubmissionsList component */}
        {(user.role === 'TEACHER' || user.role === 'ADMIN' || 
          user.role === 'ROLE_TEACHER' || user.role === 'ROLE_ADMIN') && (
          <SubmissionsList 
            examId={exam.id} 
            onViewSubmission={handleViewSubmission} 
          />
        )}
      </Paper>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>Exams</Typography>
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          {/* Tabs for students */}
          {user && (user.role === 'STUDENT' || user.role === 'ROLE_STUDENT') && (
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Available Exams" icon={<AssignmentTurnedInIcon />} iconPosition="start" />
              <Tab label="My Results" icon={<AssessmentIcon />} iconPosition="start" />
            </Tabs>
          )}
          
          {/* Add exam button for teachers and admins */}
          <Box>
            {user && (user.role === 'TEACHER' || user.role === 'ADMIN' || user.role === 'ROLE_TEACHER' || user.role === 'ROLE_ADMIN') && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenForm}
              >
                Add Exam
              </Button>
            )}
          </Box>
        </Box>
        
        {/* Student View - Tabbed Interface */}
        {user && (user.role === 'STUDENT' || user.role === 'ROLE_STUDENT') ? (
          <>
            {/* Available Exams Tab */}
            <TabPanel value={tabValue} index={0}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
                  <Typography variant="body1" color="error" align="center">
                    {error}
                  </Typography>
                </Paper>
              ) : exams.length > 0 ? (
                <Box>
                  {exams.map((exam) => (
                    <Paper elevation={3} sx={{ p: 3, mb: 2 }} key={exam.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="h6">{exam.name}</Typography>
                          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            Subject: {exam.subject}
                          </Typography>
                          <Typography variant="body2">
                            {exam.questions.length} question{exam.questions.length !== 1 ? 's' : ''}
                          </Typography>
                          {exam.createdByName && (
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                              Created by: {exam.createdByName}
                            </Typography>
                          )}
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => navigate(`/exams/${exam.id}/submit`)}
                          color="primary"
                        >
                          Take Exam
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
                  <Typography variant="body1" align="center">
                    No exams available.
                  </Typography>
                </Paper>
              )}
            </TabPanel>
            
            {/* My Results Tab */}
            <TabPanel value={tabValue} index={1}>
              {submissionsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                  <CircularProgress />
                </Box>
              ) : submissionsError ? (
                <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
                  <Typography variant="body1" color="error" align="center">
                    {submissionsError}
                  </Typography>
                </Paper>
              ) : mySubmissions && mySubmissions.length > 0 ? (
                <Box>
                  {mySubmissions.map((submission) => (
                    <Paper elevation={3} sx={{ p: 3, mb: 2 }} key={submission.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="h6">{submission.exam?.name || 'Unnamed Exam'}</Typography>
                          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            Submitted on: {new Date(submission.submittedAt).toLocaleString()}
                          </Typography>
                          
                          {submission.score !== null ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                              <Typography variant="body2" fontWeight="medium">
                                Score: {submission.score}%
                              </Typography>
                              <Chip 
                                size="small"
                                label={submission.score >= 60 ? "PASSED" : "FAILED"} 
                                color={submission.score >= 60 ? "success" : "error"}
                                variant="outlined"
                              />
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Status: Awaiting Grading
                            </Typography>
                          )}
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AssessmentIcon />}
                          onClick={() => navigate(`/submissions/${submission.id}/result`)}
                          color="primary"
                        >
                          View Results
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
                  <Typography variant="body1" align="center">
                    You haven't submitted any exams yet.
                  </Typography>
                </Paper>
              )}
            </TabPanel>
          </>
        ) : (
          /* Non-student view (for teachers/admins) */
          <Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
                <Typography variant="body1" color="error" align="center">
                  {error}
                </Typography>
              </Paper>
            ) : exams.length > 0 ? (
              <Box>
                {exams.map((exam) => (
                  renderTeacherExamItem(exam))
                )}
              </Box>
            ) : (
              <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
                <Typography variant="body1" align="center">
                  No exams available.
                </Typography>
              </Paper>
            )}
          </Box>
        )}
        
        <ExamForm 
          open={openForm} 
          onClose={handleCloseForm} 
          onSubmit={handleExamSubmit} 
        />
        
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
      </Box>
    </Container>
  );
};

export default ExamsPage;