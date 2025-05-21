import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Typography,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { teacherApplicationAPI } from '../services/api';

const TeacherApplications = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await teacherApplicationAPI.getAllApplications();
      setApplications(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch applications', 'error');
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedApplication(null);
    setRejectReason('');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleApprove = async (applicationId) => {
    try {
      await teacherApplicationAPI.approveApplication(applicationId);
      showSnackbar('Application approved successfully');
      fetchApplications();
    } catch (error) {
      showSnackbar('Failed to approve application', 'error');
    }
  };

  const handleReject = async (applicationId) => {
    try {
      await teacherApplicationAPI.rejectApplication(applicationId, { reason: rejectReason });
      showSnackbar('Application rejected successfully');
      handleCloseDialog();
      fetchApplications();
    } catch (error) {
      showSnackbar('Failed to reject application', 'error');
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'PENDING':
        return <Chip label="Pending" color="warning" />;
      case 'APPROVED':
        return <Chip label="Approved" color="success" />;
      case 'REJECTED':
        return <Chip label="Rejected" color="error" />;
      default:
        return <Chip label={status} />;
    }
  };

  return (
    <>
      {applications.length === 0 ? (
        <Typography variant="body1" textAlign="center" py={3}>
          No teacher applications found
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.name}</TableCell>
                  <TableCell>{application.email}</TableCell>
                  <TableCell>{application.experience} years</TableCell>
                  <TableCell>{getStatusChip(application.status)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleViewApplication(application)}
                    >
                      <ViewIcon />
                    </IconButton>
                    {application.status === 'PENDING' && (
                      <>
                        <IconButton
                          color="success"
                          onClick={() => handleApprove(application.id)}
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleViewApplication({ ...application, rejecting: true })}
                        >
                          <CloseIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedApplication?.rejecting ? 'Reject Application' : 'Application Details'}
        </DialogTitle>
        <DialogContent>
          {selectedApplication?.rejecting ? (
            <TextField
              fullWidth
              label="Reason for Rejection"
              multiline
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              margin="normal"
              required
            />
          ) : (
            selectedApplication && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Name:</strong> {selectedApplication.name}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Email:</strong> {selectedApplication.email}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Experience:</strong> {selectedApplication.experience} years
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Status:</strong> {selectedApplication.status}
                </Typography>
                {selectedApplication.qualifications && (
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Qualifications:</strong> {selectedApplication.qualifications}
                  </Typography>
                )}
                {selectedApplication.additionalInfo && (
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Additional Information:</strong>
                    <br />
                    {selectedApplication.additionalInfo}
                  </Typography>
                )}
                {selectedApplication.rejectionReason && (
                  <Typography variant="subtitle1" gutterBottom color="error">
                    <strong>Rejection Reason:</strong>
                    <br />
                    {selectedApplication.rejectionReason}
                  </Typography>
                )}
              </Box>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {selectedApplication?.rejecting ? 'Cancel' : 'Close'}
          </Button>
          {selectedApplication?.rejecting && (
            <Button
              onClick={() => handleReject(selectedApplication.id)}
              variant="contained"
              color="error"
              disabled={!rejectReason.trim()}
            >
              Reject Application
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TeacherApplications;
