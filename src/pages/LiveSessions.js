import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Grid, Paper, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { format } from 'date-fns';
import { liveSessionAPI } from '../services/api';
import LiveSessionForm from '../components/LiveSessionForm';

const LiveSessions = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await liveSessionAPI.getCourseSessions(courseId);
      setSessions(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching live sessions:', err);
      setError('Failed to load live sessions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchSessions();
    }
  }, [courseId]);

  const handleCreateSession = () => {
    setCurrentSession(null);
    setOpenForm(true);
  };

  const handleEditSession = (session) => {
    setCurrentSession(session);
    setOpenForm(true);
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await liveSessionAPI.deleteSession(sessionId);
        fetchSessions();
      } catch (err) {
        console.error('Error deleting session:', err);
        setError('Failed to delete session. Please try again later.');
      }
    }
  };

  const handleFormSubmit = async (sessionData) => {
    try {
      if (currentSession) {
        await liveSessionAPI.updateSession(currentSession.id, sessionData);
      } else {
        await liveSessionAPI.createSession(courseId, sessionData);
      }
      setOpenForm(false);
      fetchSessions();
    } catch (err) {
      console.error('Error saving session:', err);
      setError('Failed to save session. Please try again later.');
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Live Sessions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateSession}
        >
          Create New Session
        </Button>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#fff3f3' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {loading ? (
        <Typography>Loading sessions...</Typography>
      ) : sessions.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No live sessions found for this course</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Create your first live session to connect with students in real-time.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {sessions.map((session) => (
            <Grid item xs={12} key={session.id}>
              <Paper sx={{ p: 3, position: 'relative' }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6">{session.title}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {format(new Date(session.scheduledStart), 'MMM dd, yyyy • h:mm a')} - 
                      {format(new Date(session.scheduledEnd), ' h:mm a')}
                    </Typography>
                    {getSessionStatusChip(session)}
                    {session.description && (
                      <Typography variant="body1" sx={{ mt: 2 }}>
                        {session.description}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    {isOngoing(session) && (
                      <Button 
                        variant="contained" 
                        color="error" 
                        onClick={() => handleJoinSession(session)}
                        sx={{ mr: 1 }}
                      >
                        Join Now
                      </Button>
                    )}
                    <Button 
                      variant="outlined" 
                      onClick={() => handleEditSession(session)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
                {session.meetingId && (
                  <Box mt={2}>
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

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentSession ? 'Edit Live Session' : 'Create Live Session'}
        </DialogTitle>
        <DialogContent>
          <LiveSessionForm 
            initialData={currentSession} 
            onSubmit={handleFormSubmit} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LiveSessions;
