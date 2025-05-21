import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Fab,
  Collapse,
  Avatar,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Send as SendIcon,
  Chat as ChatIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Knowledge database for common questions
const knowledgeDB = {
  // School of Excellence specific information
  'school info': 'The School of Excellence (MSE) is a premier educational institution dedicated to providing high-quality education with a focus on modern teaching methods and technology integration. Our curriculum combines traditional educational values with innovative learning approaches.',
  'education system': 'Our education system follows a 6-3-3 system (6 years of primary, 3 years of lower secondary, and 3 years of upper secondary education). The School of Excellence enhances this framework with additional focus on technology, languages, and practical skills development.',
  'school mission': 'The mission of School of Excellence is to empower students with knowledge, skills, and values needed to excel in a global context while maintaining strong connections to cultural heritage and traditions.',
  'curriculum': 'Our curriculum combines standard national curriculum requirements with enhanced STEM education, advanced language studies (English, French, and other languages), and specialized courses in technology and digital literacy.',
  'admission': 'Admissions to School of Excellence are open throughout the year. The process includes an application form, previous academic records, and an assessment test. Please register on our platform or contact the admissions office for more details.',
  'tuition fees': 'Tuition fees at School of Excellence vary by grade level and program. We offer scholarships and financial aid for deserving students. Please contact our administrative office for the current fee structure.',
  'school facilities': 'Our facilities include modern classrooms, state-of-the-art laboratories, a comprehensive library, sports fields, art studios, and a technology center with the latest computer equipment and internet access.',
  
  // Geography - Capitals
  'capital of morocco': 'The capital of Morocco is Rabat. However, Casablanca is the largest city and main commercial center.',
  'capital of france': 'The capital of France is Paris.',
  'capital of usa': 'The capital of the United States is Washington, D.C.',
  'capital of japan': 'The capital of Japan is Tokyo.',
  'capital of china': 'The capital of China is Beijing.',
  'capital of india': 'The capital of India is New Delhi.',
  'capital of uk': 'The capital of the United Kingdom is London.',
  'capital of spain': 'The capital of Spain is Madrid.',
  'capital of italy': 'The capital of Italy is Rome.',
  'capital of germany': 'The capital of Germany is Berlin.',
  'capital of canada': 'The capital of Canada is Ottawa.',
  
  // Geography - Largest countries
  'largest country': 'Russia is the largest country in the world by land area, covering more than 17 million square kilometers.',
  'biggest country': 'Russia is the largest country in the world by land area, covering more than 17 million square kilometers.',
  
  // Population
  'most populated country': 'As of 2025, China is the most populous country in the world with approximately 1.4 billion people, followed closely by India with around 1.39 billion people.',
  'country with most people': 'As of 2025, China is the most populous country in the world with approximately 1.4 billion people, followed closely by India with around 1.39 billion people.',
  
  // Educational facts
  'largest ocean': 'The Pacific Ocean is the largest and deepest ocean on Earth, covering more than 63 million square miles.',
  'tallest mountain': 'Mount Everest is the tallest mountain above sea level at 8,848.86 meters (29,031.7 feet).',
  'longest river': 'The Nile River in Africa is generally considered the longest river in the world at about 6,650 kilometers (4,130 miles), although some sources argue that the Amazon River is longer.',
  
  // Science facts
  'closest planet to sun': 'Mercury is the closest planet to the Sun in our solar system.',
  'largest planet': 'Jupiter is the largest planet in our solar system.',
  'speed of light': 'The speed of light in a vacuum is 299,792,458 meters per second (approximately 300,000 kilometers per second or 186,000 miles per second).',
  
  // Historical facts
  'world war 2': 'World War II was a global conflict that lasted from 1939 to 1945, involving many of the world\'s nations organized into two opposing military alliances: the Allies and the Axis.',
  
  // Technology
  'what is ai': 'Artificial Intelligence (AI) refers to systems or machines that mimic human intelligence to perform tasks and can iteratively improve themselves based on the information they collect.',
  'what is machine learning': 'Machine Learning is a subset of AI that enables systems to learn and improve from experience without being explicitly programmed.',
  'what is blockchain': 'Blockchain is a distributed database or ledger shared among computer network nodes that stores information electronically in digital format, most commonly known for its use in cryptocurrency systems.',
  
  // Literature
  'shakespeare': 'William Shakespeare (1564-1616) was an English playwright, poet, and actor, widely regarded as the greatest writer in the English language and the world\'s greatest dramatist.',
};

