import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data
    });
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
    console.log(`API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Don't log 404 errors from teacher application endpoints - these are expected when no application exists
    const isTeacherApplicationEndpoint = error.config?.url?.includes('/api/teacher-applications');
    const is404Error = error.response?.status === 404;
    
    if (!(isTeacherApplicationEndpoint && is404Error)) {
      console.error('Response error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getCurrentUser: () => api.get('/api/auth/me'),
};

export const userAPI = {
  getAllUsers: () => api.get('/api/users'),
  getUser: (id) => api.get(`/api/users/${id}`),
  createUser: (userData) => api.post('/api/users', userData),
  updateUser: (id, userData) => api.put(`/api/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
  getCourseStudents: (courseId) => api.get(`/api/courses/${courseId}/students`),
  getAvailableStudents: (courseId) => api.get(`/api/courses/${courseId}/available-students`),
  changePassword: (oldPassword, newPassword) => 
    api.post('/api/users/change-password', { oldPassword, newPassword }),
};

export const teacherApplicationAPI = {
  axiosInstance: api, // Exposing the axios instance for more control
  getAllApplications: () => api.get('/api/teacher-applications'),
  createApplication: (applicationData) => api.post('/api/teacher-applications', applicationData),
  getApplication: (id) => api.get(`/api/teacher-applications/${id}`),
  approveApplication: (id) => api.post(`/api/teacher-applications/${id}/approve`),
  rejectApplication: (id, reason) => api.post(`/api/teacher-applications/${id}/reject`, reason),
  getCurrentUserApplication: () => api.get('/api/teacher-applications/me'),
};

export const courseAPI = {
  getAllCourses: () => api.get('/api/courses'),
  getCourse: (id) => api.get(`/api/courses/${id}`),
  getCourseCreator: (id) => api.get(`/api/courses/${id}/creator`),
  createCourse: (courseData) => {
    console.log('Creating course with data:', courseData);
    return api.post('/api/courses', courseData)
      .then(response => {
        // Handle potentially malformed JSON in the response
        try {
          console.log('Course created successfully, raw response:', response.data);
          
          // If the response contains malformed JSON (two JSON objects concatenated)
          if (typeof response.data === 'string' && response.data.includes('}{')) {
            // Extract just the first JSON object with the course data
            const firstJsonPart = response.data.substring(0, response.data.indexOf('}{') + 1);
            console.log('Extracted course data part:', firstJsonPart);
            
            try {
              // Parse just the course data part
              return JSON.parse(firstJsonPart);
            } catch (parseError) {
              console.error('Error parsing extracted course data:', parseError);
              // Return a basic object with at least the ID if we can extract it
              const idMatch = firstJsonPart.match(/"id"\s*:\s*(\d+)/);
              if (idMatch && idMatch[1]) {
                return { 
                  id: parseInt(idMatch[1]),
                  title: courseData.title,
                  description: courseData.description 
                };
              }
            }
          }
          
          // If it's already parsed as an object by axios
          if (typeof response.data === 'object') {
            return response.data;
          }
          
          // Fallback: just return the courseData with the ID if we can extract it
          const idMatch = response.data.match(/"id"\s*:\s*(\d+)/);
          if (idMatch && idMatch[1]) {
            return { 
              ...courseData, 
              id: parseInt(idMatch[1]) 
            };
          }
          
          // Last resort fallback
          return { ...courseData, id: new Date().getTime() };
        } catch (error) {
          console.error('Error processing course creation response:', error);
          // Return the input data as fallback with a temporary ID
          return { ...courseData, id: new Date().getTime() };
        }
      })
      .catch(error => {
        console.error('Error creating course:', error.response || error);
        
        // If we have a response with data, try to extract the course info
        if (error.response && error.response.data && typeof error.response.data === 'string') {
          try {
            // The response might contain the course data followed by an error
            if (error.response.data.includes('}{')) {
              const courseDataPart = error.response.data.substring(0, error.response.data.indexOf('}{') + 1);
              const courseData = JSON.parse(courseDataPart);
              return courseData; // Return the course data even though there was an error
            }
          } catch (parseError) {
            console.error('Error parsing course data from error response:', parseError);
          }
        }
        
        throw error;
      });
  },
  updateCourse: (id, courseData) => api.put(`/api/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/api/courses/${id}`),
  enrollInCourse: (courseId) => api.post(`/api/courses/${courseId}/enroll`),
  getEnrolledStudents: (courseId) => api.get(`/api/courses/${courseId}/students`),
  getAvailableStudents: (courseId) => api.get(`/api/courses/${courseId}/available-students`),
  enrollStudent: (courseId, studentId) => api.post(`/api/courses/${courseId}/students/${studentId}`),
  removeStudent: (courseId, studentId) => api.delete(`/api/courses/${courseId}/students/${studentId}`),
  getTeacherCourses: () => api.get('/api/courses/teacher'),
  getStudentCourses: () => {
    return api.get('/api/courses/student');
  },
  getStudentCoursesById: (studentId) => {
    return api.get(`/api/courses/student/${studentId}`);
  },
  getEnrolledCourses: () => api.get('/api/courses/enrolled'),
  addTestStudents: (courseId) => api.post(`/api/courses/${courseId}/add-test-students`),
};

