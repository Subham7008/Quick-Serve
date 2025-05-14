const HttpStatus = require('../enums/httpStatusCode.enum');
const ResponseMessages = require('../enums/responseMessage.enum');
const ServiceRequest = require('../models/service_requests.model');
const Customer = require('../models/customers.model');
const ShopOwner = require('../models/shop_owners.model');
const Device = require('../models/devices.model');
const Invoice = require('../models/invoices.model');
const mongoose = require('mongoose');

const serviceRequestController = {};

serviceRequestController.getServiceRequestById = async (req, res) => {
  try {
    const { id: rawId } = req.params;
    const userId = req.mwValue?.auth?.id;

    if (!userId) {
      return res.error(
        HttpStatus.UNAUTHORIZED,
        'false',
        'Authentication required',
        { message: 'Please login to view service request details' }
      );
    }
    
    // Sanitize and verify the ID
    const id = rawId.toString().trim();
    console.log('Attempting to find service request with sanitized ID:', id);
    
    // Handle case where ID might be longer than standard MongoDB ObjectId
    if (id.length > 24) {
      console.warn(`ID length (${id.length}) exceeds standard MongoDB ObjectId length of 24. Attempting to trim...`);
      // Try with the first 24 characters
      const trimmedId = id.substring(0, 24);
      
      if (mongoose.Types.ObjectId.isValid(trimmedId)) {
        console.log('Using trimmed ID:', trimmedId);
        
        // Try to find with trimmed ID
        const serviceRequest = await ServiceRequest.findById(trimmedId);
        
        if (serviceRequest) {
          // Success with trimmed ID
          const populatedServiceRequest = await ServiceRequest.findById(trimmedId)
            .populate({
              path: 'shop_owner_id',
              select: 'name email contact_number shop_name',
              model: 'ShopOwner'
            })
            .populate({
              path: 'created_by',
              select: 'name email',
              model: 'User'
            })
            .exec();
          
          return res.success(
            HttpStatus.OK,
            'true',
            'Service request retrieved successfully',
            populatedServiceRequest
          );
        }
      }
    }
    
    // Continue with standard validation for untrimmed ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error(
        HttpStatus.BAD_REQUEST,
        'false',
        'Invalid service request ID',
        { 
          message: 'The provided ID is not a valid service request ID',
          details: `ID "${id}" is not a valid MongoDB ObjectId (should be 24 hex characters)`
        }
      );
    }

    // Try to find the service request
    const serviceRequest = await ServiceRequest.findById(id);
    
    if (!serviceRequest) {
      console.error('Service request not found:', id);
      return res.error(
        HttpStatus.NOT_FOUND,
        'false',
        ResponseMessages.NOT_FOUND,
        { 
          message: 'Service request not found',
          details: {
            resource_type: 'ServiceRequest',
            requested_id: id,
            suggestion: 'The service request may have been deleted or never existed. Please verify the ID or return to the service request list.'
          }
        }
      );
    }

    // Check if user has permission to view this service request
    const hasPermission = 
      serviceRequest.created_by.toString() === userId ||
      (serviceRequest.shop_owner_id && serviceRequest.shop_owner_id.toString() === userId);

    if (!hasPermission) {
      console.error('User not authorized to view service request:', id);
      return res.error(
        HttpStatus.FORBIDDEN,
        'false',
        ResponseMessages.FORBIDDEN,
        { 
          message: 'You do not have permission to view this service request',
          details: {
            resource_type: 'ServiceRequest',
            requested_id: id
          }
        }
      );
    }

    // If user has permission, populate the references and return the full data
    const populatedServiceRequest = await ServiceRequest.findById(id)
      .populate({
        path: 'shop_owner_id',
        select: 'name email contact_number shop_name',
        model: 'ShopOwner'
      })
      .populate({
        path: 'created_by',
        select: 'name email',
        model: 'User'
      })
      .exec();
    
    return res.success(
      HttpStatus.OK,
      'true',
      'Service request retrieved successfully',
      populatedServiceRequest
    );
  } catch (error) {
    console.error('Error retrieving service request:', error);
    
    if (error.name === 'CastError') {
      return res.error(
        HttpStatus.BAD_REQUEST,
        'false',
        'Invalid service request ID format',
        { 
          message: 'Invalid service request ID format',
          details: error.message
        }
      );
    }
    
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'false',
      ResponseMessages.INTERNAL_SERVER_ERROR,
      { message: error.message }
    );
  }
};

