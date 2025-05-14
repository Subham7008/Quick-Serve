import axiosInstance from './api.config';

const customerService = {
  addCustomer: async (customerData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axiosInstance.post('/customers/addcustomer', customerData);
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to add a customer' };
      }
      throw error.response?.data || error.message;
    }
  },

  getCustomers: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axiosInstance.get('/customers');
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to view customers' };
      }
      throw error.response?.data || error.message;
    }
  }
};

export default customerService;