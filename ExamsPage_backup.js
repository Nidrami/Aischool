import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Button, Snackbar, Alert, CircularProgress, Grid, Tabs, Tab, Divider, Chip } from '@mui/material';
import simpleExamAPI from '../services/simpleExamAPI';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExamForm from '../components/ExamForm';

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
        response = await simpleExamAPI.getAllExamsForAdmin();
      } else if (user && (user.role === 'TEACHER' || user.role === 'ROLE_TEACHER')) {
        response = await simpleExamAPI.getMyExams();
      } else {
        response = await simpleExamAPI.getAllExams();
      }
      
      setExams(response.data);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('Failed to load exams. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMySubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      setSubmissionsError('');
      
      const response = await simpleExamAPI.getMySubmissions();
      setMySubmissions(response.data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
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
                      onClick={() => navigate(user && (user.role === 'STUDENT' || user.role === 'ROLE_STUDENT') 
                        ? `/exams/${exam.id}/submit` 
                        : `/exams/${exam.id}`)}
                      color={user && (user.role === 'STUDENT' || user.role === 'ROLE_STUDENT') ? "primary" : "info"}
                    >
                      {user && (user.role === 'STUDENT' || user.role === 'ROLE_STUDENT') ? 'Take Exam' : 'View'}
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
        
        {/* My Results Tab - Only for Students */}
        {user && (user.role === 'STUDENT' || user.role === 'ROLE_STUDENT') && (
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
            ) : mySubmissions.length > 0 ? (
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
        )}
        
        {/* Non-student view (for teachers/admins) */}
        {user && (user.role !== 'STUDENT' && user.role !== 'ROLE_STUDENT') && (
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
                        onClick={() => navigate(`/exams/${exam.id}`)}
                        color="info"
                      >
                        View
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
        message: err.response?.data?.message || 'Failed to create exam',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
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
                      onClick={() => navigate(user && (user.role === 'STUDENT' || user.role === 'ROLE_STUDENT') 
                        ? `/exams/${exam.id}/submit` 
                        : `/exams/${exam.id}`)}
                      color={user && (user.role === 'STUDENT' || user.role === 'ROLE_STUDENT') ? "primary" : "info"}
                    >
                      {user && (user.role === 'STUDENT' || user.role === 'ROLE_STUDENT') ? 'Take Exam' : 'View'}
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
        
        {/* My Results Tab - Only for Students */}
        {user && (user.role === 'STUDENT' || user.role === 'ROLE_STUDENT') && (
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
            ) : mySubmissions.length > 0 ? (
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
        )}
        
        {/* Non-student view (for teachers/admins) */}
        {user && (user.role !== 'STUDENT' && user.role !== 'ROLE_STUDENT') && (
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
                        onClick={() => navigate(`/exams/${exam.id}`)}
                        color="info"
                      >
                        View
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
                <Typography variant="body1" align="center">
                  No exams available.
        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
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
      </Box>
    </Container>
  );
};

export default ExamsPage;
