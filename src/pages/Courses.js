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
} from '@mui/material';
import {
  School as SchoolIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon,
  SignalCellularAlt as LevelIcon,
} from '@mui/icons-material';
import axios from 'axios';

const Courses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Available Courses
      </Typography>
      <Grid container spacing={4}>
        {courses.map((course) => (
          <Grid item key={course.id} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={course.thumbnailUrl || 'https://source.unsplash.com/random?education'}
                alt={course.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {course.title}
                </Typography>
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
                  }}
                >
                  {course.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<SchoolIcon />}
                    label={`By ${course.teacher?.firstName} ${course.teacher?.lastName}`}
                    size="small"
                  />
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {formatPrice(course.price)}
                  </Typography>
                  <Button variant="contained" color="primary">
                    Enroll Now
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Courses;
