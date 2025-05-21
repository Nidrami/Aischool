import api from './api';

export const chapterAPI = {
  getChaptersByCourse: (courseId) => api.get(`/api/chapters/course/${courseId}`),
  createChapter: (chapterData) => api.post('/api/chapters', chapterData),
  updateChapter: (id, chapterData) => api.put(`/api/chapters/${id}`, chapterData),
  deleteChapter: (id) => api.delete(`/api/chapters/${id}`),
};

export default chapterAPI;
