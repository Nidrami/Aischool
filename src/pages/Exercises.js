import React, { useState } from 'react';
import { 
  Container, Typography, Box, Paper, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
  Card, CardContent, Divider, Grid, Chip, Accordion, AccordionSummary,
  AccordionDetails, Tooltip, IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import SchoolIcon from '@mui/icons-material/School';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PsychologyIcon from '@mui/icons-material/Psychology';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: '8px',
  '&::before': {
    display: 'none',
  },
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
}));

const ContentBlock = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: '8px',
  border: `1px solid ${theme.palette.grey[200]}`,
}));

const Exercises = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [generatedExercise, setGeneratedExercise] = useState(null);
  const [error, setError] = useState('');
  const [aiWorking, setAiWorking] = useState(false);
  const [aiStatus, setAiStatus] = useState('idle'); // 'idle', 'generating', 'success', 'error'

  const handleTopicChange = (e) => {
    setTopic(e.target.value);
  };

  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };

  const generateExercise = async () => {
    if (!topic) {
      setError('Please enter a topic');
      return;
    }
    
    setError('');
    setLoading(true);
    setAiWorking(true);
    setAiStatus('generating');
    
    try {
      console.log('Sending exercise generation request:', { topic, difficulty });
      
      // Call our backend API with full URL
      const response = await fetch('http://localhost:8080/api/exercises/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // Use include to ensure cookies are sent for auth if needed
        body: JSON.stringify({ topic, difficulty })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Received API response:', data);
      setGeneratedExercise(data);
      setAiStatus('success');
      
      // Format the response - if the question, hint, or answer contains markdown code blocks, format them properly
      if (data.question && data.hint && data.suggestedAnswer) {
        // This is just a placeholder - in a real implementation you might use a markdown renderer like 'marked'
        // For now we're just keeping the text as is
      }
    } catch (err) {
      console.error('Error generating exercise:', err);
      setError(`Failed to generate exercise: ${err.message}`);
      setAiStatus('error');
      
      // Only use fallback in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Falling back to simulated response');
        const simulatedExercise = {
          id: Math.floor(Math.random() * 1000),
          topic: topic,
          difficulty: difficulty,
          question: `Explain the key concepts of ${topic} with examples.`,
          hint: `Consider the fundamental principles of ${topic} and how they apply in real-world scenarios.`,
          suggestedAnswer: `This is a placeholder for a suggested answer about ${topic}. The real AI integration is still being configured.`,
          createdAt: new Date().toISOString()
        };
        
        setGeneratedExercise(simulatedExercise);
      }
    } finally {
      setLoading(false);
      setAiWorking(false);
    }
  };

  const clearExercise = () => {
    setGeneratedExercise(null);
  };

  // Format the difficulty level for display
  const getDifficultyColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'primary';
      case 'hard': return 'error';
      default: return 'primary';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SmartToyIcon sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h4">
          AI Exercise Generator
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <StyledPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Generate New Exercise
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <TextField
              label="Topic"
              placeholder="Enter a subject (e.g., React Hooks, Java Inheritance, etc.)"
              variant="outlined"
              fullWidth
              value={topic}
              onChange={handleTopicChange}
              sx={{ mb: 3 }}
            />
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficulty}
                onChange={handleDifficultyChange}
                label="Difficulty"
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
            
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            
            <Button
              variant="contained"
              color="primary"
              onClick={generateExercise}
              disabled={loading || aiWorking}
              startIcon={loading ? <CircularProgress size={20} /> : <AutoStoriesIcon />}
              fullWidth
              sx={{ py: 1.2 }}
            >
              {loading ? 'AI is generating your exercise...' : 'Generate Exercise with AI'}
            </Button>

            {/* AI Status indicator */}
            {aiStatus === 'generating' && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  AI is crafting an exercise for you...
                </Typography>
              </Box>
            )}

            {/* Tips for better prompts */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'info.dark', mb: 1 }}>
                💡 Tips for best results:
              </Typography>
              <Typography variant="body2" sx={{ color: 'info.dark' }}>
                Be specific with your topic. For example, instead of "JavaScript", try "JavaScript Promises" or "JavaScript Array Methods".
              </Typography>
            </Box>
          </StyledPaper>
        </Grid>
        
        <Grid item xs={12} md={7}>
          {generatedExercise ? (
            <StyledPaper>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    Your AI-Generated Exercise
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={generatedExercise.difficulty.charAt(0).toUpperCase() + generatedExercise.difficulty.slice(1)} 
                    color={getDifficultyColor(generatedExercise.difficulty)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Tooltip title="Generate a new exercise">
                    <IconButton size="small" onClick={clearExercise} color="primary">
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <ContentBlock>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                  Topic:
                </Typography>
                <Typography variant="body1">
                  {generatedExercise.topic}
                </Typography>
              </ContentBlock>
              
              <StyledAccordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Question</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1">
                    {generatedExercise.question}
                  </Typography>
                </AccordionDetails>
              </StyledAccordion>
              
              <StyledAccordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Hint</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1">
                    {generatedExercise.hint}
                  </Typography>
                </AccordionDetails>
              </StyledAccordion>
              
              <StyledAccordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Suggested Answer</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1">
                    {generatedExercise.suggestedAnswer}
                  </Typography>
                </AccordionDetails>
              </StyledAccordion>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={generateExercise}
                  startIcon={<AutoStoriesIcon />}
                  disabled={loading || aiWorking}
                  sx={{ mr: 2 }}
                >
                  Generate New Exercise
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={clearExercise}
                  startIcon={<RefreshIcon />}
                >
                  Clear Exercise
                </Button>
              </Box>
            </StyledPaper>
          ) : (
            <StyledPaper>
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Exercise Generated Yet
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Enter a topic and difficulty level, then click "Generate Exercise" to create a new exercise using AI.
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  Our AI will create a custom exercise based on your specifications. The exercise will include a detailed question, a helpful hint, and a comprehensive suggested answer.
                </Typography>
              </Box>
            </StyledPaper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Exercises;
