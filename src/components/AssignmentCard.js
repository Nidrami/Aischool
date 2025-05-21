import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon,
  Grade as GradeIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

const AssignmentCard = ({ assignment, onEdit, onDelete, onSubmit, onViewSubmissions }) => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';
  const isPastDue = new Date(assignment.dueDate) < new Date();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AssignmentIcon sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6" component="div">
            {assignment.title}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {assignment.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTimeIcon sx={{ mr: 1 }} fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Due: {format(new Date(assignment.dueDate), 'PPp')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <GradeIcon sx={{ mr: 1 }} fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Max Score: {assignment.maxScore}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip
            label={isPastDue ? 'Past Due' : 'Active'}
            color={isPastDue ? 'error' : 'success'}
            size="small"
          />

          <Box>
            {isTeacher && (
              <>
                <Tooltip title="View Submissions">
                  <IconButton
                    size="small"
                    onClick={() => onViewSubmissions(assignment)}
                    sx={{ mr: 1 }}
                  >
                    <AssignmentIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Assignment">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(assignment)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Assignment">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(assignment.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {isStudent && (
              <Button
                variant="contained"
                size="small"
                onClick={() => onSubmit(assignment)}
                disabled={isPastDue}
              >
                Submit
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AssignmentCard;