serviceRequestController.createServiceRequest = async (req, res) => {
  try {
    if (!req.mwValue || !req.mwValue.auth || !req.mwValue.auth.id) {
      return res.error(
        HttpStatus.UNAUTHORIZED,
        'false',
        'User authentication required',
        { message: 'Please login to create a service request' }
      );
    }

    const {
      customerDetails,
      deviceDetails,
      paymentDetails
    } = req.body;

    // Create service request with nested details
    // Validate required fields
    if (!customerDetails || !deviceDetails) {
      return res.error(
        HttpStatus.BAD_REQUEST,
        'false',
        'Missing required details',
        { message: 'Customer and device details are required' }
      );
    }

    // Validate customer details
    if (!customerDetails.name || 
        !customerDetails.email || 
        !customerDetails.contact_number) {
      return res.error(
        HttpStatus.BAD_REQUEST,
        'false',
        'Invalid customer details',
        { message: 'Name, email and contact number are required for customer' }
      );
    }

    // Validate device details
    if (!deviceDetails.device_type || 
        !deviceDetails.device_model || 
        !deviceDetails.issue_description) {
      return res.error(
        HttpStatus.BAD_REQUEST,
        'false',
        'Invalid device details',
        { message: 'Device type, model and issue description are required' }
      );
    }

    // Validate payment details
    const validPaymentMethods = ['pending', 'cash', 'card', 'upi'];
    const validPaymentStatuses = ['pending', 'partial', 'completed'];
    
    const paymentMethod = paymentDetails?.payment_method || 'pending';
    const paymentStatus = paymentDetails?.payment_status || 'pending';
    
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.error(
        HttpStatus.BAD_REQUEST,
        'false',
        'Invalid payment method',
        { message: `Payment method must be one of: ${validPaymentMethods.join(', ')}` }
      );
    }
    
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.error(
        HttpStatus.BAD_REQUEST,
        'false',
        'Invalid payment status',
        { message: `Payment status must be one of: ${validPaymentStatuses.join(', ')}` }
      );
    }

    // Create or find customer
    let customer = await Customer.findOne({ email: customerDetails.email });
    if (!customer) {
      customer = await Customer.create({
        name: customerDetails.name,
        email: customerDetails.email,
        contact_number: customerDetails.contact_number,
        created_by: req.mwValue.auth.id,
        updated_by: req.mwValue.auth.id
      });
    }

    // Create device record
    const device = await Device.create({
      customer_id: customer._id,
      device_type: deviceDetails.device_type,
      device_model: deviceDetails.device_model,
      issue_description: deviceDetails.issue_description,
      serial_number: deviceDetails.serial_number || '',
      service_type: deviceDetails.service_type || '',
      status: 'Received',
      created_by: req.mwValue.auth.id,
      updated_by: req.mwValue.auth.id
    });

    // Create service request with references
    const serviceRequestData = {
      customerDetails: {
        name: customer.name,
        email: customer.email,
        contact_number: customer.contact_number
      },
      deviceDetails: {
        device_type: device.device_type,
        device_model: device.device_model,
        issue_description: device.issue_description,
        serial_number: device.serial_number,
        service_type: device.service_type
      },
      paymentDetails: {
        advance_amount: paymentDetails?.advance_amount || 0,
        total_amount: paymentDetails?.total_amount || 0,
        payment_method: paymentMethod,
        payment_status: paymentStatus
      },
      service_status: 'pending_shop_assignment',
      status: 'pending',
      created_by: req.mwValue.auth.id,
      updated_by: req.mwValue.auth.id
    };

    const serviceRequest = await ServiceRequest.create(serviceRequestData);

    return res.success(
      HttpStatus.CREATED,
      'true',
      'Service request created successfully',
      {
        serviceRequest,
        customer,
        device
      }
    );
  } catch (error) {
    console.error('Error creating service request:', error);
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'false',
      ResponseMessages.INTERNAL_SERVER_ERROR,
      { message: error.message }
    );
  }
};

