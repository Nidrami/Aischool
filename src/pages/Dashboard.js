import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  School,
  Assignment,
  People,
  VideoCall,
  Notifications,
  ExitToApp,
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    activeCourses: 0,
    pendingAssignments: 0,
    upcomingSessions: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Set up axios default headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/auth/me');
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login');
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const menuItems = {
    STUDENT: [
      { text: 'My Courses', icon: <School />, path: '/courses' },
      { text: 'Assignments', icon: <Assignment />, path: '/assignments' },
      { text: 'Live Sessions', icon: <VideoCall />, path: '/live-sessions' },
    ],
    TEACHER: [
      { text: 'My Classes', icon: <School />, path: '/classes' },
      { text: 'Students', icon: <People />, path: '/students' },
      { text: 'Assignments', icon: <Assignment />, path: '/assignments' },
      { text: 'Live Sessions', icon: <VideoCall />, path: '/live-sessions' },
    ],
    ADMIN: [
      { text: 'Users', icon: <People />, path: '/users' },
      { text: 'Courses', icon: <School />, path: '/courses' },
      { text: 'Reports', icon: <Assignment />, path: '/reports' },
    ],
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const role = userData?.role || 'STUDENT';

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SmartLearn Dashboard
          </Typography>
          <IconButton color="inherit">
            <Notifications />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {menuItems[role]?.map((item) => (
              <ListItem button key={item.text} onClick={() => handleNavigation(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h5" gutterBottom>
                  Welcome back, {userData?.firstName || 'User'}!
                </Typography>
              </Paper>
            </Grid>

            {/* Quick Stats */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Active Courses
                  </Typography>
                  <Typography variant="h3">{stats.activeCourses}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Assignments
                  </Typography>
                  <Typography variant="h3">{stats.pendingAssignments}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Upcoming Sessions
                  </Typography>
                  <Typography variant="h3">{stats.upcomingSessions}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
