import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { courseAPI, teacherApplicationAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeCourses: 0,
    enrolledCourses: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    
    // For TEACHER_PENDING users, immediately redirect to the application form
    // Let TeacherApplicationRoute handle redirecting to the status page if they have already applied
    if (user?.role === 'TEACHER_PENDING') {
      navigate('/teacher/apply');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      let allCourses = [];
      let enrolledCourses = [];
      
      try {
        // Fetch all available courses
        const coursesResponse = await courseAPI.getAllCourses();
        allCourses = coursesResponse.data || [];
        
        // For students, try to fetch enrolled courses
        if (user?.role === 'STUDENT') {
          try {
            const enrolledResponse = await courseAPI.getEnrolledCourses();
            enrolledCourses = enrolledResponse.data || [];
          } catch (enrolledErr) {
            console.log('Note: Could not fetch enrolled courses:', enrolledErr);
            // Non-critical error, continue without enrolled courses data
          }
        }
        
        setStats({
          activeCourses: allCourses.length,
          enrolledCourses: enrolledCourses.length
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        // Set some default stats instead of showing an error
        setStats({
          activeCourses: 0,
          enrolledCourses: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const dashboardItems = [
    {
      title: 'All Courses',
      icon: <SchoolIcon fontSize="large" sx={{ color: '#00843D' }} />,
      count: stats.activeCourses,
      path: '/courses',
      description: 'Browse all available courses',
      roles: ['STUDENT', 'TEACHER', 'ADMIN'],
      color: 'primary',
    },
    {
      title: 'My Courses',
      icon: <SchoolIcon fontSize="large" sx={{ color: '#C1272D' }} />,
      count: stats.enrolledCourses,
      path: '/my-courses',
      description: 'View your enrolled courses',
      roles: ['STUDENT'],
      color: 'secondary',
    },
    {
      title: 'Exercises',
      icon: <AssignmentIcon fontSize="large" sx={{ color: '#00843D' }} />,
      path: '/exercises',
      description: 'Practice with AI-generated exercises',
      roles: ['STUDENT', 'TEACHER', 'ADMIN'],
      color: 'primary',
    },
    {
      title: 'Exams',
      icon: <AssignmentIcon fontSize="large" sx={{ color: '#C1272D' }} />,
      path: '/exams',
      description: 'View and manage exams',
      roles: ['STUDENT', 'TEACHER', 'ADMIN'],
      color: 'secondary',
    },
    {
      title: 'Users',
      icon: <PersonIcon fontSize="large" sx={{ color: '#00843D' }} />,
      path: '/users',
      description: 'Manage system users',
      roles: ['ADMIN'],
      color: 'primary',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderLeft: '4px solid #00843D',
          borderRadius: '4px',
          background: 'linear-gradient(to right, rgba(0, 132, 61, 0.05), transparent 25%)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: '#00843D', fontWeight: 'bold' }}>
              Welcome, {user?.firstName || 'User'}!
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {getWelcomeMessage(user?.role)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* We're no longer showing dashboard loading errors */}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {dashboardItems
            .filter(item => !item.roles || item.roles.includes(user?.role))
            .map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 6px 16px rgba(0, 132, 61, 0.15)'
                    }
                  }}
                >
                  <CardActionArea 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-start',
                      borderTop: item.color === 'primary' ? '3px solid #00843D' : '3px solid #C1272D',
                      '&:hover': {
                        '& .icon-container': {
                          transform: 'scale(1.1)',
                          transition: 'transform 0.3s ease'
                        }
                      }
                    }}
                    onClick={() => navigate(item.path)}
                  >
                    <CardContent sx={{ width: '100%' }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Box className="icon-container" sx={{ transition: 'transform 0.3s ease' }}>
                          {item.icon}
                        </Box>
                        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                          {item.title}
                        </Typography>
                      </Box>
                      
                      {item.count !== undefined && (
                        <>
                          <Typography variant="h3" align="center" sx={{ my: 2, color: item.color === 'primary' ? '#00843D' : '#C1272D' }}>
                            {item.count}
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                        </>
                      )}
                      
                      <Typography variant="body2" color="textSecondary">
                        {item.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}
    </Container>
  );
};

const getWelcomeMessage = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'Access administrative tools and manage the School of Excellence system.';
    case 'TEACHER':
      return 'Manage your courses, assignments, and schedule live sessions for your students at School of Excellence.';
    case 'STUDENT':
      return 'View your enrolled courses, assignments, and upcoming live sessions at School of Excellence.';
    default:
      return 'Welcome to the School of Excellence learning platform.';
  }
};

export default Dashboard;