serviceRequestController.assignShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { shop_owner_id } = req.body;

    // Validate service request exists
    console.log('Attempting to find service request with ID:', id);
    const serviceRequest = await ServiceRequest.findById(id);
    if (!serviceRequest) {
      return res.error(
        HttpStatus.NOT_FOUND,
        'false',
        'Service Request Not Found',
        {
          message: `Service request with ID ${id} not found`,
          suggestion: 'Verify the ID or check the service requests list'
        }
      );
    }

    // Validate shop owner exists
    const shopOwner = await ShopOwner.findById(shop_owner_id);
    if (!shopOwner) {
      return res.error(
        HttpStatus.NOT_FOUND,
        'false',
        ResponseMessages.NOT_FOUND,
        { message: 'Shop owner not found' }
      );
    }

    // Update service request
    serviceRequest.shop_owner_id = shop_owner_id;
    serviceRequest.service_status = 'assigned_to_shop';
    serviceRequest.status = 'in_progress';
    serviceRequest.updated_by = req.mwValue.auth.id; // Using consistent auth access pattern
    await serviceRequest.save();

    return res.success(
      HttpStatus.OK,
      'true',
      'Service request assigned successfully',
      serviceRequest
    );
  } catch (error) {
    console.error('Error assigning shop to service request:', error);
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'false',
      ResponseMessages.INTERNAL_SERVER_ERROR,
      { message: error.message }
    );
  }
};

// Add method to update service status
serviceRequestController.updateServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_status } = req.body;

    console.log('Attempting to find service request with ID:', id);
    const serviceRequest = await ServiceRequest.findById(id);
    if (!serviceRequest) {
      return res.error(
        HttpStatus.NOT_FOUND,
        'false',
        'Service Request Not Found',
        {
          message: `Service request with ID ${id} not found`,
          suggestion: 'Verify the ID or check the service requests list'
        }
      );
    }

    // Validate service status transition
    const validStatusTransitions = {
      'pending_shop_assignment': ['assigned_to_shop'],
      'assigned_to_shop': ['in_progress'],
      'in_progress': ['repair_completed'],
      'repair_completed': ['delivered']
    };

    if (!validStatusTransitions[serviceRequest.service_status]?.includes(service_status)) {
      return res.error(
        HttpStatus.BAD_REQUEST,
        'false',
        ResponseMessages.BAD_REQUEST,
        { message: 'Invalid status transition' }
      );
    }

    // Update service request status
    serviceRequest.service_status = service_status;
    if (service_status === 'delivered') {
      serviceRequest.status = 'completed';
    }
    serviceRequest.updated_by = req.mwValue.auth.id;
    await serviceRequest.save();

    return res.success(
      HttpStatus.OK,
      'true',
      'Service status updated successfully',
      serviceRequest
    );
  } catch (error) {
    console.error('Error updating service status:', error);
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'false',
      ResponseMessages.INTERNAL_SERVER_ERROR,
      { message: error.message }
    );
  }
};

// Get all service requests
serviceRequestController.getAllServiceRequests = async (req, res) => {
  try {
    const serviceRequests = await ServiceRequest.find()
      .populate('shop_owner_id', 'name email contact_number')
      .populate('created_by', 'name email');

    return res.success(
      HttpStatus.OK,
      'true',
      'Service requests retrieved successfully',
      serviceRequests
    );
  } catch (error) {
    console.error('Error retrieving service requests:', error);
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'false',
      ResponseMessages.INTERNAL_SERVER_ERROR,
      { message: error.message }
    );
  }
};

