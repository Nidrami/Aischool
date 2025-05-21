import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider,
  Link
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { teacherApplicationAPI, userAPI } from '../../services/api';

const TeacherApplicationsAdmin = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [confirmApproveDialogOpen, setConfirmApproveDialogOpen] = useState(false);

  // Fetch all applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Get all applications
      const appResponse = await teacherApplicationAPI.getAllApplications();
      
      // Get all users to map to applications
      const usersResponse = await userAPI.getAllUsers();
      const users = usersResponse.data;
      
      // Map user details to applications
      const enhancedApplications = appResponse.data.map(app => {
        // In the API response, app.user is just the user ID due to @JsonIdentityReference(alwaysAsId = true)
        // So we need to treat app.user as the userId
        const userId = typeof app.user === 'object' ? app.user.id : app.user;
        
        if (userId) {
          // Find the full user details from all users list
          const fullUserData = users.find(user => user.id === userId);
          if (fullUserData) {
            return {
              ...app,
              user: fullUserData // Use the complete user data from users list
            };
          }
        }
        return app;
      });
      
      console.log('Enhanced applications:', enhancedApplications);
      setApplications(enhancedApplications);
    } catch (err) {
      setError('Failed to load teacher applications. Please try again.');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const handleOpenRejectDialog = (application) => {
    setSelectedApplication(application);
    setRejectDialogOpen(true);
  };

  const handleOpenApproveDialog = (application) => {
    setSelectedApplication(application);
    setConfirmApproveDialogOpen(true);
  };

  const handleApproveApplication = async () => {
    try {
      setLoading(true);
      await teacherApplicationAPI.approveApplication(selectedApplication.id);
      setSuccess(`Application for ${selectedApplication.user.email} approved successfully!`);
      fetchApplications(); // Refresh the list
      setConfirmApproveDialogOpen(false);
    } catch (err) {
      setError(`Failed to approve application: ${err.response?.data || err.message}`);
      console.error('Error approving application:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectApplication = async () => {
    try {
      setLoading(true);
      await teacherApplicationAPI.rejectApplication(selectedApplication.id, { reason: rejectReason });
      setSuccess(`Application for ${selectedApplication.user.email} rejected.`);
      fetchApplications(); // Refresh the list
      setRejectDialogOpen(false);
      setRejectReason('');
    } catch (err) {
      setError(`Failed to reject application: ${err.response?.data || err.message}`);
      console.error('Error rejecting application:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'PENDING':
        return <Chip label="Pending Review" color="warning" />;
      case 'APPROVED':
        return <Chip label="Approved" color="success" />;
      case 'REJECTED':
        return <Chip label="Rejected" color="error" />;
      default:
        return <Chip label={status} />;
    }
  };

  // Helper function to handle name display that works with any user data structure
  const getUserName = (user) => {
    if (!user) return 'N/A';
    
    // Using fields from User entity - these match the ones shown in the Users page
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    
    // If name field exists
    if (user.name) return user.name;
    
    // If email exists, extract a name from it as a last resort
    if (user.email) {
      return user.email.split('@')[0]
        .replace(/[0-9]/g, '') // Remove numbers
        .split(/[._-]/) // Split by common separators
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize
        .join(' ');
    }
    
    return 'Unknown';
  };

  if (loading && applications.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Teacher Applications Management
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Specialization</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date Submitted</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No teacher applications found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell>{app.id}</TableCell>
                    <TableCell>
                      {app.user && typeof app.user === 'object' && (app.user.firstName || app.user.lastName) ? 
                        `${app.user.firstName || ''} ${app.user.lastName || ''}` : 'N/A'}
                    </TableCell>
                    <TableCell>{app.user?.email}</TableCell>
                    <TableCell>{app.specialization || 'Not specified'}</TableCell>
                    <TableCell>
                      {new Date(app.createdAt).toLocaleDateString()} {new Date(app.createdAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>{getStatusChip(app.status)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          startIcon={<ViewIcon />}
                          onClick={() => handleViewApplication(app)}
                        >
                          View
                        </Button>
                        
                        {app.status === 'PENDING' && (
                          <>
                            <Button 
                              variant="contained" 
                              color="success" 
                              size="small" 
                              startIcon={<ApproveIcon />}
                              onClick={() => handleOpenApproveDialog(app)}
                            >
                              Approve
                            </Button>
                            
                            <Button 
                              variant="contained" 
                              color="error" 
                              size="small" 
                              startIcon={<RejectIcon />}
                              onClick={() => handleOpenRejectDialog(app)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Application Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Application Details
          <Typography variant="subtitle1" color="text.secondary">
            {selectedApplication?.user?.email}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedApplication && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Applicant Information</Typography>
                    <Typography><strong>Name:</strong> {
                      selectedApplication.user && typeof selectedApplication.user === 'object' && 
                      (selectedApplication.user.firstName || selectedApplication.user.lastName) ? 
                        `${selectedApplication.user.firstName || ''} ${selectedApplication.user.lastName || ''}` : 'N/A'
                    }</Typography>
                    <Typography><strong>Email:</strong> {selectedApplication.user?.email}</Typography>
                    <Typography><strong>Status:</strong> {getStatusChip(selectedApplication.status)}</Typography>
                    <Typography><strong>Applied:</strong> {new Date(selectedApplication.createdAt).toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Professional Details</Typography>
                    <Typography><strong>Specialization:</strong> {selectedApplication.specialization || 'Not specified'}</Typography>
                    {selectedApplication.resumeUrl && (
                      <Typography>
                        <strong>Resume/CV:</strong>{' '}
                        <Link href={selectedApplication.resumeUrl} target="_blank" rel="noopener noreferrer">
                          View Resume
                        </Link>
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Experience & Background</Typography>
                    {selectedApplication.experience ? (
                      <Typography sx={{ whiteSpace: 'pre-line' }}>
                        {selectedApplication.experience}
                      </Typography>
                    ) : (
                      <Typography color="text.secondary">No experience details provided</Typography>
                    )}
                    
                    {selectedApplication.education && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography><strong>Education:</strong> {selectedApplication.education}</Typography>
                      </>
                    )}
                    
                    {selectedApplication.subjects && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography><strong>Subjects:</strong> {selectedApplication.subjects}</Typography>
                      </>
                    )}
                    
                    {selectedApplication.about && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography><strong>About:</strong> {selectedApplication.about}</Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedApplication?.status === 'PENDING' && (
            <>
              <Button 
                onClick={() => handleOpenApproveDialog(selectedApplication)}
                color="success" 
                variant="contained"
                startIcon={<ApproveIcon />}
              >
                Approve
              </Button>
              <Button 
                onClick={() => handleOpenRejectDialog(selectedApplication)}
                color="error" 
                variant="contained"
                startIcon={<RejectIcon />}
              >
                Reject
              </Button>
            </>
          )}
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Approve Dialog */}
      <Dialog
        open={confirmApproveDialogOpen}
        onClose={() => setConfirmApproveDialogOpen(false)}
      >
        <DialogTitle>Approve Application</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve this application? This will grant the user teacher privileges.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmApproveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleApproveApplication}
            color="success" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
      >
        <DialogTitle>Reject Application</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for rejecting this application:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Rejection Reason"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRejectApplication}
            color="error" 
            variant="contained"
            disabled={loading || !rejectReason.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherApplicationsAdmin;
