import api from './api';

export const courseContentAPI = {
  getContentsByChapter: (chapterId) => api.get(`/api/course-contents/chapter/${chapterId}`),
  createCourseContent: (contentData) => api.post('/api/course-contents', contentData),
  updateCourseContent: (id, contentData) => api.put(`/api/course-contents/${id}`, contentData),
  deleteCourseContent: (id) => api.delete(`/api/course-contents/${id}`),
  markContentAsCompleted: (id, isCompleted = true) => api.put(`/api/course-contents/${id}/complete`, { isCompleted }),
};

export default courseContentAPI;
