import axiosInstance from './api.config';

const customerService = {
  createCustomer: async (customerData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axiosInstance.post('/customers', customerData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to create a customer' };
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
      
      const response = await axiosInstance.get('/customers', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to view customers' };
      }
      throw error.response?.data || error.message;
    }
  },

  getCustomerById: async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axiosInstance.get(`/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to view customer details' };
      }
      if (error.response?.status === 404) {
        throw { status: 404, message: 'Customer not found', details: `Customer with ID ${customerId} was not found.` };
      }
      throw error.response?.data || error.message;
    }
  },

  updateCustomer: async (customerId, customerData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axiosInstance.put(`/customers/${customerId}`, customerData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to update customer' };
      }
      if (error.response?.status === 404) {
        throw { status: 404, message: 'Customer not found', details: `Customer with ID ${customerId} was not found.` };
      }
      throw error.response?.data || error.message;
    }
  },

  deleteCustomer: async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axiosInstance.delete(`/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to delete customer' };
      }
      if (error.response?.status === 404) {
        throw { status: 404, message: 'Customer not found', details: `Customer with ID ${customerId} was not found.` };
      }
      throw error.response?.data || error.message;
    }
  },

  createDevice: async (customerId, deviceData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axiosInstance.post(`/customers/${customerId}/devices`, deviceData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to create a device' };
      }
      if (error.response?.status === 404) {
        throw { status: 404, message: 'Customer not found', details: `Customer with ID ${customerId} was not found.` };
      }
      throw error.response?.data || error.message;
    }
  },

  getDevices: async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axiosInstance.get(`/customers/${customerId}/devices`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to view devices' };
      }
      if (error.response?.status === 404) {
        throw { status: 404, message: 'Customer not found', details: `Customer with ID ${customerId} was not found.` };
      }
      throw error.response?.data || error.message;
    }
  },

  getCustomerServiceRequests: async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axiosInstance.get(`/customers/${customerId}/service-requests`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to view customer service requests' };
      }
      if (error.response?.status === 404) {
        throw { status: 404, message: 'Customer not found', details: `Customer with ID ${customerId} was not found.` };
      }
      throw error.response?.data || error.message;
    }
  }
};

export default customerService;