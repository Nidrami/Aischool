import axios from 'axios';
import { getAuthHeader } from '../utils/auth';

const BASE_URL = 'http://localhost:8080/api';

export const assignmentAPI = {
  getAllAssignments: () => {
    return axios.get(`${BASE_URL}/assignments`, { headers: getAuthHeader() });
  },

  getCourseAssignments: (courseId) => {
    return axios.get(`${BASE_URL}/assignments/course/${courseId}`, { headers: getAuthHeader() });
  },

  getAssignment: (id) => {
    return axios.get(`${BASE_URL}/assignments/${id}`, { headers: getAuthHeader() });
  },

  createAssignment: (assignmentData) => {
    return axios.post(`${BASE_URL}/assignments`, assignmentData, { headers: getAuthHeader() });
  },

  updateAssignment: (id, assignmentData) => {
    return axios.put(`${BASE_URL}/assignments/${id}`, assignmentData, { headers: getAuthHeader() });
  },

  deleteAssignment: (id) => {
    return axios.delete(`${BASE_URL}/assignments/${id}`, { headers: getAuthHeader() });
  },

  // Submission endpoints
  submitAssignment: (assignmentId, submissionData) => {
    return axios.post(`${BASE_URL}/submissions/assignment/${assignmentId}`, submissionData, { headers: getAuthHeader() });
  },

  gradeSubmission: (submissionId, gradeData) => {
    return axios.put(`${BASE_URL}/submissions/${submissionId}/grade`, gradeData, { headers: getAuthHeader() });
  },

  getAssignmentSubmissions: (assignmentId) => {
    return axios.get(`${BASE_URL}/submissions/assignment/${assignmentId}`, { headers: getAuthHeader() });
  },

  getStudentSubmissions: () => {
    return axios.get(`${BASE_URL}/submissions/student`, { headers: getAuthHeader() });
  },
};
