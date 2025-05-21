import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Chip,
  Button,
  Alert,
  Card,
  CardContent,
  Grid,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from '@mui/material';
import { 
  Description as DescriptionIcon,
  VideoLibrary as VideoIcon,
  ExpandMore as ExpandMoreIcon,
  PlayCircleOutline as PlayIcon,
  Quiz as QuizIcon,
  Article as ArticleIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ChapterManager from './ChapterManager';

const CourseContentView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [courseCreator, setCourseCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [discussions, setDiscussions] = useState([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [discussionError, setDiscussionError] = useState(null);

  // State to track completion progress
  const [completionProgress, setCompletionProgress] = useState(0);
  
  // Add state to track chapter completion status
  const [chapterCompletionStatus, setChapterCompletionStatus] = useState({});

  useEffect(() => {
    // Load both course details and creator information
    const loadCourseData = async () => {
      try {
        setLoading(true);
        
        // Fetch the course details
        const courseResponse = await courseAPI.getCourse(id);
        console.log('Course data received:', courseResponse.data);
        setCourse(courseResponse.data);
        
        // Attempt to fetch creator information
        try {
          const creatorResponse = await courseAPI.getCourseCreator(id);
          console.log('Creator data received:', creatorResponse.data);
          setCourseCreator(creatorResponse.data);
        } catch (creatorError) {
          console.warn('Could not fetch creator details:', creatorError);
          // Will use fallback in the UI
        }
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('Failed to load course. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadCourseData();
  }, [id]);
  
  // Calculate course completion percentage whenever course data changes
  useEffect(() => {
    if (course && course.chapters) {
      // Wait for course data to be fully available
      setTimeout(() => {
        console.log('Initial completion progress calculation...');
        calculateCompletionProgress();
        
        // Force another recalculation after a short delay for UI consistency
        setTimeout(() => {
          console.log('Forcing completion progress recalculation...');
          calculateCompletionProgress();
        }, 1000);
      }, 100);
    }
  }, [course]);
  
  // Add listener for content completion events
  useEffect(() => {
    // Listen for content completion events from CourseContentPlayer
    const handleContentCompletion = (event) => {
      console.log('Content completion event received in CourseContentView', event.detail);
      // Force recalculation of progress
      calculateCompletionProgress();
    };
    
    // Add event listener
    window.addEventListener('contentCompletionChanged', handleContentCompletion);
    
    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('contentCompletionChanged', handleContentCompletion);
    };
  }, [course]); // Re-add listener when course changes
  
  // Function to calculate completion progress
  const calculateCompletionProgress = () => {
    console.log('Calculating completion progress...');
    
    try {
      // First, load completed content items from localStorage
      const completedItems = JSON.parse(localStorage.getItem('completedContentItems') || '[]');
      console.log('Completed items from localStorage:', completedItems);
      
      if (course && course.chapters) {
        // Example: Initialize each chapter with default status
        const updatedStatus = {};
        let totalContentItems = 0;
        let totalCompleted = 0;
        
        // Process each chapter
        course.chapters.forEach(chapter => {
          const chapterContents = chapter.contents || [];
          const contentCount = chapterContents.length;
          totalContentItems += contentCount;
          
          // Count completed items in this chapter
          let chapterCompletedCount = 0;
          
          if (contentCount > 0) {
            chapterContents.forEach(content => {
              // Check if this content is in the completed items list
              const contentId = content.id.toString();
              const isCompleted = completedItems.includes(contentId) || 
                                 completedItems.includes(parseInt(contentId));
              
              if (isCompleted) {
                chapterCompletedCount++;
                totalCompleted++;
              }
            });
          }
          
          // Calculate chapter completion percentage
          const chapterPercentage = contentCount > 0 
            ? Math.round((chapterCompletedCount / contentCount) * 100) 
            : 0;
          
          // Update chapter status
          updatedStatus[chapter.id] = {
            completed: chapterCompletedCount === contentCount && contentCount > 0,
            percentage: chapterPercentage,
            completedCount: chapterCompletedCount,
            totalCount: contentCount
          };
        });
        
        // Update the status state
        setChapterCompletionStatus(updatedStatus);
        
        // Calculate overall course progress
        const overallPercentage = totalContentItems > 0 
          ? Math.round((totalCompleted / totalContentItems) * 100)
          : 0;
        
        setCompletionProgress(overallPercentage);
        console.log(`Course completion: ${totalCompleted}/${totalContentItems} (${overallPercentage}%)`);
      }
    } catch (error) {
      console.error('Error calculating completion progress:', error);
    }
  };

  const isTeacherOrAdmin = () => {
    if (!user || !course) return false;
    
    const isAdmin = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';
    const isTeacher = (user.role === 'TEACHER' || user.role === 'ROLE_TEACHER') && 
                      course.teacher && course.teacher.id === user.id;
    
    return isAdmin || isTeacher;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Load discussions when the user clicks on the Discussions tab
    if (newValue === 2 && course) {
      fetchDiscussions();
    }
  };
  
  const fetchDiscussions = async () => {
    try {
      setLoadingDiscussions(true);
      setDiscussionError(null);
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`/api/discussions/course/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch discussions: ${response.status}`);
      }
      
      const data = await response.json();
      setDiscussions(data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setDiscussionError('Failed to load discussions. Please try again.');
    } finally {
      setLoadingDiscussions(false);
    }
  };
  
  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setSendingMessage(true);
      setDiscussionError(null);
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`/api/discussions/course/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const newDiscussion = await response.json();
      setDiscussions([newDiscussion, ...discussions]);
      setNewMessage('');
    } catch (error) {
      console.error('Error posting discussion:', error);
      setDiscussionError(`Failed to post your message: ${error.message}`);
    } finally {
      setSendingMessage(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/my-courses')}
          sx={{ mt: 2 }}
        >
          Back to My Courses
        </Button>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box p={3}>
        <Alert severity="warning">Course not found</Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/my-courses')}
          sx={{ mt: 2 }}
        >
          Back to My Courses
        </Button>
      </Box>
    );
  }

  const assignments = [
    {
      id: 1,
      title: 'First Assignment',
      dueDate: '2025-05-20',
      status: 'not_started'
    },
    {
      id: 2,
      title: 'Mid-term Project',
      dueDate: '2025-06-15',
      status: 'not_started'
    }
  ];

  return (
    <Box p={3}>
      {/* Course Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: 'primary.light', color: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {course.title}
            </Typography>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography variant="body1">
                Instructor: {course.teacher?.firstName} {course.teacher?.lastName}
              </Typography>
            </Box>
            <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
              <Chip 
                label={course.subject} 
                color="default" 
                sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }} 
              />
              {course.level && (
                <Chip 
                  label={course.level} 
                  color="default" 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }} 
                />
              )}
              {course.duration && (
                <Chip 
                  label={`${course.duration} hours`} 
                  color="default" 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }} 
                />
              )}
            </Box>
          </Grid>
          {/* Progress circle removed */}
        </Grid>
      </Paper>

      {/* Course Tabs */}
      <Paper elevation={1} sx={{ borderRadius: 2, mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          aria-label="course content tabs"
        >
          <Tab icon={<DescriptionIcon />} label="Overview" />
          <Tab icon={<VideoIcon />} label="Content" />
          <Tab icon={<SchoolIcon />} label="Discussions" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box mt={3}>
        {/* Overview Tab */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  About This Course
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {course.description || 'No description provided for this course.'}
                </Typography>
                
                {/* What You'll Learn section removed as requested */}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Course Creator
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {/* Use courseCreator data if available, otherwise fall back to course.teacher */}
                {(courseCreator || course.teacher) ? (
                  <Box display="flex" flexDirection="column" mb={2}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar 
                        sx={{
                          width: 80,
                          height: 80,
                          mr: 2,
                          bgcolor: (courseCreator?.role || course.teacher?.role)?.includes('ADMIN') 
                            ? 'error.main' 
                            : 'primary.main',
                          fontWeight: 'bold',
                          fontSize: '2rem'
                        }}
                      >
                        {(courseCreator?.firstName || course.teacher?.firstName || 'I')?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {courseCreator?.firstName || course.teacher?.firstName || 'Instructor'}{' '}
                          {courseCreator?.lastName || course.teacher?.lastName || ''}
                        </Typography>
                        <Box display="flex" alignItems="center" mt={0.5} flexWrap="wrap">
                          <Chip 
                            size="small" 
                            color={(courseCreator?.role || course.teacher?.role)?.includes('ADMIN') 
                              ? 'error' 
                              : 'primary'}
                            label={((courseCreator?.role || course.teacher?.role) || 'TEACHER').replace('ROLE_', '')}
                            sx={{ mr: 1, mb: 0.5, fontWeight: 'bold' }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                      Contact Information
                    </Typography>
                    <Box mt={1} mb={2}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box component="span" mr={1} display="inline-flex">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        </Box>
                        {courseCreator?.email || course.teacher?.email || ''}
                      </Typography>
                      
                      {(courseCreator?.phone || course.teacher?.phone) && (
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box component="span" mr={1} display="inline-flex">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                          </Box>
                          {courseCreator?.phone || course.teacher?.phone}
                        </Typography>
                      )}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                      About Instructor
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1} sx={{ whiteSpace: 'pre-line' }}>
                      {courseCreator?.bio || course.teacher?.bio || "This instructor hasn't added a bio yet."}
                    </Typography>
                    
                    <Box mt={2}>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" gutterBottom>
                        Teaching Stats
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2} mt={1} flexWrap="wrap">
                        <Chip 
                          icon={<SchoolIcon fontSize="small" />}
                          label={`${courseCreator?.courseCount || course.teacherCourseCount || 1}+ Courses`}
                          variant="outlined"
                          size="small"
                        />
                        <Chip 
                          icon={<PersonIcon fontSize="small" />}
                          label={`${courseCreator?.studentCount || course.teacherStudentCount || 0}+ Students`}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Typography color="text.secondary" fontStyle="italic">
                    Creator information unavailable
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Content Tab */}
        {tabValue === 1 && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <ChapterManager 
              courseId={id} 
              isTeacherOrAdmin={isTeacherOrAdmin()}
              chapterCompletionStatus={chapterCompletionStatus}
              onChapterStatusChange={calculateCompletionProgress}
            />
          </Paper>
        )}

        {/* Discussions Tab */}
        {tabValue === 2 && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Discussion Forum
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {/* Message input form */}
            <Box component="form" onSubmit={handleSubmitMessage} sx={{ mb: 4 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Post a new message:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    placeholder="What would you like to share or ask?"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sendingMessage}
                  />
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={sendingMessage || !newMessage.trim()}
                  sx={{ minWidth: '120px', height: '56px' }}
                >
                  {sendingMessage ? <CircularProgress size={24} /> : 'Post Message'}
                </Button>
              </Box>
              {discussionError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {discussionError}
                </Alert>
              )}
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {/* List of discussions */}
            {loadingDiscussions ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress />
              </Box>
            ) : discussions.length > 0 ? (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  Course Discussions ({discussions.length})
                </Typography>
                <List sx={{ width: '100%' }}>
                  {discussions.map((discussion) => (
                    <Box key={discussion.id} sx={{ mb: 3 }}>
                      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Avatar
                            sx={{
                              bgcolor: discussion.user.role.includes('ADMIN') ? 'error.main' :
                                      discussion.user.role.includes('TEACHER') ? 'primary.main' : 'success.main'
                            }}
                          >
                            {discussion.user.firstName.charAt(0)}
                          </Avatar>
                          <Box ml={2}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {discussion.user.firstName} {discussion.user.lastName}
                            </Typography>
                            <Box display="flex" alignItems="center">
                              <Chip 
                                size="small" 
                                label={discussion.user.role.replace('ROLE_', '')}
                                color={discussion.user.role.includes('ADMIN') ? 'error' :
                                      discussion.user.role.includes('TEACHER') ? 'primary' : 'success'}
                                sx={{ mr: 1, height: 20 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(discussion.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                          {discussion.message}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                </List>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  No discussions yet. Be the first to post in this course!
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default CourseContentView;
