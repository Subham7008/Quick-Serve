const HttpStatus = require("../enums/httpStatusCode.enum");
const ResponseMessages = require("../enums/responseMessage.enum");
const shopOwners = require("../models/shop_owners.model");
const customers = require("../models/customers.model");
const devices = require("../models/devices.model");
const payments = require("../models/payments.model");
const bcrypt = require("bcrypt");
const helpers = require("../utils/helper");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.APP_SUPER_SECRET_KEY;
const mongoose = require("mongoose");

// customer entry by shop owners::::::::::::::::::::::::::::::::::
const customerController = {};

customerController.getAllCustomers = async (req, res) => {
  try {
    const shopOwnerId = req.mwValue.auth.id;
    const allCustomers = await customers.find({ created_by: shopOwnerId });
    
    // Enhance customers with device and payment details
    const enhancedCustomers = await Promise.all(allCustomers.map(async (customer) => {
      const customerObj = customer.toObject();
      
      // Fetch device details
      const deviceData = await devices.findOne({ customer_id: customer._id });
      if (deviceData) {
        customerObj.deviceDetails = {
          device_type: deviceData.device_type,
          device_model: deviceData.device_model,
          issue_description: deviceData.issue_description,
          serial_number: deviceData.serial_number || '',
          service_type: deviceData.service_type || ''
        };
        
        // Map device status to customer status
        if (deviceData.status === 'Completed') {
          customerObj.status = 'completed';
        } else if (deviceData.status === 'In Progress') {
          customerObj.status = 'active';
        } else {
          customerObj.status = 'pending';
        }
      }
      
      // Fetch payment details
      const paymentData = await payments.findOne({ customer_id: customer._id });
      if (paymentData) {
        customerObj.paymentDetails = {
          advance_amount: paymentData.advance_amount,
          total_amount: paymentData.total_amount,
          estimate_cost: paymentData.estimate_cost || paymentData.total_amount,
          payment_method: paymentData.payment_method?.toLowerCase() || 'pending',
          payment_status: paymentData.payment_status === 'Paid' ? 'completed' :
                         paymentData.payment_status === 'Partial' ? 'partial' : 'pending'
        };
      }
      
      return customerObj;
    }));
    
    return res.success(
      HttpStatus.OK,
      "true",
      "Customers retrieved successfully",
      enhancedCustomers
    );
  } catch (error) {
    console.error("Error fetching customers:", error);
    if (error.name === 'ValidationError') {
      return res.error(
        HttpStatus.BAD_REQUEST,
        "false",
        "Validation error",
        {
          code: "VALIDATION_ERROR",
          details: Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
          }))
        }
      );
    }
    
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "false",
      ResponseMessages.INTERNAL_SERVER_ERROR,
      {
        code: "FETCH_ERROR",
        message: error.message || "An unexpected error occurred while fetching customers"
      }
    );
  }
};

