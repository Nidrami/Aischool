import api from './api';

const progressAPI = {
  // Mark content as completed
  markContentCompleted: (contentId) => {
    return api.post(`/api/progress/content/${contentId}/complete`);
  },
  
  // Update content position (for videos)
  updateContentPosition: (contentId, position) => {
    return api.post(`/api/progress/content/${contentId}/position`, { position });
  },
  
  // Get course progress percentage
  getCourseProgress: (courseId) => {
    return api.get(`/api/progress/course/${courseId}`);
  },
  
  // Get all content progress for a course
  getCourseContentProgress: (courseId) => {
    return api.get(`/api/progress/course/${courseId}/contents`);
  }
};

export default progressAPI;
