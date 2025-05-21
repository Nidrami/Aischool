import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Alert,
  Breadcrumbs,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
} from '@mui/material';
import {
  PlayCircleOutline as PlayIcon,
  Assignment as AssignmentIcon,
  Article as DocumentIcon,
  Quiz as QuizIcon,
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as IncompleteIcon,
  NavigateNext,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  MenuBook as ChapterIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { courseContentAPI } from '../services/courseContentAPI';
import progressAPI from '../services/progressAPI';
import ReactPlayer from 'react-player/lazy';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import SimpleContentForm from './SimpleContentForm';

// Completion Badge Component for better UI
const CompletionBadge = ({ completed, onClick }) => {
  return completed ? (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'success.light',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'success.main',
        mb: 2
      }}
    >
      <CompletedIcon color="success" sx={{ mr: 1 }} />
      <Typography variant="subtitle1" color="success.dark" fontWeight="bold">
        Lesson Completed
      </Typography>
    </Paper>
  ) : (
    <Button
      variant="contained"
      color="success"
      onClick={onClick}
      startIcon={<CompletedIcon />}
      sx={{ borderRadius: 1 }}
    >
      Mark as Completed
    </Button>
  );
};

const CourseContentPlayer=({ onChapterStatusChange = () => {} }) => {
  const { courseId, chapterId, contentId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [content, setContent] = useState(null);
  const [contentList, setContentList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [error, setError] = useState('');
  const [progressUpdated, setProgressUpdated] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [completionSuccess, setCompletionSuccess] = useState(false);
  
  // Admin controls state
  const [openContentForm, setOpenContentForm] = useState(false);
  const [editContent, setEditContent] = useState(null);
  
  // Check if user is admin, teacher, or course creator
  const hasEditPermission = () => {
    if (!user || !course) return false;
    
    // If user is admin or teacher, they always have permission
    const roles = user.roles || [];
    const isAdminOrTeacher = roles.some(role => 
      ['ADMIN', 'TEACHER', 'ROLE_ADMIN', 'ROLE_TEACHER'].includes(role));
    
    if (isAdminOrTeacher) return true;
    
    // Check if user is the creator of the course
    const isCourseCreator = course.teacherId === user.id;
    
    return isCourseCreator;
  };
  
  // Handle content editing for admins and course creators
  const handleEditContent = () => {
    setEditContent(content);
    setOpenContentForm(true);
  };
  
  // Handle adding new content
  const handleAddContent = () => {
    setEditContent(null);
    setOpenContentForm(true);
  };
  
  // Handle content form success
  const handleContentFormSuccess = (updatedContent) => {
    console.log('Content updated successfully:', updatedContent);
    setOpenContentForm(false);
    setEditContent(null);
    
    // Replace the content in the current view if editing existing content
    if (updatedContent && updatedContent.id === parseInt(contentId)) {
      setContent(updatedContent);
    }
    
    // Refresh the content list if needed
    fetchCourseData();
    
    // Show success message
    alert(editContent ? 'Content updated successfully!' : 'Content added successfully!');
  };
  
  useEffect(() => {
    fetchCourseData();
  }, [courseId]);
  
  useEffect(() => {
    // This effect runs when chapter and content are directly fetched
    if (chapter && content) {
      console.log('Working with directly fetched chapter and content');
      
      // Prepare the flat content list for navigation - either from the chapter or by fetching all contents
      const prepareContentList = async () => {
        try {
          let allContent = [];
          
          // If chapter has contents array, use it
          const contentArray = chapter.contents || chapter.content;
          if (Array.isArray(contentArray) && contentArray.length > 0) {
            allContent = contentArray.map(c => ({
              ...c,
              chapterId: chapter.id,
              chapterTitle: chapter.title
            }));
          } else {
            // Otherwise fetch chapter contents
            try {
              const response = await fetch(`/api/course-contents/chapter/${chapter.id}`);
              if (response.ok) {
                const contentsData = await response.json();
                allContent = contentsData.map(c => ({
                  ...c,
                  chapterId: chapter.id,
                  chapterTitle: chapter.title
                }));
              }
            } catch (error) {
              console.error('Error fetching chapter contents for navigation:', error);
            }
          }
          
          if (allContent.length > 0) {
            setContentList(allContent);
            
            // Find current index for navigation
            const index = allContent.findIndex(c => c.id === parseInt(contentId));
            if (index !== -1) {
              setCurrentIndex(index);
            }
          }
        } catch (error) {
          console.error('Error preparing content list:', error);
        }
      };
      
      prepareContentList();
    }
  }, [chapter, content, contentId]);
  
  // Effect to fetch the content when the content ID changes
  useEffect(() => {
    if (contentId) {
      fetchCourseData();
    }
  }, [contentId]);
  
  // Additional effect to check if content is loaded and apply completion status
  useEffect(() => {
    if (content && !content.completed) {
      try {
        // Check if this content is already marked as completed in localStorage
        const completedItems = JSON.parse(localStorage.getItem('completedContentItems') || '[]');
        if (completedItems.includes(contentId)) {
          console.log('Content was previously completed - updating status');
          // Update displayed content with completion status
          setContent(prev => ({
            ...prev,
            completed: true
          }));
        }
      } catch (err) {
        console.error('Error checking localStorage for completion status:', err);
      }
    }
  }, [content, contentId]);

  // Effect to clear loading state after all data is processed
  useEffect(() => {
    if (error || (course && chapter && content)) {
      setLoading(false);
    }
  }, [course, chapter, content, error]);
  
  // Reset completion success state after showing notification
  useEffect(() => {
    if (completionSuccess) {
      const timer = setTimeout(() => {
        setCompletionSuccess(false);
      }, 3000); // Match the timeout duration from the notification display
      
      return () => clearTimeout(timer);
    }
  }, [completionSuccess]);
  
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Check localStorage for completion status
      let completedItems = [];
      try {
        completedItems = JSON.parse(localStorage.getItem('completedContentItems') || '[]');
        console.log('Found completed items in localStorage:', completedItems);
      } catch (storageError) {
        console.error('Error reading localStorage completion status:', storageError);
      }
      
      // Fetch course data
      const courseResponse = await courseAPI.getCourse(courseId);
      console.log('Course API Response:', courseResponse.data);
      
      if (courseResponse.data) {
        setCourse(courseResponse.data);
        
        // If chapter ID and content ID are provided, fetch them directly
        if (chapterId && contentId) {
          // Fetch chapter data
          try {
            // Fetch the specific chapter directly
            const chapterResponse = await fetch(`/api/chapters/${chapterId}`);
            if (chapterResponse.ok) {
              const chapterData = await chapterResponse.json();
              console.log('Chapter API Response:', chapterData);
              setChapter(chapterData);
            } else {
              console.error('Chapter fetch failed with status:', chapterResponse.status);
              // Try alternative fetch method for the chapter
              try {
                const chaptersResponse = await fetch(`/api/chapters/course/${courseId}`);
                if (chaptersResponse.ok) {
                  const chaptersData = await chaptersResponse.json();
                  console.log('Chapters by course API Response:', chaptersData);
                  const foundChapter = chaptersData.find(ch => ch.id === parseInt(chapterId));
                  if (foundChapter) {
                    console.log('Found chapter in course chapters:', foundChapter);
                    setChapter(foundChapter);
                  } else {
                    console.error('Chapter not found in course chapters');
                  }
                }
              } catch (chaptersError) {
                console.error('Alternative chapter fetch failed:', chaptersError);
              }
            }
          } catch (error) {
            console.error('Error fetching chapter:', error);
          }
          
          // Fetch content data - separate try/catch block to avoid syntax issues
          try {
            // Try to fetch the specific content directly
            const contentResponse = await courseContentAPI.getContent(contentId);
            console.log('Content API Response:', contentResponse.data);
            if (contentResponse.data) {
              // Check if this content is marked as completed in localStorage
              let contentData = contentResponse.data;
              try {
                const completedItems = JSON.parse(localStorage.getItem('completedContentItems') || '[]');
                if (completedItems.includes(contentId)) {
                  // Update the completion status based on localStorage
                  console.log('Applying completion status from localStorage for content ID:', contentId);
                  contentData = {
                    ...contentData,
                    completed: true
                  };
                }
              } catch (storageError) {
                console.error('Error checking localStorage completion for content:', storageError);
              }
              setContent(contentData);
            }
          } catch (contentError) {
            console.error('Content fetch failed:', contentError);
            // Try to fetch from chapter contents API
            try {
              const chapterContentsResponse = await fetch(`/api/course-contents/chapter/${chapterId}`);
              if (chapterContentsResponse.ok) {
                const contentsData = await chapterContentsResponse.json();
                console.log('Chapter contents API Response:', contentsData);
                let foundContent = contentsData.find(c => c.id === parseInt(contentId));
                
                if (foundContent) {
                  console.log('Found content in chapter contents:', foundContent);
                  
                  // Check if this content is marked as completed in localStorage
                  try {
                    const completedItems = JSON.parse(localStorage.getItem('completedContentItems') || '[]');
                    if (completedItems.includes(contentId)) {
                      // Update the completion status based on localStorage
                      console.log('Applying completion status from localStorage for alternative content fetch');
                      foundContent = {
                        ...foundContent,
                        completed: true
                      };
                    }
                  } catch (storageError) {
                    console.error('Error checking localStorage for alternative content fetch:', storageError);
                  }
                  
                  setContent(foundContent);
                }
              }
            } catch (chapterContentsError) {
              console.error('Chapter contents fetch failed:', chapterContentsError);
            }
          }
        }
      } else {
        setError('Failed to load course');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Error loading course data');
    } finally {
      setLoading(false);
    }
  };
  
  const markContentAsCompleted = async () => {
    try {
      console.log('Marking content as completed. Content ID:', contentId);
      
      // Only mark the content as completed if it hasn't been marked already
      if (content && !content.completed) {
        // Try to call the API, but don't fail if it's not available in development
        try {
          const response = await progressAPI.markContentCompleted(contentId);
          console.log('Content marked as completed on server:', response);
        } catch (apiError) {
          console.warn('API call to mark content failed, using local storage only:', apiError);
        }
        
        // Update the local state
        setContent(prev => ({
          ...prev,
          completed: true
        }));
        
        // Show success notification
        setCompletionSuccess(true);
        
        // Store completion in localStorage for persistence
        try {
          const completedItems = JSON.parse(localStorage.getItem('completedContentItems') || '[]');
          const contentIdStr = contentId.toString();
          const contentIdInt = parseInt(contentId);
          
          if (!completedItems.includes(contentIdStr) && !completedItems.includes(contentIdInt)) {
            completedItems.push(contentIdStr);
            localStorage.setItem('completedContentItems', JSON.stringify(completedItems));
            console.log('Updated localStorage with newly completed content:', contentId);
            
            // Dispatch a custom event to notify that completion status has changed
            // This will trigger re-calculation in CourseContentView and ChapterManager
            const completionEvent = new CustomEvent('contentCompletionChanged', {
              detail: { contentId, completed: true }
            });
            window.dispatchEvent(completionEvent);
            console.log('Dispatched contentCompletionChanged event');
            
            // Call any onChapterStatusChange prop if provided
            if (typeof onChapterStatusChange === 'function') {
              onChapterStatusChange();
            }
          }
        } catch (storageError) {
          console.error('Error updating localStorage for completed content:', storageError);
        }
        
        // Update the visual indicator
        const completionIndicator = document.createElement('div');
        completionIndicator.innerHTML = `
          <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #4caf50;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            z-index: 9999;
            display: flex;
            align-items: center;
            font-weight: bold;
          ">
            <svg style="margin-right: 8px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="white" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Lesson Completed!
          </div>
        `;
        document.body.appendChild(completionIndicator);
        
        // Remove the indicator after 3 seconds
        setTimeout(() => {
          document.body.removeChild(completionIndicator);
        }, 3000);
        
        // Trigger a manual refresh of any listeners
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('contentCompletionChanged', {
            detail: { contentId, completed: true, refreshTrigger: true }
          }));
        }, 300);
      } else {
        console.log('Content is already marked as completed');
      }
    } catch (error) {
      console.error('Error marking content as completed:', error);
    }
  };
  
  const updateVideoProgress = async (position) => {
    try {
      await progressAPI.updateContentPosition(contentId, Math.floor(position));
      setVideoProgress(position);
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
  };
  
  const handleVideoProgress = (state) => {
    const currentTime = state.playedSeconds;
    // Update progress every 10 seconds or when 90% complete
    if (Math.floor(currentTime) % 10 === 0 || state.played > 0.9) {
      updateVideoProgress(currentTime);
    }
    
    // Mark as completed if watched more than 90%
    if (state.played > 0.9 && !content?.completed && !progressUpdated) {
      markContentAsCompleted();
    }
  };
  
  const navigateToContent = (direction) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < contentList.length) {
      const nextContent = contentList[newIndex];
      navigate(`/course/${courseId}/chapter/${nextContent.chapterId}/content/${nextContent.id}`);
    }
  };
  
  // Return appropriate icon component based on content type
  const getContentTypeIcon = (type) => {
    if (!type) return <DocumentIcon fontSize="small" />;
    
    switch (type.toLowerCase()) {
      case 'video':
        return <PlayIcon fontSize="small" />;
      case 'document':
        return <DocumentIcon fontSize="small" />;
      case 'assignment':
        return <AssignmentIcon fontSize="small" />;
      case 'quiz':
        return <QuizIcon fontSize="small" />;
      default:
        return <DocumentIcon fontSize="small" />;
    }
  };
  
  // Utility function to determine if a URL is from YouTube
  const isYouTubeUrl = (url) => {
    if (!url) return false;
    
    // Match standard YouTube URLs
    const youtubeRegex = /(?:youtube\.com|youtu\.be)/i;
    return youtubeRegex.test(url);
  };
  
  const renderContentByType = () => {
    if (!content) {
      console.log('No content to render');
      return (
        <Box p={4} textAlign="center">
          <Typography variant="h6" color="error" gutterBottom>Content not available</Typography>
          <Typography variant="body2">Unable to load the content. Please try again or contact support.</Typography>
        </Box>
      );
    }
    
    console.log('Rendering content type:', content.type, 'with content:', content.content);
    
    switch (content.type?.toLowerCase()) {
      case 'video':
        return (
          <Box>
            {/* Video player with proper error handling */}
            <Box sx={{ width: '100%', paddingTop: '56.25%', position: 'relative', mb: 2 }}>
              {content.content ? (
                <ReactPlayer
                  ref={playerRef}
                  url={content.content}
                  width="100%"
                  height="100%"
                  style={{ position: 'absolute', top: 0, left: 0 }}
                  controls
                  light={true} // Thumbnail preview before playing
                  playIcon={<PlayIcon style={{ fontSize: 80, color: '#fff' }} />}
                  onProgress={handleVideoProgress}
                  onEnded={() => markContentAsCompleted()}
                  progressInterval={1000}
                  config={{
                    youtube: {
                      playerVars: { 
                        showinfo: 1,
                        rel: 0,     // Don't show related videos
                        modestbranding: 1 // Hide YouTube logo
                      }
                    },
                    file: {
                      forceVideo: true
                    }
                  }}
                />
              ) : (
                <Box 
                  sx={{ 
                    height: '100%', 
                    width: '100%', 
                    bgcolor: 'black', 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <Typography variant="body1">Video URL not provided</Typography>
                </Box>
              )}
            </Box>
            
            {/* Optional description */}
            {content.description && (
              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Typography variant="body1" whiteSpace="pre-wrap">
                    {content.description}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        );
        
      case 'document':
        return (
          <Box>
            {/* Document content with markdown support */}
            <Paper 
              variant="outlined"
              sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: 'background.paper',
                boxShadow: 1,
                maxWidth: '100%', 
                overflow: 'auto',
                mb: 3
              }}
            >
              {content.content ? (
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: props => <Typography variant="h4" gutterBottom {...props} />,
                    h2: props => <Typography variant="h5" gutterBottom {...props} />,
                    h3: props => <Typography variant="h6" gutterBottom {...props} />,
                    p: props => <Typography variant="body1" paragraph {...props} />,
                    a: props => <Link color="primary" {...props} />,
                    img: props => <img style={{ maxWidth: '100%', height: 'auto' }} {...props} alt={props.alt || ''} />,
                    pre: props => <Paper sx={{ p: 2, my: 2, bgcolor: 'grey.100', overflow: 'auto' }}><pre style={{ margin: 0 }} {...props} /></Paper>,
                    code: props => <code style={{ backgroundColor: '#f5f5f5', padding: '0.2em 0.4em', borderRadius: 3 }} {...props} />
                  }}
                >
                  {content.content}
                </ReactMarkdown>
              ) : (
                <Typography variant="body1" color="error">No content available</Typography>
              )}
            </Paper>
          </Box>
        );
        
      default:
        return (
          <Box>
            <Paper 
              variant="outlined"
              sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: 'background.paper',
                boxShadow: 1
              }}
            >
              <Typography variant="h6" gutterBottom>Content</Typography>
              <Divider sx={{ mb: 2 }} />
              
              {content.content ? (
                <Typography variant="body1" whiteSpace="pre-wrap">
                  {content.content}
                </Typography>
              ) : (
                <Typography variant="body1" color="text.secondary" fontStyle="italic">
                  No additional content available for this lesson.
                </Typography>
              )}
            </Paper>
          </Box>
        );
    }
  };
  
  const renderSidebar = () => {
    // Return early if course is not loaded yet
    if (!course) {
      return (
        <Box sx={{ p: 2, width: 280 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ mt: 1 }}>Loading course...</Typography>
        </Box>
      );
    }
    
    return (
      <Box
        sx={{
          width: 280,
          p: 2,
          borderRight: '1px solid',
          borderColor: 'divider',
          height: '100%',
          overflow: 'auto',
          display: showSidebar ? 'block' : 'none'
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <SchoolIcon sx={{ mr: 1 }} />
          Course Content
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {course?.chapters?.map((chap, chapIndex) => (
          <Box key={chap.id} sx={{ mb: 2 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1, 
                py: 1,
                px: 1,
                bgcolor: chap.id === parseInt(chapterId) ? 'action.selected' : 'transparent',
                borderRadius: 1
              }}
            >
              <ChapterIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography sx={{ fontWeight: 'medium' }}>
                {chapIndex + 1}. {chap.title}
              </Typography>
            </Box>
            
            <List dense disablePadding>
              {chap.content?.map((cont, contIndex) => (
                <ListItem
                  key={cont.id}
                  disablePadding
                  sx={{
                    bgcolor: cont.id === parseInt(contentId) ? 'action.selected' : 'transparent',
                    borderRadius: 1,
                    mb: 0.5
                  }}
                >
                  <ListItemButton
                    component={Link}
                    to={`/course/${courseId}/chapter/${chap.id}/content/${cont.id}`}
                    sx={{
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {cont.completed ? (
                        <CompletedIcon fontSize="small" color="success" />
                      ) : (
                        <IncompleteIcon fontSize="small" color="disabled" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${chapIndex + 1}.${contIndex + 1} ${cont.title}`}
                      secondary={cont.type}
                      primaryTypographyProps={{ 
                        variant: 'body2',
                        fontWeight: cont.id === parseInt(contentId) ? 'bold' : 'regular'
                      }}
                      secondaryTypographyProps={{ 
                        variant: 'caption',
                        color: 'text.secondary'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>
    );
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 64px)">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={4} textAlign="center">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Back to Courses
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Top Navigation with breadcrumbs and admin controls */}
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
          <Link to="/courses" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Courses
          </Link>
          <Link to={`/course/${courseId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {course?.title || 'Course'}
          </Link>
          <Typography color="text.primary">
            {content?.title || 'Content'}
          </Typography>
        </Breadcrumbs>
        
        {/* Admin Controls */}
        {hasEditPermission() && (
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEditContent}
              disabled={!content}
              sx={{ mr: 1 }}
            >
              Edit Content
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={handleAddContent}
              sx={{ mr: 1 }}
            >
              Add Content
            </Button>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate(`/course/${courseId}`)}
            >
              Back to Course
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        {renderSidebar()}
        
        {/* Content Area */}
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: 'auto',
            height: '100%',
            position: 'relative',
            width: showSidebar ? 'calc(100% - 280px)' : '100%',
          }}
        >
          {/* Content display */}
          {content && (
            <Box>
              {/* Title and metadata */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {content.title}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <Chip
                      size="small"
                      label={content.type?.charAt(0).toUpperCase() + content.type?.slice(1) || 'Unknown'}
                      color="primary"
                      variant="outlined"
                      icon={getContentTypeIcon(content.type)}
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {content.duration} min
                    </Typography>
                  </Box>
                </Box>
                {content.completed && (
                  <Chip 
                    size="small" 
                    icon={<CompletedIcon />}
                    label="Completed"
                    color="success"
                  />
                )}
              </Box>
              
              {/* Toggle sidebar button */}
              <Box position="absolute" top={16} right={16}>
                <IconButton 
                  onClick={() => setShowSidebar(!showSidebar)}
                  size="small"
                  color="primary"
                >
                  {showSidebar ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              {/* Content rendering */}
              {renderContentByType()}
              
              {/* Mark as Completed button - centralized */}
              <Box display="flex" justifyContent="center" my={3}>
                <CompletionBadge completed={content.completed} onClick={markContentAsCompleted} />
              </Box>
              
              {/* Navigation buttons */}
              <Box 
                display="flex" 
                justifyContent="space-between" 
                mt={4}
                pb={4}
              >
                <Button
                  variant="outlined"
                  startIcon={<PrevIcon />}
                  onClick={() => navigateToContent(1)}
                  disabled={currentIndex === contentList.length - 1}
                >
                  Next Lesson
                </Button>
                
                <Button
                  variant="outlined"
                  endIcon={<NextIcon />}
                  onClick={() => navigateToContent(-1)}
                  disabled={currentIndex === 0}
                >
                  Previous Lesson
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Content Edit Form Dialog */}
      {hasEditPermission() && (
        <SimpleContentForm
          open={openContentForm}
          onClose={() => setOpenContentForm(false)}
          onSuccess={handleContentFormSuccess}
          initialData={editContent}
          chapterId={parseInt(chapterId)}
          contentType={editContent ? null : 'video'} // Default to video for new content
        />
      )}
    </Box>
  );
};

export default CourseContentPlayer;
