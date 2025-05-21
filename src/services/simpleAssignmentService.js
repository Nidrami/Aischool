import axios from 'axios';
import { API_BASE_URL } from '../config';

const simpleAssignmentService = {
  createAssignment: async (assignmentData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/simple-assignments`,
        assignmentData,

      );
      return response.data;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  },

  updateAssignment: async (id, assignmentData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/simple-assignments/${id}`,
        assignmentData,

      );
      return response.data;
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  },

  getAssignment: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/simple-assignments/${id}`,

      );
      return response.data;
    } catch (error) {
      console.error('Error fetching assignment:', error);
      throw error;
    }
  },

  getCourseAssignments: async (courseId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/simple-assignments/course/${courseId}`,

      );
      return response.data;
    } catch (error) {
      console.error('Error fetching course assignments:', error);
      throw error;
    }
  },

  getTeacherAssignments: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/simple-assignments/teacher`,

      );
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher assignments:', error);
      throw error;
    }
  },

  getStudentAssignments: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/simple-assignments/student`,

      );
      return response.data;
    } catch (error) {
      console.error('Error fetching student assignments:', error);
      throw error;
    }
  },

  deleteAssignment: async (id) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/simple-assignments/${id}`,

      );
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  },

  // Helper method to submit an assignment (calls the submission service)
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
  }
};

export default simpleAssignmentService;
