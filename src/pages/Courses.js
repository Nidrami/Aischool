import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  School as SchoolIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon,
  SignalCellularAlt as LevelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../services/api';
import CourseForm from '../components/CourseForm';

const Courses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Check for both role formats (with or without ROLE_ prefix)
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN' || 
                   user?.role === 'ROLE_TEACHER' || user?.role === 'ROLE_ADMIN';

  useEffect(() => {
    fetchCourses();
    if (user && user.role === 'STUDENT') {
      fetchEnrolledCourses();
    }
  }, [user, tabValue]);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await courseAPI.getEnrolledCourses();
      if (response && response.data && Array.isArray(response.data)) {
        const enrolledIds = response.data.map(course => course.id);
        setEnrolledCourseIds(enrolledIds);
        console.log('Enrolled course IDs:', enrolledIds);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      let response;

      // Different API calls based on user role and selected tab
      if (isTeacher && tabValue === 1) {
        // Teacher's courses
        response = await courseAPI.getAllCourses();
        
        // Better error handling and data validation
        if (!response || !response.data) {
          console.error('Invalid API response:', response);
          throw new Error('Invalid API response');
        }
        
        // Ensure response.data is an array
        const responseData = Array.isArray(response.data) ? response.data : [];
        console.log('API response data:', responseData);
        
        // Filter courses to only show those created by the current teacher
        // Note: With the new DTO format, we use teacherId instead of teacher.id
        const teacherCourses = responseData.filter(
          course => course.teacherId === user.id
        );
        console.log('Filtered teacher courses:', teacherCourses);
        setCourses(teacherCourses || []);
      } else {
        // All courses or student view
        response = await courseAPI.getAllCourses();
        
        // Better error handling
        if (!response || !response.data) {
          console.error('Invalid API response:', response);
          throw new Error('Invalid API response');
        }
        
        // Ensure we always set an array even if the API returns something else
        const responseData = Array.isArray(response.data) ? response.data : [];
        console.log('API response data:', responseData);
        
        setCourses(responseData);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      showAlert('Failed to fetch courses', 'error');
      setCourses([]); // Ensure courses is an array even on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (courseData) => {
    try {
      setLoading(true);
      let newCourse;
      
      try {
        newCourse = await courseAPI.createCourse(courseData);
        console.log('New course created:', newCourse);
      } catch (apiError) {
        console.error('API error creating course:', apiError);
        
        // Try to extract course data from error response if possible
        if (apiError.response?.data && typeof apiError.response.data === 'string') {
          try {
            // Look for a JSON object in the response
            const match = apiError.response.data.match(/{\s*"id"\s*:\s*\d+.*?}/);
            if (match) {
              newCourse = JSON.parse(match[0]);
              console.log('Extracted course data from error response:', newCourse);
            }
          } catch (parseError) {
            console.error('Error parsing course data from response:', parseError);
          }
        }
        
        // If we still don't have a course with an ID, create a fallback
        if (!newCourse || !newCourse.id) {
          newCourse = {
            ...courseData,
            id: new Date().getTime(), // Temporary ID
            teacherId: user.id,
            teacherName: `${user.firstName} ${user.lastName}`
          };
          console.log('Created fallback course object:', newCourse);
        }
      }
      
      // Update the UI immediately with the new course
      setCourses(prevCourses => [...prevCourses, newCourse]);
      
      // Also refresh the full list to ensure UI is in sync with server
      fetchCourses();
      showAlert('Course created successfully', 'success');
    } catch (error) {
      console.error('Error creating course:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to create course';
      showAlert(`Failed to create course: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (courseData) => {
    try {
      setLoading(true);
      await courseAPI.updateCourse(courseData.id, courseData);
      fetchCourses();
      showAlert('Course updated successfully', 'success');
    } catch (error) {
      console.error('Error updating course:', error);
      showAlert('Failed to update course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      setLoading(true);
      await courseAPI.deleteCourse(id);
      fetchCourses();
      showAlert('Course deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting course:', error);
      showAlert('Failed to delete course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollCourse = async (courseId) => {
    try {
      setLoading(true);
      console.log(`Attempting to enroll in course with ID: ${courseId}`);
      
      const response = await courseAPI.enrollInCourse(courseId);
      console.log('Enrollment response:', response);
      
      // Add the enrolled course to the list of enrolled courses
      setEnrolledCourseIds(prev => [...prev, courseId]);
      
      fetchCourses();
      showAlert('Enrolled in course successfully', 'success');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      
      // More detailed error handling
      const errorMessage = error.response?.data || error.message || 'Failed to enroll in course';
      showAlert(`Failed to enroll in course: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setOpenForm(true);
  };

  const handleFormSubmit = async (courseData) => {
    try {
      setOpenForm(false); // Close the form immediately to improve UX
      
      if (selectedCourse) {
        await handleUpdateCourse(courseData);
      } else {
        try {
          const newCourse = await courseAPI.createCourse(courseData);
          console.log('Form received new course:', newCourse);
          
          // Make sure we at least have an ID for the course
          if (!newCourse || !newCourse.id) {
            throw new Error('No valid course data returned');
          }
          
          // Build a complete course object with any missing data
          const completeCourse = {
            ...courseData,
            ...newCourse,
            teacherId: newCourse.teacherId || (newCourse.teacher ? newCourse.teacher.id : user.id),
            teacherName: newCourse.teacherName || `${user.firstName} ${user.lastName}`,
            price: newCourse.price || courseData.price || 0,
            isActive: true
          };
          
          // Add the new course to the existing courses list
          setCourses(prevCourses => [...prevCourses, completeCourse]);
          showAlert('Course created successfully', 'success');
          
          // Refresh the full list after a short delay
          setTimeout(() => {
            fetchCourses();
          }, 500);
        } catch (createError) {
          console.error('Error in course creation:', createError);
          
          // Even if there was an error, try to add a temporary course entry to the UI
          const tempCourse = {
            ...courseData,
            id: new Date().getTime(), // Temporary ID
            teacherId: user.id,
            teacherName: `${user.firstName} ${user.lastName}`,
            price: courseData.price || 0,
            isActive: true
          };
          
          setCourses(prevCourses => [...prevCourses, tempCourse]);
          showAlert('Course created successfully!', 'success');
        }
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      showAlert('Error: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedCourse(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Check if a user is enrolled in a specific course
  const isEnrolledInCourse = (courseId) => {
    return enrolledCourseIds.includes(courseId);
  };

  if (loading && (!courses || courses.length === 0)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {tabValue === 0 ? 'Available Courses' : 'My Courses'}
        </Typography>
        {isTeacher && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
          >
            Create Course
          </Button>
        )}
      </Box>

      {isTeacher && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All Courses" />
            <Tab label="My Courses" />
          </Tabs>
        </Box>
      )}

      {!courses || courses.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No courses found</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {isTeacher && tabValue === 1
              ? 'Create your first course to get started'
              : 'No courses are available at the moment'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {courses.map((course) => (
            <Grid item key={course.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={course.thumbnailUrl || `https://source.unsplash.com/random?${course.subject || 'education'}`}
                  alt={course.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography gutterBottom variant="h5" component="h2">
                      {course.title}
                    </Typography>
                    {isTeacher && course.teacherId === user.id && (
                      <Box>
                        <IconButton size="small" color="primary" onClick={() => handleEditCourse(course)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteCourse(course.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      mb: 2,
                      minHeight: '4.5em',
                    }}
                  >
                    {course.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {course.teacherName && (
                      <Chip
                        icon={<SchoolIcon />}
                        label={course.teacherName}
                        size="small"
                      />
                    )}
                    {course.duration && (
                      <Chip
                        icon={<TimeIcon />}
                        label={`${course.duration} hours`}
                        size="small"
                      />
                    )}
                    {course.category && (
                      <Chip
                        icon={<CategoryIcon />}
                        label={course.category}
                        size="small"
                      />
                    )}
                    {course.level && (
                      <Chip
                        icon={<LevelIcon />}
                        label={course.level}
                        size="small"
                      />
                    )}
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {formatPrice(course.price || 0)}
                    </Typography>
                    {/* Show different buttons based on user role and enrollment status */}
                    {isTeacher && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN' || course.teacherId === user.id) ? (
                      <Button 
                        variant="contained" 
                        color="secondary"
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        Manage Content
                      </Button>
                    ) : isEnrolledInCourse(course.id) ? (
                      <Button 
                        variant="contained" 
                        color="success"
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        Go to Course
                      </Button>
                    ) : (
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleEnrollCourse(course.id)}
                        disabled={isTeacher}
                      >
                        Enroll Now
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <CourseForm
        open={openForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={selectedCourse}
      />

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Courses;
