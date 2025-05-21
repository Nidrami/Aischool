import { userAPI } from './api';

const userService = {
  getAllUsers: async () => {
    const response = await userAPI.getAllUsers();
    return response.data;
  },

  getUser: async (id) => {
    const response = await userAPI.getUser(id);
    return response.data;
  },
  
  getUserById: async (id) => {
    try {
      console.log('Fetching user with ID:', id);
      const response = await userAPI.getUser(id);
      console.log('User data response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      
      // Try to extract a meaningful error message
      let errorMessage = 'Failed to fetch user details';
      
      if (error.response) {
        if (error.response.data && typeof error.response.data === 'object') {
          if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (typeof error.response.data === 'string') {
          try {
            const parsedError = JSON.parse(error.response.data);
            if (parsedError.error) {
              errorMessage = parsedError.error;
            }
          } catch (parseError) {
            errorMessage = error.response.data || errorMessage;
          }
        }
        
        if (error.response.status === 404) {
          errorMessage = 'User not found';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  createUser: async (userData) => {
    const response = await userAPI.createUser(userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await userAPI.updateUser(id, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    await userAPI.deleteUser(id);
  },

  getCurrentUser: async () => {
    const response = await userAPI.getCurrentUser();
    return response.data;
  },

  getCourseStudents: async (courseId) => {
    const response = await userAPI.getCourseStudents(courseId);
    return response.data;
  },

  getAvailableStudents: async (courseId) => {
    const response = await userAPI.getAvailableStudents(courseId);
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await userAPI.changePassword(oldPassword, newPassword);
    return response.data;
  }
};

export default userService;
