import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import simpleSubmissionService from '../services/simpleSubmissionService';

const SimpleSubmissionForm = ({ assignment, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    assignmentId: assignment?.id,
    content: '',
    attachmentUrl: '',
    answers: []
  });
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);

  useEffect(() => {
    if (assignment) {
      checkExistingSubmission();
      
      // Initialize answers array based on assignment questions
      if (assignment.questions && assignment.questions.length > 0) {
        const initialAnswers = assignment.questions.map(question => ({
          questionId: question.id,
          questionText: question.questionText,
          answerText: ''
        }));
        
        setFormData(prev => ({
          ...prev,
          answers: initialAnswers
        }));
      }
    }
  }, [assignment]);

  const checkExistingSubmission = async () => {
    setLoadingExisting(true);
    try {
      const submission = await simpleSubmissionService.getStudentAssignmentSubmission(assignment.id);
      if (submission) {
        setExistingSubmission(submission);
        setSubmissionResult(submission);
        setSuccess(true);
      }
      setLoadingExisting(false);
    } catch (error) {
      console.error('Error checking existing submission:', error);
      setLoadingExisting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Check if all questions have answers
    if (formData.answers && formData.answers.length > 0) {
      const unansweredQuestions = formData.answers.filter(answer => !answer.answerText.trim());
      if (unansweredQuestions.length > 0) {
        setError(`Please answer all questions. ${unansweredQuestions.length} question(s) unanswered.`);
        return false;
      }
      return true;
    } else {
      // If no questions, check the general content field
      if (!formData.content.trim()) {
        setError('Please provide some content for your submission');
        return false;
      }
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (validateForm()) {
      try {
        const submissionData = {
          assignmentId: assignment.id,
          content: formData.content.trim(),
          attachmentUrl: formData.attachmentUrl.trim() || null,
          answers: formData.answers.map(answer => ({
            questionId: answer.questionId,
            answerText: answer.answerText.trim()
          }))
        };

        const result = await onSubmit(submissionData);
        setSubmissionResult(result);
        setSuccess(true);
      } catch (error) {
        console.error('Error submitting assignment:', error);
        setError('Failed to submit assignment. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  if (!assignment) {
    return <Typography>Assignment not found</Typography>;
  }

  if (loadingExisting) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Submit Assignment: {assignment.title}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && submissionResult && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Assignment submitted successfully!
            </Typography>
            <Typography variant="body2">
              You can now see the correct answers for each question below.
            </Typography>
          </Alert>
        </Box>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Assignment Details
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="body1" paragraph>
              <strong>Description:</strong> {assignment.description || 'No description provided.'}
            </Typography>
            {/* Removed Maximum Score information */}
          </Box>
        </Grid>
        
        {existingSubmission && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              You have already submitted this assignment on {new Date(existingSubmission.submittedAt).toLocaleString()}.
              You can view the correct answers below.
            </Alert>
            <Typography variant="subtitle1" gutterBottom>
              Your Previous Submission
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 2 }}>
              <Typography variant="body1" whiteSpace="pre-wrap">
                {existingSubmission.content}
              </Typography>
              {existingSubmission.attachmentUrl && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <a href={existingSubmission.attachmentUrl} target="_blank" rel="noopener noreferrer">
                    View Attachment
                  </a>
                </Typography>
              )}
            </Box>
            
            {/* Show correct answers for each question */}
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Correct Answers
              </Typography>
              {assignment.questions && assignment.questions.length > 0 ? (
                assignment.questions.map((question, index) => (
                  <Box key={index} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 2 }}>
                    <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
                      Question {index + 1}: {question.questionText}
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ pl: 2, borderLeft: '3px solid #4caf50', py: 1 }}>
                      <strong>Your Answer:</strong> {existingSubmission.answers && existingSubmission.answers[index] ? 
                        existingSubmission.answers[index].answerText : 'No answer provided.'}
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ pl: 2, borderLeft: '3px solid #3f51b5', py: 1 }}>
                      <strong>Correct Answer:</strong> {question.correctAnswer || 'No correct answer provided.'}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="body1">
                    No questions were defined for this assignment.
                  </Typography>
                </Box>
              )}
            </>
          </Grid>
        )}
        
        {!existingSubmission && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Your Submission
              </Typography>
              
              {formData.answers && formData.answers.length > 0 ? (
                // Display simple question boxes
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Please provide your answers in the text boxes below:
                  </Typography>
                  
                  {formData.answers.map((answer, index) => (
                    <Box key={index} sx={{ mb: 4, p: 3, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Question Box {index + 1}:
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2, pl: 1, borderLeft: '3px solid #666', py: 1 }}>
                        {answer.questionText}
                      </Typography>
                      <TextField
                        fullWidth
                        required
                        multiline
                        rows={4}
                        label="Your Answer"
                        value={answer.answerText}
                        onChange={(e) => {
                          const updatedAnswers = [...formData.answers];
                          updatedAnswers[index] = { ...updatedAnswers[index], answerText: e.target.value };
                          setFormData(prev => ({ ...prev, answers: updatedAnswers }));
                        }}
                        placeholder="Type your answer here..."
                        disabled={loading || success}
                        variant="outlined"
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                // Display single content field if no questions defined
                <Box sx={{ mb: 3, p: 3, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Your Answer:
                  </Typography>
                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={6}
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Type your answer here..."
                    disabled={loading || success}
                    variant="outlined"
                  />
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Attachment URL (Optional)"
                name="attachmentUrl"
                value={formData.attachmentUrl}
                onChange={handleInputChange}
                placeholder="Enter URL to any supporting documents or resources"
                disabled={loading || success}
                helperText="You can provide a link to Google Drive, GitHub, or any other file hosting service"
              />
            </Grid>
          </>
        )}
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            
            {!existingSubmission && (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || success}
                startIcon={loading && <CircularProgress size={20} />}
              >
                Submit Assignment
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SimpleSubmissionForm;