customerController.addCustomerDetails = async (req, res) => {
  const { customerDetails, deviceDetails, paymentDetails } = req.body;
console.log('Received created_by:', req.body.customer?.created_by);
  const { name, email, contact_number } = customerDetails;
  const { device_type, device_model, issue_description, serial_number, service_type } = deviceDetails;
  const { advance_amount, total_amount, payment_method, payment_status } =
    paymentDetails;

  try {
    const shopOwnerId = req.mwValue.auth.id;

    let customer = await customers.findOne({ email });
    if (!customer) {
      console.log('Creating customer with shopOwnerId:', shopOwnerId);
      try {
        customer = await customers.create({
          name,
          email,
          contact_number,
          created_by: shopOwnerId,
        });
      } catch (err) {
        if (err.code === 11000 && err.keyPattern?.email) {
          customer = await customers.findOne({ email });
          if (!customer) {
            throw new Error('Unexpected error while handling duplicate customer');
          }
          console.log(`Using existing customer with email: ${email}`);
        } else {
          throw err;
        }
      }
    } else {
      console.log(`Using existing customer with email: ${email}`);
      // Update customer information if needed
      await customers.updateOne(
        { _id: customer._id },
        { 
          $set: {
            name,
            contact_number,
            updated_by: shopOwnerId,
            updated_on: new Date()
          }
        }
      );
    }

    const newDevice = await devices.create({
      customer_id: customer.id,
      device_type,
      device_model,
      issue_description,
      serial_number: serial_number || '',
      service_type: service_type || '',
      shop_owner_id: shopOwnerId,
      created_by: shopOwnerId,
    });
    const remaining_amount = total_amount - advance_amount;

    // Validate payment method and status against allowed enum values
    const validPaymentMethods = ['Cash', 'Card', 'Online'];
    const validPaymentStatuses = ['Paid', 'Partial', 'Pending'];
    
    if (!payment_method || !validPaymentMethods.includes(payment_method)) {
      return res.error(
        HttpStatus.BAD_REQUEST,
        "false",
        "Invalid payment method",
        {
          code: "VALIDATION_ERROR",
          message: `Invalid payment_method. Must be one of: ${validPaymentMethods.join(', ')}`,
          field: "payment_method",
          allowedValues: validPaymentMethods
        }
      );
    }
    
    if (!payment_status || !validPaymentStatuses.includes(payment_status)) {
      return res.error(
        HttpStatus.BAD_REQUEST,
        "false",
        "Invalid payment status",
        {
          code: "VALIDATION_ERROR",
          message: `Invalid payment_status. Must be one of: ${validPaymentStatuses.join(', ')}`,
          field: "payment_status",
          allowedValues: validPaymentStatuses
        }
      );
    }

    const newPayment = await payments.create({
      customer_id: customer.id,
      device_id: newDevice.id,
      advance_amount,
      total_amount,
      remaining_amount,
      payment_method,
      payment_status,
      created_by: shopOwnerId,
    });
    if (shopOwner?.fcm_token) {
      const fcmMessage = {
        to: shopOwner.fcm_token,
        notification: {
          title: "New Device Entry",
          body: `${name} has submitted device details.`,
        },
        data: {
          customer_id: customer.id,
          device_id: newDevice.id,
        },
      };

      await helpers.sendFcmNotification(fcmMessage);
    }

    return res.success(
      HttpStatus.OK,
      "true",
      ResponseMessages.USER_REGISTERED_SUCCESSFULLY,
      {
        customer_id: customer.id,
        device_id: newDevice.id
      }
    );
  } catch (error) {
    console.error("Error adding customer details:", error);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.error(
        HttpStatus.BAD_REQUEST,
        "false",
        "Validation error",
        {
          code: "VALIDATION_ERROR",
          details: Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
          }))
        }
      );
    }
    
    if (error.code === 11000) {
      return res.error(
        HttpStatus.CONFLICT,
        "false",
        "Duplicate entry error",
        {
          code: "DUPLICATE_ERROR",
          message: "A record with this information already exists",
          fields: Object.keys(error.keyPattern)
        }
      );
    }
    
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "false",
      "Failed to add customer details",
      {
        code: "INTERNAL_ERROR",
        message: error.message || "An unexpected error occurred"
      }
    );
  }
};

customerController.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const shopOwnerId = req.mwValue.auth.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error(
        HttpStatus.BAD_REQUEST,
        "false",
        "Invalid customer ID format",
        { message: "The provided customer ID is not valid" }
      );
    }

    const customer = await customers.findOne({ 
      _id: id,
      created_by: shopOwnerId 
    });

    if (!customer) {
      return res.error(
        HttpStatus.NOT_FOUND,
        "false",
        "Customer not found",
        { 
          message: `Customer with ID ${id} not found or you don't have access`,
          suggestion: "Verify the customer ID or check your permissions"
        }
      );
    }

    // Fetch device details
    const deviceData = await devices.findOne({ customer_id: id });
    
    // Fetch payment details
    const paymentData = await payments.findOne({ customer_id: id });

    // Build enhanced customer object with device and payment details
    const enhancedCustomer = customer.toObject();
    
    if (deviceData) {
      enhancedCustomer.deviceDetails = {
        device_type: deviceData.device_type,
        device_model: deviceData.device_model,
        issue_description: deviceData.issue_description,
        serial_number: deviceData.serial_number || '',
        service_type: deviceData.service_type || ''
      };
      
      // Map device status to customer status
      if (deviceData.status === 'Completed') {
        enhancedCustomer.status = 'completed';
      } else if (deviceData.status === 'In Progress') {
        enhancedCustomer.status = 'active';
      } else {
        enhancedCustomer.status = 'pending';
      }
    }
    
    if (paymentData) {
      enhancedCustomer.paymentDetails = {
        advance_amount: paymentData.advance_amount,
        total_amount: paymentData.total_amount,
        estimate_cost: paymentData.estimate_cost || paymentData.total_amount,
        payment_method: paymentData.payment_method?.toLowerCase() || 'pending',
        payment_status: paymentData.payment_status === 'Paid' ? 'completed' :
                         paymentData.payment_status === 'Partial' ? 'partial' : 'pending'
      };
    }

    return res.success(
      HttpStatus.OK,
      "true",
      "Customer retrieved successfully",
      enhancedCustomer
    );
  } catch (error) {
    console.error("Error fetching customer:", error);
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "false",
      ResponseMessages.INTERNAL_SERVER_ERROR,
      {
        code: "FETCH_ERROR",
        message: error.message || "An unexpected error occurred while fetching customer"
      }
    );
  }
};

