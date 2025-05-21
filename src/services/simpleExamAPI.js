import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Extract error message
    if (error.response) {
      try {
        const data = error.response.data;
        
        // Handle JSON error response
        if (typeof data === 'object' && data.error) {
          error.message = data.error;
        } 
        // Handle string response
        else if (typeof data === 'string') {
          // Try to parse as JSON
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              error.message = parsed.error;
            }
          } catch (parseError) {
            // Not JSON, use as is
            error.message = data;
          }
        }
      } catch (e) {
        console.error('Error extracting error message:', e);
      }
    }
    
    return Promise.reject(error);
  }
);

const simpleExamAPI = {
  // Exams
  getAllExams: () => api.get('/api/simple-exams'),
  getExamById: (id) => api.get(`/api/simple-exams/${id}`),
  createExam: (examData) => api.post('/api/simple-exams', examData),
  updateExam: (id, examData) => api.put(`/api/simple-exams/${id}`, examData),
  deleteExam: (id) => api.delete(`/api/simple-exams/${id}`),
  
  // Admin exams
  getAllExamsForAdmin: () => api.get('/api/simple-exams/all'),
  
  // Teacher exams
  getTeacherExams: () => api.get('/api/simple-exams/my-exams'),
  getMyExams: () => api.get('/api/simple-exams/my-exams'), // Alias for getTeacherExams
  
  // Exam submissions
  submitExam: (submissionData) => api.post('/api/simple-exams/submit', submissionData),
  getExamSubmissions: (examId) => api.get(`/api/simple-exams/submissions/${examId}`),
  getStudentSubmissions: () => api.get('/api/simple-exams/submissions/student'),
  
  // Get submission by ID - for teachers/admins
  getSubmissionById: (submissionId) => {
    console.log(`Fetching submission with ID: ${submissionId}`);
    return api.get(`/api/simple-exams/submissions/view/${submissionId}`)
      .catch(error => {
        console.error(`Error fetching submission ${submissionId}:`, error);
        throw error;
      });
  },
  
  // Get submission by ID - for students
  getStudentSubmissionById: (submissionId) => {
    console.log(`Student fetching submission with ID: ${submissionId}`);
    return api.get(`/api/simple-exams/submissions/student/view/${submissionId}`)
      .catch(error => {
        console.error(`Error fetching student submission ${submissionId}:`, error);
        throw error;
      });
  },
  
  // Grade submission
  gradeSubmission: (submissionId, gradeData) => api.post(`/api/simple-exams/submissions/${submissionId}/grade`, gradeData),
};

export default simpleExamAPI;
