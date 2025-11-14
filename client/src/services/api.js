import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = {
  search: async (query, filters = {}) => {
    const params = new URLSearchParams({ q: query });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    const response = await axios.get(`${API_BASE_URL}/search?${params}`);
    return response.data;
  },

  getFilters: async () => {
    const response = await axios.get(`${API_BASE_URL}/search/filters`);
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/search/stats`);
    return response.data;
  },

  getAllDocuments: async () => {
    const response = await axios.get(`${API_BASE_URL}/documents`);
    return response.data;
  },

  getDocument: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/documents/${id}`);
    return response.data;
  },

  uploadFiles: async (files, onProgress) => {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (onProgress) {
          onProgress(percentCompleted);
        }
      }
    });

    return response.data;
  }
};

export default api;
