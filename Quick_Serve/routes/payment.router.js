const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Create payment
router.post('/', authMiddleware.checkUserAuth, paymentController.addPaymentDetails);

// Get payments by customer ID
router.get('/customer/:id', authMiddleware.checkUserAuth, paymentController.getPaymentsByCustomerId);

module.exports = router; 