// We've transitioned from assignments to exercises system
// Keeping this as a placeholder to avoid breaking existing code
export const assignmentAPI = {
  createAssignment: (_, assignmentData) => api.post('/api/assignments', assignmentData),
  getAssignment: (id) => api.get(`/api/assignments/${id}`),
  getAssignmentById: (id) => {
    console.log('Fetching assignment details for ID:', id);
    return api.get(`/api/assignments/${id}`)
      .then(response => {
        console.log('Assignment details received:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Error fetching assignment details:', error);
        throw error;
      });
  },
  updateAssignment: (id, assignmentData) => api.put(`/api/assignments/${id}`, assignmentData),
  deleteAssignment: (id) => api.delete(`/api/assignments/${id}`),
  submitAssignment: (submissionData) => {
    console.log('API: Submitting assignment with data:', submissionData);
    // Get the auth token from local storage
    const token = localStorage.getItem('token');
    
    // Create headers with the auth token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
    
    // Log the request details
    console.log('API: Request headers:', headers);
    console.log('API: Request URL:', '/api/submissions');
    
    // Make the request with explicit headers
    return api.post('/api/submissions', submissionData, { headers })
      .then(response => {
        console.log('API: Submission successful, response:', response.data);
        return response.data; // Return just the data part of the response
      })
      .catch(error => {
        console.error('API: Error submitting assignment:', error.response || error);
        throw error;
      });
  },
  getSubmission: (submissionId) => api.get(`/api/submissions/${submissionId}`),
  gradeSubmission: (submissionId, gradeData) => api.post(`/api/submissions/${submissionId}/grade`, gradeData),
  getStudentSubmissions: (studentId) => api.get(`/api/students/${studentId}/submissions`),
  getStudentAssignments: () => api.get('/api/assignments/student'),
  getAssignmentQuestions: (assignmentId) => api.get(`/api/assignments/${assignmentId}/questions`),
};

export const questionAPI = {
  getQuestions: (assignmentId) => api.get(`/api/questions/assignment/${assignmentId}`),
  createQuestion: (questionData) => api.post('/api/questions', questionData),
  updateQuestion: (id, questionData) => api.put(`/api/questions/${id}`, questionData),
  deleteQuestion: (id) => api.delete(`/api/questions/${id}`),
  getQuestion: (id) => api.get(`/api/questions/${id}`),
};

export const submissionAPI = {
  getStudentSubmissions: () => api.get('/api/submissions/student'),
  getAssignmentSubmission: (assignmentId) => api.get(`/api/submissions/assignment/${assignmentId}/student`),
  getAllSubmissions: () => api.get('/api/submissions'),
  getSubmission: (id) => api.get(`/api/submissions/${id}`),
  gradeSubmission: (id, submissionData) => api.put(`/api/submissions/${id}/grade`, submissionData),
  createSubmission: (submissionData) => api.post('/api/submissions', submissionData),
};

export default api;
