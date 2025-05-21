import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import AssignmentCard from '../components/AssignmentCard';
import AssignmentForm from '../components/AssignmentForm';
import { useAuth } from '../hooks/useAuth';
import { assignmentAPI } from '../services/api';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentAPI.getAllAssignments();
      setAssignments(response.data);
    } catch (error) {
      showAlert('Failed to fetch assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (assignmentData) => {
    try {
      await assignmentAPI.createAssignment(assignmentData);
      fetchAssignments();
      showAlert('Assignment created successfully', 'success');
    } catch (error) {
      showAlert('Failed to create assignment', 'error');
    }
  };

  const handleUpdateAssignment = async (assignmentData) => {
    try {
      await assignmentAPI.updateAssignment(editAssignment.id, assignmentData);
      fetchAssignments();
      showAlert('Assignment updated successfully', 'success');
      setEditAssignment(null);
    } catch (error) {
      showAlert('Failed to update assignment', 'error');
    }
  };

  const handleDeleteAssignment = async () => {
    try {
      await assignmentAPI.deleteAssignment(assignmentToDelete);
      fetchAssignments();
      showAlert('Assignment deleted successfully', 'success');
      handleCloseDeleteDialog();
    } catch (error) {
      showAlert('Failed to delete assignment', 'error');
    }
  };

  const handleSubmitAssignment = async () => {
    try {
      await assignmentAPI.submitAssignment(selectedAssignment.id, {
        content: submissionContent,
      });
      showAlert('Assignment submitted successfully', 'success');
      handleCloseSubmissionDialog();
    } catch (error) {
      showAlert('Failed to submit assignment', 'error');
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleOpenDeleteDialog = (assignmentId) => {
    setAssignmentToDelete(assignmentId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setAssignmentToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleOpenSubmissionDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionDialogOpen(true);
  };

  const handleCloseSubmissionDialog = () => {
    setSelectedAssignment(null);
    setSubmissionContent('');
    setSubmissionDialogOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Assignments
        </Typography>
        {isTeacher && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
          >
            Create Assignment
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {assignments.map((assignment) => (
          <Grid item xs={12} sm={6} md={4} key={assignment.id}>
            <AssignmentCard
              assignment={assignment}
              onEdit={(assignment) => {
                setEditAssignment(assignment);
                setFormOpen(true);
              }}
              onDelete={handleOpenDeleteDialog}
              onSubmit={handleOpenSubmissionDialog}
              onViewSubmissions={() => {/* TODO: Implement view submissions */}}
            />
          </Grid>
        ))}
      </Grid>

      <AssignmentForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditAssignment(null);
        }}
        onSubmit={editAssignment ? handleUpdateAssignment : handleCreateAssignment}
        initialData={editAssignment}
      />

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Assignment</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this assignment? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteAssignment} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={submissionDialogOpen} onClose={handleCloseSubmissionDialog}>
        <DialogTitle>Submit Assignment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Answer"
            value={submissionContent}
            onChange={(e) => setSubmissionContent(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubmissionDialog}>Cancel</Button>
          <Button onClick={handleSubmitAssignment} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

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

export default Assignments;
