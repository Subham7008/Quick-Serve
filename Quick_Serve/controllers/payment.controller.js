const HttpStatus = require("../enums/httpStatusCode.enum");
const ResponseMessages = require("../enums/responseMessage.enum");
const shopOwners = require("../models/shop_owners.model");
const customers = require("../models/customers.model");
const devices = require("../models/devices.model");
const payments = require("../models/payments.model");
const helpers = require("../utils/helper");
const jwt = require("jsonwebtoken"); 
require("dotenv").config();
const secretKey = process.env.APP_SUPER_SECRET_KEY;

// Error response helper function
const sendErrorResponse = (res, statusCode, message, details = null) => {
  return res.error(
    statusCode,
    "false",
    message,
    details
  );
};

const paymentController = {};
paymentController.addPaymentDetails = async (req, res) => {
  const { device_id, advance_amount, total_amount, payment_status, payment_method, estimate_cost } = req.body;
  const shopOwnerId = req.mwValue?.auth?.id; 

  try {
    
    const device = await devices.findOne({
      where: { id: device_id, shop_owner_id: shopOwnerId },
    });

    if (!device) {
      return sendErrorResponse(
        res,
        HttpStatus.NOT_FOUND,
        ResponseMessages.NOT_FOUND,
        {
          code: "DEVICE_NOT_FOUND",
          message: "Device not found or not authorized",
          device_id
        }
      );
    }

    
    const payment = await payments.create({
      device_id,
      customer_id: device.customer_id,
      shop_owner_id: shopOwnerId,
      advance_amount,
      total_amount,
      estimate_cost: estimate_cost || total_amount,
      payment_status,
      payment_method,
    });

    return res.success(
      HttpStatus.OK,
      "true",
      "Payment details added successfully.",
      payment
    );
  } catch (error) {
    console.error("Error adding payment details:", error);
    return sendErrorResponse(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      ResponseMessages.INTERNAL_SERVER_ERROR,
      {
        code: "PAYMENT_CREATION_ERROR",
        message: error.message || "Failed to add payment details",
        details: error.name === 'SequelizeValidationError' ? error.errors.map(e => ({ field: e.path, message: e.message })) : null
      }
    );
  }
};

paymentController.getPaymentsByCustomerId = async (req, res) => {
  try {
    const { id } = req.params;
    const shopOwnerId = req.mwValue?.auth?.id;

    console.log(`Getting payments for customer ID: ${id}, shop owner: ${shopOwnerId}`);

    // Validate customer ID
    if (!id) {
      return res.error(
        HttpStatus.BAD_REQUEST,
        "false",
        "Customer ID is required",
        { message: "Customer ID is required" }
      );
    }

    // Find customer to verify shop owner has access
    const customer = await customers.findOne({ 
      _id: id,
      created_by: shopOwnerId
    });

    if (!customer) {
      return res.error(
        HttpStatus.NOT_FOUND,
        "false",
        "Customer not found",
        { message: `Customer with ID ${id} not found or you don't have access` }
      );
    }

    // Find payments associated with this customer
    const customerPayments = await payments.find({ customer_id: id });
    console.log(`Found ${customerPayments.length} payment(s) for customer ${id}`);
    
    // Add estimate_cost field if it doesn't exist (temporary solution)
    const enhancedPayments = customerPayments.map(payment => {
      const paymentObj = payment.toObject();
      if (paymentObj.estimate_cost === undefined || paymentObj.estimate_cost === null || paymentObj.estimate_cost === 0) {
        paymentObj.estimate_cost = paymentObj.total_amount;
        console.log(`Payment ${paymentObj._id}: Setting estimate_cost to total_amount (${paymentObj.total_amount})`);
      } else {
        console.log(`Payment ${paymentObj._id}: estimate_cost already exists (${paymentObj.estimate_cost})`);
      }
      return paymentObj;
    });

    console.log("Enhanced payments:", JSON.stringify(enhancedPayments, null, 2));

    // The standard response structure expected by the frontend
    return res.success(
      HttpStatus.OK,
      "true",
      "Payments retrieved successfully",
      enhancedPayments
    );
  } catch (error) {
    console.error("Error fetching customer payments:", error);
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "false",
      ResponseMessages.INTERNAL_SERVER_ERROR,
      {
        code: "FETCH_ERROR",
        message: error.message || "An unexpected error occurred while fetching payments"
      }
    );
  }
};

module.exports = paymentController;
