import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const TeacherDashboard = () => {
  return (
    <Box sx={{ backgroundColor: '#F5F5F7', minHeight: '100vh', py: 3 }}>
      <Container>
        <Typography variant="h4" gutterBottom sx={{ color: '#7C4DFF' }}>
          Teacher Dashboard
        </Typography>
        {/* Teacher dashboard content will be implemented later */}
      </Container>
    </Box>
  );
};

export default TeacherDashboard;
