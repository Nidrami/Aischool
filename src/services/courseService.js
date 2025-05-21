import axios from 'axios';
import { API_BASE_URL } from '../config';
import api from './api';

const courseService = {
  getAllCourses: async () => {
    const response = await axios.get(`${API_BASE_URL}/courses`);
    return response.data;
  },

  getCourse: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/courses/${id}`);
    return response.data;
  },

  createCourse: async (course) => {
    const response = await axios.post(`${API_BASE_URL}/courses`, course);
    return response.data;
  },

  updateCourse: async (id, course) => {
    const response = await axios.put(`${API_BASE_URL}/courses/${id}`, course);
    return response.data;
  },

  deleteCourse: async (id) => {
    await axios.delete(`${API_BASE_URL}/courses/${id}`);
  },

  getTeacherCourses: async () => {
    const response = await axios.get(`${API_BASE_URL}/courses/teacher`);
    return response.data;
  },

  getStudentCourses: async () => {
    const response = await axios.get(`${API_BASE_URL}/courses/student`);
    return response.data;
  },

  enrollStudent: async (courseId, studentId) => {
    const response = await axios.post(`${API_BASE_URL}/courses/${courseId}/enroll/${studentId}`);
    return response.data;
  },

  unenrollStudent: async (courseId, studentId) => {
    await axios.delete(`${API_BASE_URL}/courses/${courseId}/enroll/${studentId}`);
  },

  // Methods for wallet and enrollment integration
  checkEnrollment: async (courseId) => {
    return await api.get(`/api/courses/${courseId}/enrollment-status`);
  },

  enrollInCourse: async (courseId) => {
    return await api.post(`/api/courses/${courseId}/enroll`);
  },

  purchaseCourse: async (courseId) => {
    return await api.post(`/api/courses/purchase/${courseId}`);
  },

  getCourseContent: async (courseId) => {
    const response = await api.get(`/api/courses/${courseId}/content`);
    return response.data;
  },

  getCourseChapters: async (courseId) => {
    const response = await api.get(`/api/courses/${courseId}/chapters`);
    return response.data;
  }
};

export default courseService;