customerController.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const shopOwnerId = req.mwValue.auth.id;
    const updateData = req.body;
    
    console.log("Update customer received data:", updateData);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error(
        HttpStatus.BAD_REQUEST,
        "false",
        "Invalid customer ID format",
        { message: "The provided customer ID is not valid" }
      );
    }

    // Validate update data
    if (!updateData.name || !updateData.email || !updateData.contact_number) {
      return res.error(
        HttpStatus.BAD_REQUEST,
        "false",
        "Missing required fields",
        { message: "Name, email, and contact number are required" }
      );
    }

    const customer = await customers.findOne({ 
      _id: id,
      created_by: shopOwnerId 
    });

    if (!customer) {
      return res.error(
        HttpStatus.NOT_FOUND,
        "false",
        "Customer not found",
        { 
          message: `Customer with ID ${id} not found or you don't have access`,
          suggestion: "Verify the customer ID or check your permissions"
        }
      );
    }

    // Update customer with new data
    customer.name = updateData.name;
    customer.email = updateData.email;
    customer.contact_number = updateData.contact_number;
    customer.updated_by = shopOwnerId;
    customer.updated_on = new Date();

    await customer.save();
    
    // Process device details if provided
    let deviceData = null;
    if (updateData.deviceDetails) {
      // Find existing device or create new one
      let device = await devices.findOne({ customer_id: id });
      
      if (device) {
        // Update existing device
        device.device_type = updateData.deviceDetails.device_type;
        device.device_model = updateData.deviceDetails.device_model;
        device.issue_description = updateData.deviceDetails.issue_description;
        device.serial_number = updateData.deviceDetails.serial_number || '';
        device.service_type = updateData.deviceDetails.service_type || '';
        
        // Update status based on customer status
        if (updateData.status === 'completed') {
          device.status = 'Completed';
        } else if (updateData.status === 'active') {
          device.status = 'In Progress';
        } else {
          device.status = 'Received';
        }
        
        device.updated_by = shopOwnerId;
        device.updated_on = new Date();
        
        await device.save();
        deviceData = device;
      } else {
        // Create new device
        deviceData = await devices.create({
          customer_id: id,
          device_type: updateData.deviceDetails.device_type,
          device_model: updateData.deviceDetails.device_model,
          issue_description: updateData.deviceDetails.issue_description,
          serial_number: updateData.deviceDetails.serial_number || '',
          service_type: updateData.deviceDetails.service_type || '',
          status: updateData.status === 'completed' ? 'Completed' : 
                updateData.status === 'active' ? 'In Progress' : 'Received',
          shop_owner_id: shopOwnerId,
          created_by: shopOwnerId
        });
      }
    }
    
    // Process payment details if provided
    let paymentData = null;
    if (updateData.paymentDetails) {
      // Find existing device (needed for device_id in payment)
      const device = deviceData || await devices.findOne({ customer_id: id });
      
      if (device) {
        // Find existing payment or create new one
        let payment = await payments.findOne({ customer_id: id });
        
        if (payment) {
          // Update existing payment
          payment.advance_amount = updateData.paymentDetails.advance_amount || 0;
          payment.total_amount = updateData.paymentDetails.total_amount || 0;
          payment.estimate_cost = updateData.paymentDetails.estimate_cost || payment.total_amount || 0;
          payment.remaining_amount = payment.total_amount - payment.advance_amount;
          
          // Convert payment method/status to match database enum values
          if (updateData.paymentDetails.payment_method) {
            const method = updateData.paymentDetails.payment_method.toLowerCase();
            payment.payment_method = method === 'cash' ? 'Cash' : 
                                   method === 'card' ? 'Card' : 
                                   method === 'online' || method === 'upi' ? 'Online' : 'Pending';
          }
          
          if (updateData.paymentDetails.payment_status) {
            const status = updateData.paymentDetails.payment_status.toLowerCase();
            payment.payment_status = status === 'completed' ? 'Paid' :
                                  status === 'partial' ? 'Partial' : 'Pending';
          }
          
          payment.updated_by = shopOwnerId;
          payment.updated_on = new Date();
          
          await payment.save();
          paymentData = payment;
        } else if (
          updateData.paymentDetails.total_amount || 
          updateData.paymentDetails.advance_amount || 
          updateData.paymentDetails.estimate_cost
        ) {
          // Only create new payment if there's actual payment data
          const total_amount = updateData.paymentDetails.total_amount || 0;
          const advance_amount = updateData.paymentDetails.advance_amount || 0;
          const remaining_amount = total_amount - advance_amount;
          
          // Convert payment method/status to match database enum values
          let payment_method = 'Pending';
          if (updateData.paymentDetails.payment_method) {
            const method = updateData.paymentDetails.payment_method.toLowerCase();
            payment_method = method === 'cash' ? 'Cash' : 
                          method === 'card' ? 'Card' : 
                          method === 'online' || method === 'upi' ? 'Online' : 'Pending';
          }
          
          let payment_status = 'Pending';
          if (updateData.paymentDetails.payment_status) {
            const status = updateData.paymentDetails.payment_status.toLowerCase();
            payment_status = status === 'completed' ? 'Paid' :
                          status === 'partial' ? 'Partial' : 'Pending';
          }
          
          paymentData = await payments.create({
            device_id: device._id,
            customer_id: id,
            advance_amount,
            total_amount,
            estimate_cost: updateData.paymentDetails.estimate_cost || total_amount,
            remaining_amount,
            payment_method,
            payment_status,
            created_by: shopOwnerId
          });
        }
      }
    }

    // Build the response with all updated data
    const response = {
      customer,
      device: deviceData,
      payment: paymentData
    };

    return res.success(
      HttpStatus.OK,
      "true",
      "Customer updated successfully",
      response
    );
  } catch (error) {
    console.error("Error updating customer:", error);
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "false",
      ResponseMessages.INTERNAL_SERVER_ERROR,
      {
        code: "UPDATE_ERROR",
        message: error.message || "An unexpected error occurred while updating customer"
      }
    );
  }
};

