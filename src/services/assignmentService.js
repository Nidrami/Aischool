import axios from 'axios';
import { API_BASE_URL } from '../config';

const assignmentService = {
  createAssignment: async (assignment) => {
    const response = await axios.post(`${API_BASE_URL}/assignments`, assignment);
    return response.data;
  },

  updateAssignment: async (id, assignment) => {
    const response = await axios.put(`${API_BASE_URL}/assignments/${id}`, assignment);
    return response.data;
  },

  deleteAssignment: async (id) => {
    await axios.delete(`${API_BASE_URL}/assignments/${id}`);
  },

  getAssignment: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/assignments/${id}`);
    return response.data;
  },

  getCourseAssignments: async (courseId) => {
    const response = await axios.get(`${API_BASE_URL}/assignments/course/${courseId}`);
    return response.data;
  },

  getStudentAssignments: async () => {
    const response = await axios.get(`${API_BASE_URL}/assignments/student`);
    return response.data;
  }
};

export default assignmentService;
