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
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  School as SchoolIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon,
  SignalCellularAlt as LevelIcon,
  StopCircle as EmptyIcon,
  PlayCircleOutline as PlayIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { courseAPI } from '../services/api';
import { Link } from 'react-router-dom';

const MyCourses = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchEnrolledCourses();
  }, [user]);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getEnrolledCourses();
      setEnrolledCourses(response.data);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      showAlert('Failed to fetch enrolled courses', 'error');
    } finally {
      setLoading(false);
    }
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
    if (!price) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <SchoolIcon sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h4">My Courses</Typography>
        </Box>
      </Box>

      {enrolledCourses.length === 0 ? (
        <Paper 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            backgroundColor: 'background.paper',
            borderRadius: 2
          }}
        >
          <EmptyIcon sx={{ fontSize: 60, color: 'grey.500', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            You're not enrolled in any courses yet
          </Typography>
          <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 3 }}>
            Browse available courses and enroll to start learning!
          </Typography>
          <Button 
            component={Link} 
            to="/courses" 
            variant="contained" 
            color="primary"
          >
            Browse Courses
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {enrolledCourses.map((course) => (
            <Grid item xs={12} key={course.id}>
              <Card 
                sx={{ 
                  width: '100%',
                  mb: 2,
                  transition: 'box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: 3,
                  }
                }}
              >
                <Box 
                  sx={{
                    display: 'flex',
                    flexDirection: {xs: 'column', sm: 'row'},
                    alignItems: {xs: 'stretch', sm: 'flex-start'}
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{ 
                      width: {xs: '100%', sm: '240px'},
                      height: {xs: '180px', sm: '180px'}, 
                      objectFit: 'cover'
                    }}
                    image={course.thumbnailUrl || `https://source.unsplash.com/random/?${encodeURIComponent(course.category)}`}
                    alt={course.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                        {course.title}
                      </Typography>
                      {course.price > 0 ? (
                        <Chip 
                          label={formatPrice(course.price)} 
                          color="secondary" 
                          variant="filled"
                          size="small"
                        />
                      ) : (
                        <Chip 
                          label="Free" 
                          color="success" 
                          size="small"
                        />
                      )}
                    </Box>

                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ mb: 2 }}
                    >
                      {course.description || 'No description available.'}
                    </Typography>

                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      <Chip 
                        icon={<CategoryIcon />} 
                        label={course.category || 'General'} 
                        size="small" 
                      />
                      <Chip 
                        icon={<LevelIcon />} 
                        label={course.level || 'All levels'} 
                        size="small" 
                      />
                      {course.duration && (
                        <Chip 
                          icon={<TimeIcon />} 
                          label={`${course.duration} hours`} 
                          size="small" 
                        />
                      )}
                    </Box>
                    
                    <Box display="flex" gap={2}>
                      <Button 
                        variant="contained" 
                        color="primary"
                        component={Link}
                        to={`/course/${course.id}`}
                        startIcon={<PlayIcon />}
                      >
                        Continue Learning
                      </Button>
                    </Box>
                  </CardContent>
                </Box>
                
                {/* Progress bar removed as requested */}
                
                {/* Course content section removed */}
                </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity} 
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyCourses;
