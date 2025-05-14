const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const serviceRequestController = require('../controllers/service_requests.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Validation middleware
const validateServiceRequest = [
  body('customerDetails.name').trim().notEmpty().withMessage('Customer name is required'),
  body('customerDetails.email').trim().isEmail().withMessage('Valid email is required'),
  body('customerDetails.contact_number').trim().notEmpty().withMessage('Contact number is required'),
  body('deviceDetails.device_type').trim().notEmpty().withMessage('Device type is required'),
  body('deviceDetails.device_model').trim().notEmpty().withMessage('Device model is required'),
  body('deviceDetails.issue_description').trim().notEmpty().withMessage('Issue description is required'),
  body('paymentDetails.advance_amount').optional().isNumeric().withMessage('Advance amount must be a number'),
  body('paymentDetails.total_amount').optional().isNumeric().withMessage('Total amount must be a number'),
  body('paymentDetails.payment_method').optional().isIn(['pending', 'cash', 'card', 'upi']).withMessage('Invalid payment method'),
  body('paymentDetails.payment_status').optional().isIn(['pending', 'partial', 'completed']).withMessage('Invalid payment status')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Create service request
router.post('/',
  authMiddleware.checkUserAuth,
  validateServiceRequest,
  handleValidationErrors,
  serviceRequestController.createServiceRequest
);

// Get all service requests
router.get('/',
  authMiddleware.checkUserAuth,
  serviceRequestController.getAllServiceRequests
);

// Get service request by ID
router.get('/:id',
  authMiddleware.checkUserAuth,
  serviceRequestController.getServiceRequestById
);

// Assign shop to service request
router.patch('/:id/assign-shop',
  authMiddleware.checkUserAuth,
  validateShopAssignment,
  handleValidationErrors,
  serviceRequestController.assignShop
);

// Update service status
router.patch('/:id/status',
  authMiddleware.checkUserAuth,
  serviceRequestController.updateServiceStatus
);

// Update payment details
router.patch('/:id/payment',
  authMiddleware.checkUserAuth,
  serviceRequestController.updatePaymentDetails
);

// Delete service request
router.delete('/:id',
  authMiddleware.checkUserAuth,
  serviceRequestController.deleteServiceRequest
);

// Generate invoice for service request
router.get('/:id/invoice',
  authMiddleware.checkUserAuth,
  serviceRequestController.generateInvoice
);

module.exports = router;