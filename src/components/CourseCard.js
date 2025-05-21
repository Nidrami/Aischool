import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Videocam as VideocamIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const CourseCard = ({ course, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN';

  const handleClick = () => {
    navigate(`/course/${course.id}`);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="140"
        image={course.thumbnailUrl || '/default-course.jpg'}
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PersonIcon sx={{ mr: 1 }} fontSize="small" />
          <Typography variant="body2">
            {course.teacher.firstName} {course.teacher.lastName}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ScheduleIcon sx={{ mr: 1 }} fontSize="small" />
          <Typography variant="body2">
            {course.enrollments?.length || 0} students enrolled
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip label={course.subject} color="primary" size="small" />
          <Box>
            {(isTeacher || isAdmin) && (
              <>
                <IconButton size="small" onClick={() => onEdit(course)} sx={{ mr: 1 }}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(course.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </>
            )}
            <Button
              size="small"
              color="primary"
              onClick={handleClick}
              sx={{ ml: isTeacher || isAdmin ? 2 : 0, mr: 1 }}
            >
              View Details
            </Button>
            <Button
              size="small"
              color="secondary"
              startIcon={<VideocamIcon />}
              onClick={() => navigate(`/course/${course.id}/live-sessions`)}
            >
              Live Sessions
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
