import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Making request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Received response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const teacherApplicationAPI = {
  getAllApplications: () => api.get('/teacher-applications'),
  createApplication: (applicationData) => api.post('/teacher-applications', applicationData),
  getApplication: (id) => api.get(`/teacher-applications/${id}`),
  approveApplication: (id) => api.post(`/teacher-applications/${id}/approve`),
  rejectApplication: (id, reason) => api.post(`/teacher-applications/${id}/reject`, reason),
};

export const courseAPI = {
  getAllCourses: () => api.get('/courses'),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollInCourse: (courseId) => api.post(`/courses/${courseId}/enroll`),
};

export const assignmentAPI = {
  getCourseAssignments: (courseId) => api.get(`/courses/${courseId}/assignments`),
  createAssignment: (courseId, assignmentData) => 
    api.post(`/courses/${courseId}/assignments`, assignmentData),
  submitAssignment: (assignmentId, submissionData) =>
    api.post(`/assignments/${assignmentId}/submit`, submissionData),
  gradeSubmission: (submissionId, gradeData) =>
    api.post(`/submissions/${submissionId}/grade`, gradeData),
};

export const liveSessionAPI = {
  getCourseSessions: (courseId) => api.get(`/courses/${courseId}/live-sessions`),
  createSession: (courseId, sessionData) =>
    api.post(`/courses/${courseId}/live-sessions`, sessionData),
  updateSession: (sessionId, sessionData) =>
    api.put(`/live-sessions/${sessionId}`, sessionData),
  deleteSession: (sessionId) => api.delete(`/live-sessions/${sessionId}`),
  getAllSessions: () => api.get('/live-sessions'),
  getUpcomingSessions: () => api.get('/live-sessions/upcoming'),
  getSessionById: (id) => api.get(`/live-sessions/${id}`),
};

export default api;
