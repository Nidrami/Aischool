import api from './api';

/**
 * A simplified API service for course content operations
 * that doesn't rely on complex nested objects
 */
export const simpleContentAPI = {
  /**
   * Create content with simple parameters instead of complex nested objects
   */
  createContent: (chapterId, data) => {
    const params = new URLSearchParams();
    params.append('chapterId', chapterId);
    return api.post(`/api/simple-content/create?${params.toString()}`, data);
  },
  
  /**
   * Update content with simple parameters
   */
  updateContent: (contentId, chapterId, data) => {
    const params = new URLSearchParams();
    if (chapterId) {
      params.append('chapterId', chapterId);
    }
    return api.put(`/api/simple-content/update/${contentId}?${params.toString()}`, data);
  }
};

export default simpleContentAPI;
