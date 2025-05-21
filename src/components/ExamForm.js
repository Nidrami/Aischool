import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper,
  IconButton,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const ExamForm = ({ open, onClose, onSubmit }) => {
  const [examName, setExamName] = useState('');
  const [subject, setSubject] = useState('');
  const [questions, setQuestions] = useState(['']);

  const handleAddQuestion = () => {
    setQuestions([...questions, '']);
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty questions
    const filteredQuestions = questions.filter(q => q.trim() !== '');
    
    // Ensure we have at least one question
    if (filteredQuestions.length === 0) {
      alert('Please add at least one question');
      return;
    }
    
    // Format data according to what the backend expects
    const examData = {
      name: examName,
      subject: subject,
      questions: filteredQuestions
    };
    
    console.log('Sending exam data:', examData);
    
    onSubmit(examData);
    
    // Reset form
    setExamName('');
    setSubject('');
    setQuestions(['']);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5">Create New Exam</Typography>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="examName"
            label="Exam Name"
            name="examName"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="subject"
            label="Subject"
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Questions
            </Typography>
            <Divider />
          </Box>
          
          {questions.map((question, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={10}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={2}
                  label={`Question ${index + 1}`}
                  value={question}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                />
              </Grid>
              <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  color="error" 
                  onClick={() => handleRemoveQuestion(index)}
                  disabled={questions.length <= 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddQuestion}
            sx={{ mt: 1, mb: 3 }}
          >
            Add Question
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Create Exam</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExamForm;
