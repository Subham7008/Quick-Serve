import axiosInstance, { API_URL } from './api.config';

const authService = {
  login: async (user_name, password) => {
    try {
      const response = await axiosInstance.post('/users/login', {
        user_name,
        password
      });
      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      return response.data.data;
    } catch (error) {
      if (!error.response) {
        throw { status: 0, message: 'Unable to connect to the server. Please check if the server is running.' };
      }
      if (error.response?.status === 401) {
        throw { status: 401, message: 'Invalid username or password' };
      }
      throw error.response?.data || { status: error.response?.status || 500, message: error.message };
    }
  },

  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/users/signup', userData);
      if (response.data.data && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      return response.data;
    } catch (error) {
      // The axios interceptor will handle specific error formatting
      // Just log and rethrow the error
      console.error('Registration error:', error.message || 'Unknown error');
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    return token ? { token } : null;
  },

  getProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axiosInstance.get('/users/profile');
      return response.data.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to view your profile' };
      }
      if (!error.response) {
        throw { status: 0, message: 'Unable to connect to the server. Please check if the server is running.' };
      }
      throw error.response?.data || { status: error.response?.status || 500, message: error.message };
    }
  },

  updateProfile: async (userData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axiosInstance.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to update your profile' };
      }
      if (!error.response) {
        throw { status: 0, message: 'Unable to connect to the server. Please check if the server is running.' };
      }
      throw error.response?.data || { status: error.response?.status || 500, message: error.message };
    }
  },
};

export default authService;