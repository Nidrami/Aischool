import React from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Button,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import TeacherApplications from '../components/TeacherApplications';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const DashboardCard = ({ title, icon, count, buttonText, onClick, color = 'primary' }) => (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box display="flex" alignItems="center" mb={2}>
        {icon}
        <Typography variant="h6" component="h2" ml={1}>
          {title}
        </Typography>
      </Box>
      {count !== undefined && (
        <Typography variant="h3" component="p" gutterBottom>
          {count}
        </Typography>
      )}
      <Button
        variant="contained"
        color={color}
        fullWidth
        onClick={onClick}
      >
        {buttonText}
      </Button>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <DashboardCard
            title="Courses"
            icon={<SchoolIcon color="primary" fontSize="large" />}
            buttonText="Manage Courses"
            onClick={() => navigate('/courses')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardCard
            title="Assignments"
            icon={<AssignmentIcon color="primary" fontSize="large" />}
            buttonText="Manage Assignments"
            onClick={() => navigate('/assignments')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardCard
            title="Users"
            icon={<GroupIcon color="primary" fontSize="large" />}
            buttonText="Manage Users"
            onClick={() => navigate('/users')}
          />
        </Grid>
      </Grid>

      <Box mb={4}>
        <Typography variant="h5" component="h2" gutterBottom>
          Teacher Applications
        </Typography>
        <Paper sx={{ p: 3 }}>
          <TeacherApplications />
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
