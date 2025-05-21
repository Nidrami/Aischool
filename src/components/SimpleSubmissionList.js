import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Grade as GradeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import simpleSubmissionService from '../services/simpleSubmissionService';

const SimpleSubmissionList = ({ assignmentId, assignmentTitle }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [gradeData, setGradeData] = useState({ score: '', feedback: '' });
  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeError, setGradeError] = useState('');

  const loadSubmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await simpleSubmissionService.getAssignmentSubmissions(assignmentId);
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      setError('Failed to load submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      loadSubmissions();
    }
  }, [assignmentId]);

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setIsViewDialogOpen(true);
  };

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      score: submission.score || '',
      feedback: submission.feedback || ''
    });
    setIsGradeDialogOpen(true);
  };

  const handleGradeInputChange = (e) => {
    const { name, value } = e.target;
    setGradeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitGrade = async () => {
    if (!selectedSubmission) return;
    
    setGradeLoading(true);
    setGradeError('');
    
    try {
      const score = parseInt(gradeData.score, 10);
      
      if (isNaN(score) || score < 0 || score > selectedSubmission.maxScore) {
        setGradeError(`Score must be a number between 0 and ${selectedSubmission.maxScore}`);
        setGradeLoading(false);
        return;
      }
      
      await simpleSubmissionService.gradeSubmission(
        selectedSubmission.id,
        score,
        gradeData.feedback
      );
      
      setIsGradeDialogOpen(false);
      loadSubmissions();
    } catch (error) {
      console.error('Error grading submission:', error);
      setGradeError('Failed to save grade. Please try again.');
    } finally {
      setGradeLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Submissions for: {assignmentTitle}
        </Typography>
        
        <IconButton onClick={loadSubmissions}>
          <RefreshIcon />
        </IconButton>
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
      ) : submissions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No submissions have been received yet.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Submitted At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Score</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>{submission.studentName}</TableCell>
                  <TableCell>
                    {format(new Date(submission.submittedAt), 'PPp')}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={submission.graded ? 'Graded' : 'Pending'} 
                      color={submission.graded ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {submission.graded 
                      ? `${submission.score} / ${submission.maxScore}` 
                      : 'Not graded'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewSubmission(submission)}
                      sx={{ mr: 1 }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleGradeSubmission(submission)}
                      color="primary"
                    >
                      <GradeIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* View Submission Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Submission from {selectedSubmission?.studentName}
        </DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Submitted on {format(new Date(selectedSubmission.submittedAt), 'PPp')}
                      </Typography>
                      
                      <Typography variant="h6" gutterBottom>
                        Student Answer
                      </Typography>
                      <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                        {selectedSubmission.content || 'No content provided.'}
                      </Typography>
                      
                      {selectedSubmission.attachmentUrl && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Attachment:
                          </Typography>
                          <Button 
                            variant="outlined" 
                            size="small"
                            href={selectedSubmission.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Attachment
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {selectedSubmission.graded && (
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Grade & Feedback
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', mr: 1 }}>
                            {selectedSubmission.score}
                          </Typography>
                          <Typography variant="body1">
                            / {selectedSubmission.maxScore} points
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" gutterBottom>
                          Feedback:
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {selectedSubmission.feedback || 'No feedback provided.'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          <Button 
            onClick={() => {
              setIsViewDialogOpen(false);
              handleGradeSubmission(selectedSubmission);
            }}
            color="primary"
            variant="contained"
          >
            {selectedSubmission?.graded ? 'Edit Grade' : 'Grade Submission'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Grade Submission Dialog */}
      <Dialog
        open={isGradeDialogOpen}
        onClose={() => setIsGradeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Grade Submission - {selectedSubmission?.studentName}
        </DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <Box sx={{ pt: 1 }}>
              {gradeError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {gradeError}
                </Alert>
              )}
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label={`Score (out of ${selectedSubmission.maxScore})`}
                    name="score"
                    value={gradeData.score}
                    onChange={handleGradeInputChange}
                    InputProps={{ inputProps: { min: 0, max: selectedSubmission.maxScore } }}
                    disabled={gradeLoading}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Feedback"
                    name="feedback"
                    value={gradeData.feedback}
                    onChange={handleGradeInputChange}
                    disabled={gradeLoading}
                    placeholder="Provide feedback to the student about their submission"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsGradeDialogOpen(false)}
            disabled={gradeLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitGrade}
            color="primary"
            variant="contained"
            disabled={gradeLoading}
            startIcon={gradeLoading && <CircularProgress size={20} />}
          >
            Save Grade
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SimpleSubmissionList;
