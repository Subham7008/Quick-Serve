import axiosInstance from './api.config';

const serviceRequestService = {
  createServiceRequest: async (requestData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axiosInstance.post('/service-requests', requestData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to create a service request' };
      }
      throw error.response?.data || error.message;
    }
  },

  // Get service request by ID
  getServiceRequestById: async (id) => {
    try {
      // Validate the ID parameter
      if (!id) {
        throw new Error('Service request ID is required');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Log the ID being requested for debugging
      console.log('Fetching service request with ID:', id);
      
      // Clean any whitespace from the ID
      const sanitizedId = id.toString().trim();
      
      // MongoDB ObjectIds are 24 hex characters, but our ID appears to be 25 characters
      // Let's try both the original ID and a trimmed version if needed
      const response = await axiosInstance.get(`/service-requests/${sanitizedId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Validate the response data
      if (!response.data) {
        throw new Error('Empty response received from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error details:', error.response || error);
      
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to view this service request' };
      }
      
      if (error.message === 'Service request ID is required') {
        throw { 
          status: 400, 
          message: 'Invalid service request ID', 
          details: 'A valid service request ID is required to view details.',
          suggestion: 'Please return to the dashboard and select a valid service request.'
        };
      }
      
      if (error.message === 'Empty response received from server') {
        throw { 
          status: 404, 
          message: 'Service request data not found', 
          details: 'The server returned an empty response for this service request.',
          suggestion: 'Please verify the service request exists and try again.'
        };
      }
      
      // Enhanced error handling for 404 errors
      if (error.response?.status === 404) {
        const errorDetails = error.response.data?.error?.details || {};
        throw { 
          status: 404, 
          message: error.response.data?.message || 'Service request not found',
          details: errorDetails.resource_type ? 
            `The ${errorDetails.resource_type} with ID ${errorDetails.requested_id || id} could not be found.` :
            `The ServiceRequest with ID ${id} could not be found.`,
          suggestion: errorDetails.suggestion || 'The service request may have been deleted or never existed. Please verify the ID or return to the service request list.'
        };
      }
      
      // Enhanced error handling for 400 errors (bad request, usually invalid ID)
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error?.message || 'Invalid service request ID';
        const errorDetails = error.response.data?.error?.details || '';
        
        throw { 
          status: 400, 
          message: errorMessage,
          details: errorDetails || `The ID "${id}" is not a valid format. MongoDB ObjectIds should be 24 characters long.`,
          suggestion: 'Please return to the dashboard and select a valid service request.'
        };
      }
      
      throw error.response?.data || { 
        status: error.response?.status || 500, 
        message: error.message || 'An unexpected error occurred',
        details: 'There was a problem communicating with the server.',
        suggestion: 'Please check your network connection and try again.'
      };
    }
  },

  // Get all service requests
  getAllServiceRequests: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axiosInstance.get('/service-requests', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to view service requests' };
      }
      throw error.response?.data || error.message;
    }
  },

  // Update service request status
  updateServiceStatus: async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axiosInstance.patch(`/service-requests/${id}/status`, { service_status: status }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to update service request status' };
      }
      throw error.response?.data || error.message;
    }
  },

  // Delete service request
  deleteServiceRequest: async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axiosInstance.delete(`/service-requests/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to delete service request' };
      }
      throw error.response?.data || error.message;
    }
  },

  // Generate invoice for completed service request
  generateInvoice: async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axiosInstance.get(`/service-requests/${id}/invoice`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        throw { status: 401, message: 'Please login to generate invoice' };
      }
      throw error.response?.data || error.message;
    }
  }
};

export default serviceRequestService;