customerController.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const shopOwnerId = req.mwValue.auth.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error(
        HttpStatus.BAD_REQUEST,
        "false",
        "Invalid customer ID format",
        { message: "The provided customer ID is not valid" }
      );
    }

    const customer = await customers.findOne({ 
      _id: id,
      created_by: shopOwnerId 
    });

    if (!customer) {
      return res.error(
        HttpStatus.NOT_FOUND,
        "false",
        "Customer not found",
        { 
          message: `Customer with ID ${id} not found or you don't have access`,
          suggestion: "Verify the customer ID or check your permissions"
        }
      );
    }

    // Check if customer has any devices or service requests
    const customerDevices = await devices.find({ customer_id: id });
    if (customerDevices.length > 0) {
      // Optional: delete associated devices or prevent deletion
      await devices.deleteMany({ customer_id: id });
    }

    // Delete the customer
    await customers.deleteOne({ _id: id });

    return res.success(
      HttpStatus.OK,
      "true",
      "Customer deleted successfully",
      { id }
    );
  } catch (error) {
    console.error("Error deleting customer:", error);
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "false",
      ResponseMessages.INTERNAL_SERVER_ERROR,
      {
        code: "DELETE_ERROR",
        message: error.message || "An unexpected error occurred while deleting customer"
      }
    );
  }
};

module.exports = customerController;
