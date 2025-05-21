import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Alert,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon, 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import QuestionForm from './QuestionForm';

const MultipleQuestionForm = ({ initialQuestions = [], onSave, onCancel }) => {
  const [questions, setQuestions] = useState(initialQuestions);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [expandedPanel, setExpandedPanel] = useState(false);

  const handleAddQuestion = () => {
    setEditingQuestionIndex(null);
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (index) => {
    setEditingQuestionIndex(index);
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const handleSaveQuestion = (question) => {
    let updatedQuestions;
    
    if (editingQuestionIndex !== null) {
      // Update existing question
      updatedQuestions = [...questions];
      updatedQuestions[editingQuestionIndex] = question;
    } else {
      // Add new question
      updatedQuestions = [...questions, question];
    }
    
    setQuestions(updatedQuestions);
    setShowQuestionForm(false);
    setEditingQuestionIndex(null);
  };

  const handleCancelQuestionForm = () => {
    setShowQuestionForm(false);
    setEditingQuestionIndex(null);
  };

  const handleSubmit = () => {
    onSave(questions);
  };

  const handlePanelChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Assignment Questions
      </Typography>
      
      {questions.length === 0 && !showQuestionForm && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No questions added yet. Click "Add Question" to create a multiple-choice question.
        </Alert>
      )}
      
      {questions.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
              Questions ({questions.length})
            </Typography>
            <Chip 
              icon={<CheckCircleIcon />} 
              label="Ready to save" 
              color="success" 
              variant="outlined" 
              size="small"
            />
          </Box>
          
          {questions.map((question, index) => (
            <Accordion 
              key={index} 
              expanded={expandedPanel === `panel-${index}`}
              onChange={handlePanelChange(`panel-${index}`)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ width: '80%', flexShrink: 0 }}>
                  {index + 1}. {question.text}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  {question.options.length} options
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Options:
                    </Typography>
                    {question.options.map((option, optIndex) => (
                      <Box 
                        key={optIndex} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: option.isCorrect ? 'success.light' : 'grey.100'
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            flexGrow: 1,
                            color: option.isCorrect ? 'success.contrastText' : 'text.primary'
                          }}
                        >
                          {option.text}
                        </Typography>
                        {option.isCorrect && (
                          <Chip 
                            label="Correct Answer" 
                            size="small" 
                            color="success"
                          />
                        )}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button
                    startIcon={<EditIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => handleEditQuestion(index)}
                  >
                    Edit
                  </Button>
                  <Button
                    startIcon={<DeleteIcon />}
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteQuestion(index)}
                  >
                    Delete
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
      
      {showQuestionForm ? (
        <QuestionForm 
          initialQuestion={editingQuestionIndex !== null ? questions[editingQuestionIndex] : null}
          onSave={handleSaveQuestion}
          onCancel={handleCancelQuestionForm}
        />
      ) : (
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddQuestion}
          sx={{ mb: 3 }}
        >
          Add Question
        </Button>
      )}
      
      {!showQuestionForm && questions.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSubmit}
            >
              Save All Questions
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default MultipleQuestionForm;
