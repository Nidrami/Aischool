import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Chip, 
  Button,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { liveSessionAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import LiveSessionForm from '../components/LiveSessionForm';

const LiveSessionsOverview = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER';
  const canManageSessions = isAdmin || isTeacher;

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await liveSessionAPI.getAllSessions();
        setSessions(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching live sessions:', err);
        setError('Failed to load live sessions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateSession = () => {
    setSelectedSession(null);
    setOpenForm(true);
  };

  const handleEditSession = (session) => {
    setSelectedSession(session);
    setOpenForm(true);
  };

  const handleDeleteSession = async (session) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await liveSessionAPI.deleteSession(session.id);
        setSnackbar({
          open: true,
          message: 'Session deleted successfully',
          severity: 'success'
        });
        const fetchSessions = async () => {
          try {
            setLoading(true);
            const response = await liveSessionAPI.getAllSessions();
            setSessions(response.data);
            setError(null);
          } catch (err) {
            console.error('Error fetching live sessions:', err);
            setError('Failed to load live sessions. Please try again later.');
          } finally {
            setLoading(false);
          }
        };
        fetchSessions();
      } catch (err) {
        console.error('Error deleting session:', err);
        setSnackbar({
          open: true,
          message: 'Failed to delete session',
          severity: 'error'
        });
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedSession) {
        await liveSessionAPI.updateSession(selectedSession.id, formData);
        setSnackbar({
          open: true,
          message: 'Session updated successfully',
          severity: 'success'
        });
      } else {
        await liveSessionAPI.createSession(formData.courseId, formData);
        setSnackbar({
          open: true,
          message: 'Session created successfully',
          severity: 'success'
        });
      }
      setOpenForm(false);
      const fetchSessions = async () => {
        try {
          setLoading(true);
          const response = await liveSessionAPI.getAllSessions();
          setSessions(response.data);
          setError(null);
        } catch (err) {
          console.error('Error fetching live sessions:', err);
          setError('Failed to load live sessions. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      fetchSessions();
    } catch (err) {
      console.error('Error saving session:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save session',
        severity: 'error'
      });
    }
  };

  const handleJoinSession = (session) => {
    window.open(session.meetingUrl, '_blank');
  };

  const isUpcoming = (session) => {
    return new Date(session.scheduledStart) > new Date();
  };

  const isOngoing = (session) => {
    const now = new Date();
    return new Date(session.scheduledStart) <= now && new Date(session.scheduledEnd) >= now;
  };

  const isPast = (session) => {
    return new Date(session.scheduledEnd) < new Date();
  };

  const getSessionStatusChip = (session) => {
    if (isOngoing(session)) {
      return <Chip label="Live Now" color="error" />;
    } else if (isUpcoming(session)) {
      return <Chip label="Upcoming" color="primary" />;
    } else {
      return <Chip label="Completed" color="default" />;
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (tabValue === 0) return true; // All sessions
    if (tabValue === 1) return isOngoing(session); // Live now
    if (tabValue === 2) return isUpcoming(session); // Upcoming
    if (tabValue === 3) return isPast(session); // Past
    return true;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Live Sessions
        </Typography>
        {canManageSessions && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateSession}
          >
            Create Session
          </Button>
        )}
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="live sessions tabs">
          <Tab label="All Sessions" />
          <Tab label="Live Now" />
          <Tab label="Upcoming" />
          <Tab label="Past" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading sessions...</Typography>
      ) : filteredSessions.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No live sessions found</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {canManageSessions 
              ? 'Click the Create Session button to schedule a new session.'
              : 'Check back later for upcoming sessions.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredSessions.map((session) => (
            <Grid item xs={12} key={session.id}>
              <Paper sx={{ p: 3, position: 'relative' }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Typography variant="h6">{session.title}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {format(new Date(session.scheduledStart), 'MMM dd, yyyy • h:mm a')} - 
                      {format(new Date(session.scheduledEnd), ' h:mm a')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      {getSessionStatusChip(session)}
                      <Chip 
                        label={`Course: ${session.course.title}`} 
                        variant="outlined" 
                      />
                    </Box>
                    {session.description && (
                      <Typography variant="body1" sx={{ mt: 2 }}>
                        {session.description}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    {isOngoing(session) && (
                      <Button 
                        variant="contained" 
                        color="error"
                        onClick={() => handleJoinSession(session)}
                      >
                        Join Now
                      </Button>
                    )}
                    {canManageSessions && (
                      <>
                        <IconButton 
                          color="primary"
                          onClick={() => handleEditSession(session)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error"
                          onClick={() => handleDeleteSession(session)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>
                {session.meetingId && (
                  <Box mt={2}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      <strong>Meeting ID:</strong> {session.meetingId}
                    </Typography>
                    {session.meetingPassword && (
                      <Typography variant="body2">
                        <strong>Password:</strong> {session.meetingPassword}
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedSession ? 'Edit Live Session' : 'Create Live Session'}
        </DialogTitle>
        <DialogContent>
          <LiveSessionForm
            initialData={selectedSession}
            onSubmit={handleFormSubmit}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LiveSessionsOverview;
