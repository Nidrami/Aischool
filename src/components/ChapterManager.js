import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
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
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VideoLibrary as VideoIcon,
  Description as DocumentIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  MoreVert as MoreIcon,
  CheckCircle as CompletedIcon
} from '@mui/icons-material';
import { chapterAPI } from '../services/chapterAPI';
import { courseContentAPI } from '../services/courseContentAPI';
import ChapterForm from './ChapterForm';
import SimpleContentForm from './SimpleContentForm';
import { simpleContentAPI } from '../services/simpleContentAPI';

const ChapterManager = ({ courseId, isTeacherOrAdmin, chapterCompletionStatus = {}, onChapterStatusChange }) => {
  // Function to check if a content item is completed (using localStorage)
  const isContentCompleted = (contentId) => {
    try {
      const completedItems = JSON.parse(localStorage.getItem('completedContentItems') || '[]');
      console.log('Checking completion for content ID:', contentId, 'Completed items:', completedItems);
      return completedItems.includes(contentId.toString()) || completedItems.includes(parseInt(contentId));
    } catch (error) {
      console.error('Error checking content completion status:', error);
      return false;
    }
  };
  
  // Always initialize with an empty array
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedItems, setCompletedItems] = useState([]);

  // Chapter states
  const [openChapterForm, setOpenChapterForm] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [deleteChapterDialog, setDeleteChapterDialog] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState(null);

  // Content states
  const [openContentForm, setOpenContentForm] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [deleteContentDialog, setDeleteContentDialog] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Menu states
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState(null);
  const [contextChapter, setContextChapter] = useState(null);

  useEffect(() => {
    fetchChapters();
    
    // Load completed items from localStorage
    try {
      const items = JSON.parse(localStorage.getItem('completedContentItems') || '[]');
      setCompletedItems(items);
      console.log('Initial completed items loaded:', items);
    } catch (error) {
      console.error('Error loading completed items from localStorage:', error);
    }
    
    // Listen for content completion events
    const handleContentCompletion = () => {
      console.log('Content completion event received in ChapterManager');
      try {
        const updatedItems = JSON.parse(localStorage.getItem('completedContentItems') || '[]');
        setCompletedItems(updatedItems);
        console.log('Updated completed items:', updatedItems);
        // If needed, refresh chapters to reflect new completion status
        fetchChapters();
      } catch (error) {
        console.error('Error updating completed items after event:', error);
      }
    };
    
    window.addEventListener('contentCompletionChanged', handleContentCompletion);
    
    return () => {
      window.removeEventListener('contentCompletionChanged', handleContentCompletion);
    };
  }, [courseId]);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const response = await chapterAPI.getChaptersByCourse(courseId);
      
      // Ensure response.data is an array
      let chaptersData = [];
      if (response.data) {
        chaptersData = Array.isArray(response.data) ? response.data : [];
        console.log('Chapters data from API:', chaptersData);
        
        // For each chapter, fetch its contents if we only have contentIds
        // This is now handled on the backend with eager loading
      }
      
      setChapters(chaptersData);
      setError(null);
    } catch (err) {
      console.error('Error fetching chapters:', err);
      setError('Failed to load course chapters. Please try again later.');
      setChapters([]); // Ensure chapters is an array even on error
    } finally {
      setLoading(false);
    }
  };

  // Add and update chapters
  const handleAddChapter = () => {
    setSelectedChapter(null);
    setOpenChapterForm(true);
  };

  const handleEditChapter = (chapter) => {
    setSelectedChapter(chapter);
    setOpenChapterForm(true);
    handleCloseMenu();
  };

  const handleChapterFormSubmit = async (chapterData) => {
    try {
      if (selectedChapter) {
        const response = await chapterAPI.updateChapter(selectedChapter.id, chapterData);
        setChapters(prev => prev.map(ch => ch.id === selectedChapter.id ? response.data : ch));
      } else {
        const response = await chapterAPI.createChapter(chapterData);
        setChapters(prev => [...prev, response.data]);
      }
    } catch (err) {
      console.error('Error saving chapter:', err);
      throw err;
    }
  };

  // Delete chapter
  const handleDeleteChapter = (chapter) => {
    setChapterToDelete(chapter);
    setDeleteChapterDialog(true);
    handleCloseMenu();
  };

  const confirmDeleteChapter = async () => {
    try {
      await chapterAPI.deleteChapter(chapterToDelete.id);
      setChapters(prev => prev.filter(ch => ch.id !== chapterToDelete.id));
      setDeleteChapterDialog(false);
    } catch (err) {
      console.error('Error deleting chapter:', err);
    }
  };

  // Content Menu Handlers
  const handleAddContentClick = (e, chapter) => {
    setContextChapter(chapter);
    setAddMenuAnchorEl(e.currentTarget);
  };

  const handleAddContentItemClick = (contentType) => {
    if (!contextChapter || !contextChapter.id) {
      console.error('No chapter selected or chapter has no ID');
      setSnackbar({
        open: true,
        message: 'Error: No chapter selected',
        severity: 'error'
      });
      return;
    }
    
    // Explicitly log the chapter ID to verify it's being set correctly
    console.log('Setting chapter ID for new content:', contextChapter.id);
    
    setSelectedChapterId(contextChapter.id);
    setSelectedContentType(contentType);
    setSelectedContent(null);
    setOpenContentForm(true);
    setAddMenuAnchorEl(null);
  };

  // Chapter Menu Handlers
  const handleChapterMenuOpen = (e, chapter) => {
    setContextChapter(chapter);
    setMenuAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setAddMenuAnchorEl(null);
  };
  
  // Function to return the appropriate icon based on content type
  const getContentIcon = (type) => {
    if (!type) return <DocumentIcon />;
    
    switch (type?.toLowerCase()) {
      case 'video':
        return <VideoIcon />;
      case 'document':
        return <DocumentIcon />;
      case 'assignment':
        return <AssignmentIcon />;
      case 'quiz':
        return <QuizIcon />;
      default:
        return <DocumentIcon />;
    }
  };

  // Content Operations
  const handleEditContent = (content) => {
    if (!content) {
      console.error('No content provided to edit');
      return;
    }
    
    // Ensure content has proper chapter information
    let contentWithChapter = { ...content };
    
    // Extract chapterId from content or context
    const chapterId = content.chapterId || (content.chapter && content.chapter.id) || 
                     (contextChapter ? contextChapter.id : null);
    
    if (!chapterId) {
      console.error('Cannot determine chapter ID for content', content);
      setSnackbar({
        open: true,
        message: 'Error: Cannot determine chapter for this content',
        severity: 'error'
      });
      return;
    }
    
    // Ensure the content has proper chapter object structure
    contentWithChapter.chapter = { id: Number(chapterId) };
    
    // Find the chapter to get the courseId
    const chapter = chapters.find(ch => ch.id === Number(chapterId));
    if (chapter && chapter.course && chapter.course.id) {
      contentWithChapter.course = { id: Number(chapter.course.id) };
    }
    
    console.log('Editing content with prepared data:', contentWithChapter);
    
    setSelectedContent(contentWithChapter);
    setSelectedChapterId(chapterId);
    setOpenContentForm(true);
  };

  const handleDeleteContent = (content) => {
    if (!content) {
      console.error('No content provided to delete');
      return;
    }
    setContentToDelete(content);
    setDeleteContentDialog(true);
  };

  const confirmDeleteContent = async () => {
    try {
      // Show deletion in progress
      setIsDeleting(true);
      
      // Call the API to delete content
      const response = await courseContentAPI.deleteCourseContent(contentToDelete.id);
      
      // Close the dialog first
      setDeleteContentDialog(false);
      
      // Check if deletion was successful
      if (response && response.status === 200) {
        // Add a success notification
        setSnackbar({
          open: true,
          message: 'Content deleted successfully',
          severity: 'success'
        });
        
        // Refresh data from the server with a slight delay
        setTimeout(() => {
          fetchChapters();
        }, 300);
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      console.error('Error deleting content:', err);
      
      // Show a more detailed error message to the user
      setSnackbar({
        open: true,
        message: `Failed to delete content: ${err.message || 'Unknown error'}`,
        severity: 'error'
      });
      
      // Close the dialog despite the error
      setDeleteContentDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handle success from SimpleContentForm
   * This function is passed to SimpleContentForm and gets called when content is successfully saved
   */
  const handleSimpleContentSuccess = (contentData) => {
    console.log('Content saved successfully:', contentData);
    
    // Show success notification
    setSnackbar({
      open: true,
      message: selectedContent ? 'Content updated successfully' : 'Content added successfully',
      severity: 'success'
    });
    
    // Rather than manually updating the state, let's just refresh the chapters data
    // This ensures we have the most up-to-date data from the server
    fetchChapters();
  };
  
  // Keep the old function for reference, but it's no longer used
  // We're now using SimpleContentForm and handleSimpleContentSuccess instead
  const handleContentFormSubmit = async (contentData) => {
    // This function is kept for reference but is no longer used
    console.log('Old content submit function called with:', contentData);
    throw new Error('This function is deprecated. Use SimpleContentForm instead.');
  };

  // Function to render content item with completion indicator
  const renderContentItem = (content, chapter) => {
    const isCompleted = isContentCompleted(content.id);
    console.log(`Content ${content.id} (${content.title}) completion status:`, isCompleted);
    
    return (
      <ListItem 
        key={content.id}
        disablePadding
        secondaryAction={isTeacherOrAdmin && (
          <Box>
            <IconButton 
              edge="end" 
              size="small"
              onClick={() => {
                // Set the chapter context before editing content
                setContextChapter(chapter);
                handleEditContent({...content, chapter: chapter});
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              edge="end" 
              size="small" 
              color="error"
              onClick={() => {
                // Set the chapter context before deleting content
                setContextChapter(chapter);
                handleDeleteContent({...content, chapter: chapter});
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        sx={{ mb: 1 }}
      >
        <ListItemButton 
          component={Link}
          to={`/course/${courseId}/chapter/${chapter.id}/content/${content.id}`}
          sx={{
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}>
          
          <ListItemIcon>
            {isCompleted ? (
              <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
                <CompletedIcon color="success" />
              </Box>
            ) : (
              getContentIcon(content.type)
            )}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1">
                  {content.title}
                </Typography>
                {isCompleted && (
                  <Chip 
                    label="Completed" 
                    size="small" 
                    color="success" 
                    sx={{ ml: 1, height: 20 }}
                  />
                )}
              </Box>
            }
            secondary={`${content.type?.charAt(0).toUpperCase() + content.type?.slice(1) || 'Content'} · ${content.duration || 0} min`}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
        {error}
      </Paper>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Course Content</Typography>
        {isTeacherOrAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddChapter}
          >
            Add Chapter
          </Button>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'error.light' }}>
          <Typography variant="body1" color="error" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={fetchChapters}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Paper>
      ) : (!Array.isArray(chapters) || chapters.length === 0) ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No chapters available yet.
          </Typography>
          {isTeacherOrAdmin && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddChapter}
              sx={{ mt: 2 }}
            >
              Add Your First Chapter
            </Button>
          )}
        </Paper>
      ) : (
        <Box>
          {Array.isArray(chapters) && chapters.map((chapter) => (
            <Accordion key={chapter.id} defaultExpanded={chapters.length === 1}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: chapterCompletionStatus[chapter.id]?.isCompleted ? 'success.main' : 'primary.light',
                  color: 'white',
                  '&:hover': { bgcolor: chapterCompletionStatus[chapter.id]?.isCompleted ? 'success.dark' : 'primary.main' }
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" pr={2}>
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {chapter.title}
                    </Typography>
                    {chapterCompletionStatus[chapter.id] && (
                      <Box ml={2} display="flex" alignItems="center">
                        <CircularProgress
                          variant="determinate"
                          value={chapterCompletionStatus[chapter.id]?.percentage || 0}
                          size={24}
                          thickness={5}
                          sx={{ 
                            color: 'white',
                            mr: 1,
                            opacity: 0.9
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {chapterCompletionStatus[chapter.id]?.percentage || 0}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  {isTeacherOrAdmin && (
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="Add Content">
                        <IconButton 
                          size="small" 
                          sx={{ color: 'white' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddContentClick(e, chapter);
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Chapter Options">
                        <IconButton 
                          size="small" 
                          sx={{ color: 'white' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChapterMenuOpen(e, chapter);
                          }}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                {chapter.description && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      {chapter.description}
                    </Typography>
                    <Divider sx={{ mt: 1 }} />
                  </Box>
                )}
                
                <List disablePadding>
                  {(chapter.contents && Array.isArray(chapter.contents) && chapter.contents.length > 0) ? (
                    // Using contents array directly
                    [...chapter.contents]
                      .filter(content => content !== null && typeof content === 'object')
                      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                      .map((content) => renderContentItem(content, chapter))
                  ) : (
                    <Box textAlign="center" py={2}>
                      <Typography variant="body2" color="text.secondary">
                        No content available in this chapter yet.
                      </Typography>
                      {isTeacherOrAdmin && (
                        <Button
                          variant="text"
                          startIcon={<AddIcon />}
                          size="small"
                          onClick={(e) => handleAddContentClick(e, chapter)}
                          sx={{ mt: 1 }}
                        >
                          Add Content
                        </Button>
                      )}
                    </Box>
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Menus */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleEditChapter(contextChapter)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Chapter</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeleteChapter(contextChapter)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Chapter</ListItemText>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={addMenuAnchorEl}
        open={Boolean(addMenuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleAddContentItemClick('video')}>
          <ListItemIcon>
            <VideoIcon color="primary" />
          </ListItemIcon>
          <ListItemText>Add Video</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAddContentItemClick('document')}>
          <ListItemIcon>
            <DocumentIcon color="info" />
          </ListItemIcon>
          <ListItemText>Add Document</ListItemText>
        </MenuItem>
      </Menu>

      {/* Forms and Dialogs */}
      <ChapterForm
        open={openChapterForm}
        onClose={() => setOpenChapterForm(false)}
        onSubmit={handleChapterFormSubmit}
        initialData={selectedChapter}
        courseId={courseId}
      />

      <SimpleContentForm
        open={openContentForm}
        onClose={() => setOpenContentForm(false)}
        onSuccess={handleSimpleContentSuccess}
        initialData={selectedContent}
        chapterId={selectedChapterId}
        contentType={selectedContentType}
      />

      <Dialog
        open={deleteChapterDialog}
        onClose={() => setDeleteChapterDialog(false)}
      >
        <DialogTitle>Delete Chapter</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the chapter "{chapterToDelete?.title}"?
            This will also delete all content within this chapter.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteChapterDialog(false)}>Cancel</Button>
          <Button onClick={confirmDeleteChapter} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteContentDialog}
        onClose={() => setDeleteContentDialog(false)}
      >
        <DialogTitle>Delete Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{contentToDelete?.title}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteContentDialog(false)}>Cancel</Button>
          <Button onClick={confirmDeleteContent} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChapterManager;