// Update payment details
serviceRequestController.updatePaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { advance_amount, total_amount, payment_method, payment_status } = req.body;

    console.log('Attempting to find service request with ID:', id);
    const serviceRequest = await ServiceRequest.findById(id);
    if (!serviceRequest) {
      return res.error(
        HttpStatus.NOT_FOUND,
        'false',
        'Service Request Not Found',
        {
          message: `Service request with ID ${id} not found`,
          suggestion: 'Verify the ID or check the service requests list'
        }
      );
    }

    // Update payment details
    if (advance_amount !== undefined) serviceRequest.paymentDetails.advance_amount = advance_amount;
    if (total_amount !== undefined) serviceRequest.paymentDetails.total_amount = total_amount;
    if (payment_method) serviceRequest.paymentDetails.payment_method = payment_method;
    if (payment_status) serviceRequest.paymentDetails.payment_status = payment_status;

    serviceRequest.updated_by = req.mwValue.auth.id;
    await serviceRequest.save();

    return res.success(
      HttpStatus.OK,
      'true',
      'Payment details updated successfully',
      serviceRequest
    );
  } catch (error) {
    console.error('Error updating payment details:', error);
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'false',
      ResponseMessages.INTERNAL_SERVER_ERROR,
      { message: error.message }
    );
  }
};

serviceRequestController.deleteServiceRequest = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);
    
    if (!serviceRequest) {
      return res.error(
        HttpStatus.NOT_FOUND,
        'false',
        'Service Request Not Found',
        {
          message: `Service request with ID ${id} not found`,
          suggestion: 'Verify the ID or check the service requests list'
        }
      );
    }

    if (serviceRequest.created_by.toString() !== req.mwValue.auth.id) {
      return res.error(
        HttpStatus.FORBIDDEN,
        'false',
        ResponseMessages.FORBIDDEN,
        { message: 'Not authorized to delete this request' }
      );
    }

    await ServiceRequest.findByIdAndDelete(req.params.id);
    
    return res.success(
      HttpStatus.OK,
      'true',
      'Service request deleted successfully',
      null
    );
  } catch (error) {
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'false',
      ResponseMessages.SERVER_ERROR,
      { details: error.message }
    );
  }
};

serviceRequestController.generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error(
        HttpStatus.BAD_REQUEST,
        'false',
        'Invalid service request ID',
        { message: 'The provided ID is not a valid service request ID' }
      );
    }

    const serviceRequest = await ServiceRequest.findById(id)
      .populate('shop_owner_id');

    if (!serviceRequest) {
      return res.error(
        HttpStatus.NOT_FOUND,
        'false',
        'Service Request Not Found',
        {
          message: `Service request with ID ${id} not found`,
          suggestion: 'Verify the ID or check the service requests list'
        }
      );
    }

    const invoiceData = {
      service_request_id: id,
      customer_details: serviceRequest.customerDetails,
      device_details: serviceRequest.deviceDetails,
      shop_details: {
        shop_name: serviceRequest.shop_owner_id?.shop_name || 'Not Assigned',
        contact: serviceRequest.shop_owner_id?.contact_number || 'Not Available'
      },
      total_amount: serviceRequest.paymentDetails.total_amount,
      amount_paid: serviceRequest.paymentDetails.advance_amount,
      remaining_balance: serviceRequest.paymentDetails.total_amount - serviceRequest.paymentDetails.advance_amount,
      payment_status: serviceRequest.paymentDetails.payment_status,
      invoice_date: new Date(),
      invoice_number: `INV-${Date.now()}`
    };

    const invoice = await Invoice.create(invoiceData);

    return res.success(
      HttpStatus.OK,
      'true',
      'Invoice generated successfully',
      invoice
    );
  } catch (error) {
    console.error('Error generating invoice:', error);
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'false',
      ResponseMessages.INTERNAL_SERVER_ERROR,
      { message: error.message }
    );
  }
};

module.exports = serviceRequestController;