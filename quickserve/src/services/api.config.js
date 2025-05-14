import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor with enhanced error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject({
        status: 401,
        message: 'Your session has expired. Please login again.'
      });
    }
    
    // Handle conflict errors (409) - typically duplicate resources
    if (error.response?.status === 409) {
      const errorData = error.response.data?.data || {};
      return Promise.reject({
        status: 409,
        message: error.response.data?.message || 'Resource already exists',
        field: errorData.field,
        value: errorData.value,
        code: errorData.code || 'DUPLICATE_RESOURCE'
      });
    }
    
    // Handle validation errors (400)
    if (error.response?.status === 400) {
      return Promise.reject({
        status: 400,
        message: error.response.data?.message || 'Invalid input data',
        errors: error.response.data?.data || [],
        code: error.response.data?.data?.code || 'VALIDATION_ERROR'
      });
    }

    // Handle not found errors (404)
    if (error.response?.status === 404) {
      return Promise.reject({
        status: 404,
        message: error.response.data?.message || 'Resource not found',
        code: 'NOT_FOUND'
      });
    }

    // Handle server errors (500+)
    if (error.response?.status >= 500) {
      return Promise.reject({
        status: error.response.status,
        message: 'Server error. Please try again later.',
        code: 'SERVER_ERROR'
      });
    }
    
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR'
      });
    }
    
    // Handle any other errors with consistent format
    if (error.response) {
      return Promise.reject({
        status: error.response.status,
        message: error.response.data?.message || 'An error occurred',
        data: error.response.data?.data,
        code: error.response.data?.data?.code || `ERROR_${error.response.status}`
      });
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { API_URL };