import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Tab,
  Tabs,
  Paper,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import courseService from '../services/courseService';
import AssignmentList from './AssignmentList';
import AssignmentForm from './AssignmentForm';
import PaymentButton from './wallet/PaymentButton';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await courseService.getCourse(parseInt(id));
          setCourse(data);
          
          // Check if user is already enrolled in this course
          if (user && user.id) {
            try {
              const enrollmentResponse = await courseService.checkEnrollment(parseInt(id));
              setIsEnrolled(enrollmentResponse.data.enrolled);
            } catch (enrollError) {
              console.error('Error checking enrollment:', enrollError);
              setIsEnrolled(false);
            }
          }
        }
      } catch (error) {
        console.error('Error loading course:', error);
        setError('Failed to load course details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id, user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  const handleEnrollmentSuccess = () => {
    setIsEnrolled(true);
    // Optionally redirect to the course content view
    navigate(`/course/${id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!course) {
    return <Typography>Course not found</Typography>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Assignments" />
          <Tab label="Students" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {course.title}
            </Typography>
            
            <Box display="flex" alignItems="center" mb={2}>
              <Chip 
                label={course.isFree ? 'Free' : `$${course.price?.toFixed(2)}`} 
                color={course.isFree ? 'success' : 'primary'}
                variant="outlined"
                sx={{ mr: 2 }}
              />
              <Typography variant="subtitle1" color="text.secondary">
                Teacher: {course.teacherName}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1" paragraph>
              {course.description}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Course Enrollment</Typography>
              
              {isEnrolled ? (
                <>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    You are enrolled in this course
                  </Alert>
                  <Button 
                    variant="contained" 
                    color="primary"
                    fullWidth
                    onClick={() => navigate(`/course/${id}`)}
                  >
                    Go to Course Content
                  </Button>
                </>
              ) : user?.role === 'TEACHER' || user?.role === 'ADMIN' ? (
                <Alert severity="info">
                  As a {user?.role.toLowerCase()}, you can view this course but enrollment is meant for students.
                </Alert>
              ) : course.isFree ? (
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={() => {
                    courseService.enrollInCourse(parseInt(id))
                      .then(() => handleEnrollmentSuccess())
                      .catch(err => {
                        console.error('Error enrolling in course:', err);
                        setError('Failed to enroll in course. Please try again.');
                      });
                  }}
                >
                  Enroll Now (Free)
                </Button>
              ) : (
                <PaymentButton 
                  course={course}
                  onSuccess={handleEnrollmentSuccess}
                  disabled={isEnrolled}
                />
              )}
              
              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>Course Includes:</Typography>
                <Typography variant="body2" color="text.secondary">
                  • {course.chapterCount || 0} chapters
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • {course.contentCount || 0} lessons
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Full lifetime access
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {user?.role === 'TEACHER' && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Create Assignment
            </Button>
          </Box>
        )}
        <AssignmentList
          courseId={parseInt(id)}
          showActions={user?.role === 'TEACHER'}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* TODO: Add StudentList component */}
        <Typography>Student list coming soon...</Typography>
      </TabPanel>

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Assignment</DialogTitle>
        <DialogContent>
          <AssignmentForm
            courseId={parseInt(id)}
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CourseDetails;