// Function to get contextual AI responses based on user input
const getAIResponse = async (message) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const userQuestion = message.toLowerCase().trim();
  
  // First, check our knowledge database for direct matches or knowledge containing the keywords
  for (const [key, value] of Object.entries(knowledgeDB)) {
    if (userQuestion.includes(key)) {
      return value;
    }
  }

  // Check for capital questions that may be phrased differently
  if (userQuestion.includes('capital') && userQuestion.includes('of')) {
    const countryMatch = userQuestion.match(/capital\s+of\s+(\w+)/) || 
                         userQuestion.match(/(\w+)\s+capital/);
    
    if (countryMatch && countryMatch[1]) {
      const country = countryMatch[1].toLowerCase();
      
      // Check if we have this country in our database
      for (const [key, value] of Object.entries(knowledgeDB)) {
        if (key.includes(`capital of ${country}`)) {
          return value;
        }
      }
      
      return `I don't have information about the capital of ${country} in my database. Please try asking about another country or a different question.`;
    }
  }
  
  // Math questions
  if (userQuestion.match(/\d+\s*[+\-*\/]\s*\d+/) || userQuestion.includes('calculate')) {
    // Extract numbers and operation
    const mathExpression = userQuestion.match(/\d+\s*[+\-*\/]\s*\d+/)?.[0];
    if (mathExpression) {
      try {
        // This is a simple way to evaluate a basic math expression
        // eslint-disable-next-line no-eval
        const result = eval(mathExpression);
        return `The answer to ${mathExpression} is ${result}.`;
      } catch (e) {
        return "I'm having trouble with that calculation. Could you please rephrase it?";
      }
    }
  }
  
  // Course-related questions
  if (userQuestion.includes('course') || userQuestion.includes('learn') || userQuestion.includes('study')) {
    return "School of Excellence offers courses in various subjects following a comprehensive curriculum enhanced with international best practices. Our core subjects include English, Mathematics, Sciences, Social Studies, and Information Technology. We also offer specialized courses in programming, robotics, and entrepreneurship. You can browse all courses after creating an account.";
  }
  
  // Questions about the platform
  if (userQuestion.includes('smartlearn') || userQuestion.includes('platform') || userQuestion.includes('website') || userQuestion.includes('mse') || userQuestion.includes('school of excellence')) {
    return "The School of Excellence platform is an online learning system that complements our in-person education. It provides access to course materials, interactive exercises, and communication tools for students, teachers, and parents. You can create an account to access your courses, submit assignments, track progress, and communicate with teachers.";
  }
  
  // Examples or demo request
  if (userQuestion.includes('example') || userQuestion.includes('show me') || userQuestion.includes('demo')) {
    return "Here's a demo of how our courses work:\n\n**Web Development Path**:\n1. HTML & CSS Fundamentals\n2. JavaScript Essentials\n3. React Framework\n4. Backend with Node.js\n\nEach course includes video lessons, interactive exercises, and real-world projects.";
  }
  
  // Coding questions
  if (userQuestion.includes('code') || userQuestion.includes('programming') || userQuestion.includes('javascript')) {
    return "Here's a simple JavaScript code example:\n\n```javascript\n// Function to greet a user\nfunction greetUser(name) {\n  return `Hello, ${name}! Welcome to MSE.`;\n}\n\nconsole.log(greetUser('Student'));\n```\n\nYou can learn coding through our programming courses.";
  }
  
  // Fallback for unrecognized questions
  return "I don't have that specific information in my knowledge base yet. I can help you with information about School of Excellence, our educational system, courses, or general knowledge questions. How else may I assist you today?";
};

const AIChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hi there! How can I help you learn today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Get AI response
      const response = await getAIResponse(input);
      const botMessage = { type: 'bot', content: response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = { type: 'bot', content: 'Sorry, I encountered an error. Please try again later.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Improved text formatter with code block support
  const formatText = (text) => {
    // Handle code blocks first (```code```) to avoid conflicts with inline formatting
    let formattedText = text;
    
    // Replace ```language\ncode\n``` with code blocks
    formattedText = formattedText.replace(/```(.*?)\n([\s\S]*?)```/g, (match, language, code) => {
      return `<pre style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; overflow-x: auto;"><code style="display: block;">${code}</code></pre>`;
    });
    
    // Replace **text** with bold
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace *text* with italics
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Replace `code` with inline code (after handling code blocks)
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code style="background-color: #f0f0f0; padding: 2px 4px; border-radius: 3px;">$1</code>');
    
    // Replace newlines with <br>
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    return formattedText;
  };
  
  // Render message with basic formatting
  const renderMessage = (content) => {
    return <div dangerouslySetInnerHTML={{ __html: formatText(content) }} />;
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      {/* Chat button */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={handleOpen}
        sx={{ 
          display: open ? 'none' : 'flex',
          bgcolor: '#00843D',
          '&:hover': {
            bgcolor: '#005025'
          } 
        }}
      >
        <ChatIcon />
      </Fab>

      {/* Chat window */}
      <Collapse in={open} timeout={300}>
        <Paper
          elevation={3}
          sx={{
            width: 350,
            height: 450,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: '#00843D',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="h6">MSE Learning Assistant</Typography>
            <IconButton size="small" color="inherit" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider />

          {/* Messages area */}
          <Box
            sx={{
              flexGrow: 1,
              p: 2,
              overflowY: 'auto',
              bgcolor: '#f5f5f5'
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  mb: 2,
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                {message.type === 'bot' && (
                  <Avatar
                    sx={{ mr: 1, bgcolor: 'primary.main' }}
                    alt="AI"
                  >
                    AI
                  </Avatar>
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    maxWidth: '75%',
                    borderRadius: 2,
                    bgcolor: message.type === 'user' ? 'primary.light' : 'white',
                    color: message.type === 'user' ? 'white' : 'text.primary'
                  }}
                >
                  {renderMessage(message.content)}
                </Paper>
                {message.type === 'user' && (
                  <Avatar
                    sx={{ ml: 1, bgcolor: 'secondary.main' }}
                    alt="You"
                  >
                    You
                  </Avatar>
                )}
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input area */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Ask me anything..."
              value={input}
              onChange={handleInputChange}
              variant="outlined"
              autoComplete="off"
              sx={{ mr: 1 }}
            />
            <IconButton type="submit" color="primary" disabled={loading}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default AIChatBot;
