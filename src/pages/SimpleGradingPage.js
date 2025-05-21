import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Grid,
  IconButton
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import simpleAssignmentService from '../services/simpleAssignmentService';
import simpleSubmissionService from '../services/simpleSubmissionService';

const SimpleGradingPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [error, setError] = useState('');
  const [gradeData, setGradeData] = useState({
    score: '',
    feedback: '',
    passed: true
  });
  const [gradeLoading, setGradeLoading] = useState(false);
  
  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (isTeacher) {
        data = await simpleAssignmentService.getTeacherAssignments();
      } else {
        data = await simpleAssignmentService.getStudentAssignments();
      }
      setAssignments(data || []);
      
      // If we have assignments, select the first one by default
      if (data && data.length > 0) {
        setSelectedAssignment(data[0]);
        loadSubmissions(data[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      setError('Failed to load assignments. Please try again.');
      setLoading(false);
    }
  };

  const loadSubmissions = async (assignmentId) => {
    setSubmissionsLoading(true);
    try {
      let data;
      if (isTeacher) {
        data = await simpleSubmissionService.getAssignmentSubmissions(assignmentId);
      } else {
        const submission = await simpleSubmissionService.getStudentAssignmentSubmission(assignmentId);
        data = submission ? [submission] : [];
      }
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      setError('Failed to load submissions. Please try again.');
    } finally {
      setSubmissionsLoading(false);
      setLoading(false);
    }
  };

  const handleAssignmentChange = (assignment) => {
    setSelectedAssignment(assignment);
    loadSubmissions(assignment.id);
  };

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setViewDialogOpen(true);
  };

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      score: submission.score || '',
      feedback: submission.feedback || '',
      passed: submission.passed === null ? true : submission.passed
    });
    setGradeDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGradeData(prev => ({ ...prev, [name]: value }));
  };

  const handlePassedChange = (e) => {
    setGradeData(prev => ({ ...prev, passed: e.target.checked }));
  };

  const handleSubmitGrade = async () => {
    if (!selectedSubmission) return;

    setGradeLoading(true);
    try {
      const score = parseInt(gradeData.score, 10);
      
      if (isNaN(score) || score < 0 || score > selectedSubmission.maxScore) {
        setError(`Score must be a number between 0 and ${selectedSubmission.maxScore}`);
        setGradeLoading(false);
        return;
      }
      
      await simpleSubmissionService.gradeSubmission(
        selectedSubmission.id,
        score,
        gradeData.feedback,
        gradeData.passed
      );
      
      setGradeDialogOpen(false);
      loadSubmissions(selectedAssignment.id);
    } catch (error) {
      console.error('Error grading submission:', error);
      setError('Failed to save grade. Please try again.');
    } finally {
      setGradeLoading(false);
    }
  };

  const renderAssignmentsList = () => {
    if (assignments.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No assignments found.</Typography>
        </Paper>
      );
    }

    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Select an Assignment
        </Typography>
        <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          {assignments.map(assignment => (
            <Box
              key={assignment.id}
              sx={{
                p: 2,
                mb: 1,
                border: '1px solid',
                borderColor: selectedAssignment?.id === assignment.id ? 'primary.main' : 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
              onClick={() => handleAssignmentChange(assignment)}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {assignment.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Due: {format(new Date(assignment.dueDate), 'PP')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Chip
                  size="small"
                  label={`${assignment.submissionCount || 0} submissions`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`${assignment.gradedCount || 0} graded`}
                  color="success"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    );
  };

  const renderSubmissionsList = () => {
    if (!selectedAssignment) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">Please select an assignment.</Typography>
        </Paper>
      );
    }

    if (submissionsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (submissions.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No submissions found for this assignment.</Typography>
        </Paper>
      );
    }

    return (
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Submissions for: {selectedAssignment.title}
          </Typography>
          <IconButton onClick={() => loadSubmissions(selectedAssignment.id)} size="small">
            <RefreshIcon />
          </IconButton>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Score</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map(submission => (
                <TableRow key={submission.id}>
                  <TableCell>{submission.studentName}</TableCell>
                  <TableCell>{format(new Date(submission.submittedAt), 'PPp')}</TableCell>
                  <TableCell>
                    {submission.graded ? (
                      submission.passed ? (
                        <Chip
                          size="small"
                          icon={<CheckCircleIcon />}
                          label="Pass"
                          color="success"
                        />
                      ) : (
                        <Chip
                          size="small"
                          icon={<CancelIcon />}
                          label="Fail"
                          color="error"
                        />
                      )
                    ) : (
                      <Chip
                        size="small"
                        label="Pending"
                        color="warning"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {submission.graded
                      ? `${submission.score || 0}/${submission.maxScore || 100}`
                      : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => handleViewSubmission(submission)}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    {isTeacher && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleGradeSubmission(submission)}
                      >
                        {submission.graded ? 'Update Grade' : 'Grade'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {isTeacher ? 'Grade Assignments' : 'My Submissions'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadAssignments}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            {renderAssignmentsList()}
          </Grid>
          <Grid item xs={12} md={8}>
            {renderSubmissionsList()}
          </Grid>
        </Grid>
      )}

      {/* View Submission Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Submission from {selectedSubmission?.studentName}
        </DialogTitle>
        <DialogContent dividers>
          {selectedSubmission && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Submitted on {format(new Date(selectedSubmission.submittedAt), 'PPp')}
              </Typography>
              
              {selectedSubmission.answers && selectedSubmission.answers.length > 0 ? (
                // Display answers to multiple questions
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Answers
                  </Typography>
                  
                  {selectedSubmission.answers.map((answer, idx) => (
                    <Card key={idx} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Question {idx + 1}:
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
                          {answer.questionText}
                        </Typography>
                        
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Answer:
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {answer.answerText}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                // Display single content submission
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Submission Content
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedSubmission.content || 'No content provided.'}
                    </Typography>
                  </Paper>
                </Box>
              )}
              
              {selectedSubmission.attachmentUrl && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Attachment:
                  </Typography>
                  <Button
                    variant="outlined"
                    href={selectedSubmission.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Attachment
                  </Button>
                </Box>
              )}
              
              {selectedSubmission.graded && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Grading Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Score:
                      </Typography>
                      <Typography variant="h4">
                        {selectedSubmission.score || 0}
                        <Typography variant="h6" component="span" color="text.secondary">
                          /{selectedSubmission.maxScore || 100}
                        </Typography>
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status:
                      </Typography>
                      <Chip
                        icon={selectedSubmission.passed ? <CheckCircleIcon /> : <CancelIcon />}
                        label={selectedSubmission.passed ? 'Pass' : 'Fail'}
                        color={selectedSubmission.passed ? 'success' : 'error'}
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Feedback:
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                        {selectedSubmission.feedback || 'No feedback provided.'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
          {isTeacher && (
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                setViewDialogOpen(false);
                handleGradeSubmission(selectedSubmission);
              }}
            >
              {selectedSubmission?.graded ? 'Update Grade' : 'Grade'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog
        open={gradeDialogOpen}
        onClose={() => setGradeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Grade Submission - {selectedSubmission?.studentName}
        </DialogTitle>
        <DialogContent dividers>
          {selectedSubmission && (
            <Box>
              <TextField
                fullWidth
                required
                type="number"
                label={`Score (out of ${selectedSubmission.maxScore || 100})`}
                name="score"
                value={gradeData.score}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0, max: selectedSubmission.maxScore || 100 } }}
                disabled={gradeLoading}
                sx={{ mb: 3 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={gradeData.passed}
                    onChange={handlePassedChange}
                    name="passed"
                    color="success"
                    disabled={gradeLoading}
                  />
                }
                label={gradeData.passed ? "Pass" : "Fail"}
                sx={{ mb: 2, display: 'block' }}
              />
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Feedback"
                name="feedback"
                value={gradeData.feedback}
                onChange={handleInputChange}
                disabled={gradeLoading}
                placeholder="Provide feedback on this submission"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setGradeDialogOpen(false)}
            disabled={gradeLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitGrade}
            color="primary"
            variant="contained"
            disabled={gradeLoading}
            startIcon={gradeLoading && <CircularProgress size={20} color="inherit" />}
          >
            Save Grade
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SimpleGradingPage;
