import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Paper,
  Alert,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import SimpleAssignmentCard from './SimpleAssignmentCard';
import SimpleAssignmentForm from './SimpleAssignmentForm';
import SimpleSubmissionForm from './SimpleSubmissionForm';
import simpleAssignmentService from '../services/simpleAssignmentService';

const SimpleAssignmentList = ({ courseId, showActions = true, onAssignmentUpdated }) => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const isTeacher = user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';

  const loadAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (courseId) {
        data = await simpleAssignmentService.getCourseAssignments(courseId);
      } else if (isTeacher) {
        data = await simpleAssignmentService.getTeacherAssignments();
      } else if (isStudent) {
        data = await simpleAssignmentService.getStudentAssignments();
      }
      setAssignments(data || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
      setError('Failed to load assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [courseId, user]);

  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (assignment) => {
    setSelectedAssignment({ id: assignment.id, title: assignment.title });
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmitDialogOpen(true);
  };

  const handleViewSubmissions = (assignment) => {
    if (onAssignmentUpdated) {
      onAssignmentUpdated(assignment);
    }
  };

  const handleCreateAssignment = () => {
    setIsCreateDialogOpen(true);
  };

  const handleSaveAssignment = async (formData) => {
    try {
      if (formData.id) {
        await simpleAssignmentService.updateAssignment(formData.id, formData);
      } else {
        await simpleAssignmentService.createAssignment(formData);
      }
      
      setIsEditDialogOpen(false);
      setIsCreateDialogOpen(false);
      loadAssignments();
    } catch (error) {
      console.error('Error saving assignment:', error);
      throw error; // Let the form handle the error
    }
  };

  const confirmDelete = async () => {
    if (!selectedAssignment) return;
    
    try {
      await simpleAssignmentService.deleteAssignment(selectedAssignment.id);
      setIsDeleteDialogOpen(false);
      loadAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setError('Failed to delete assignment. Please try again.');
    }
  };

  const handleSubmitAssignment = async (submissionData) => {
    try {
      await simpleAssignmentService.submitAssignment(submissionData);
      setIsSubmitDialogOpen(false);
      loadAssignments();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw error; // Let the form handle the error
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Assignments
        </Typography>
        
        <Box>
          <IconButton onClick={loadAssignments} sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
          
          {(isTeacher || isAdmin) && showActions && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateAssignment}
            >
              New Assignment
            </Button>
          )}
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </Box>
      ) : assignments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No assignments found.
          </Typography>
          {isTeacher && (
            <Button
              variant="outlined"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleCreateAssignment}
            >
              Create Your First Assignment
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {assignments.map((assignment) => (
            <Grid item xs={12} sm={6} md={4} key={assignment.id}>
              <SimpleAssignmentCard
                assignment={assignment}
                onEdit={showActions ? handleEdit : null}
                onDelete={showActions ? handleDelete : null}
                onSubmit={showActions ? handleSubmit : null}
                onViewSubmissions={showActions ? handleViewSubmissions : null}
              />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Edit Assignment Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <SimpleAssignmentForm
            initialData={selectedAssignment}
            onSubmit={handleSaveAssignment}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Create Assignment Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <SimpleAssignmentForm
            initialData={courseId ? { courseId } : null}
            onSubmit={handleSaveAssignment}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the assignment "{selectedAssignment?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Submit Assignment Dialog */}
      <Dialog
        open={isSubmitDialogOpen}
        onClose={() => setIsSubmitDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <SimpleSubmissionForm
            assignment={selectedAssignment}
            onSubmit={handleSubmitAssignment}
            onCancel={() => setIsSubmitDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SimpleAssignmentList;
