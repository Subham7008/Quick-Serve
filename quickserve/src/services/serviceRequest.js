import axiosInstance from './api.config';

const serviceRequestService = {
  createServiceRequest: async (requestData) => {
    try {
      const response = await axiosInstance.post('/service-requests', requestData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getServiceRequests: async () => {
    try {
      const response = await axiosInstance.get('/service-requests');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getServiceRequestById: async (id) => {
    try {
      const response = await axiosInstance.get(`/service-requests/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateServiceRequest: async (id, requestData) => {
    try {
      const response = await axiosInstance.put(`/service-requests/${id}`, requestData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteServiceRequest: async (id) => {
    try {
      const response = await axiosInstance.delete(`/service-requests/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default serviceRequestService;