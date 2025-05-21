import axios from 'axios';
import { API_BASE_URL } from '../config';

const simpleSubmissionService = {
  submitAssignment: async (submissionData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/simple-submissions`,
        submissionData,

      );
      return response.data;
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw error;
    }
  },

  getSubmission: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/simple-submissions/${id}`,

      );
      return response.data;
    } catch (error) {
      console.error('Error fetching submission:', error);
      throw error;
    }
  },

  getAssignmentSubmissions: async (assignmentId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/simple-submissions/assignment/${assignmentId}`,

      );
      return response.data;
    } catch (error) {
      console.error('Error fetching assignment submissions:', error);
      throw error;
    }
  },

  getStudentSubmissions: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/simple-submissions/student`,

      );
      return response.data;
    } catch (error) {
      console.error('Error fetching student submissions:', error);
      throw error;
    }
  },

  getStudentAssignmentSubmission: async (assignmentId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/simple-submissions/student/assignment/${assignmentId}`,

      );
      return response.data;
    } catch (error) {
      // If no content (204), return null
      if (error.response && error.response.status === 204) {
        return null;
      }
      console.error('Error fetching student assignment submission:', error);
      throw error;
    }
  },

  // Grading functionality removed as assignments are no longer graded in this system
};

export default simpleSubmissionService;
