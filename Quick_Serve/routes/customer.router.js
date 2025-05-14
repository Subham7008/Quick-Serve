const express = require('express');
const customerController = require('../controllers/customers.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const customerRouter = express.Router();

// Create a new customer
customerRouter.post('/addcustomer', authMiddleware.checkUserAuth, customerController.addCustomerDetails);

// Get all customers
customerRouter.get('/', authMiddleware.checkUserAuth, customerController.getAllCustomers);

// Get customer by ID
customerRouter.get('/:id', authMiddleware.checkUserAuth, customerController.getCustomerById);

// Update customer
customerRouter.put('/:id', authMiddleware.checkUserAuth, customerController.updateCustomer);

// Delete customer
customerRouter.delete('/:id', authMiddleware.checkUserAuth, customerController.deleteCustomer);

module.exports = customerRouter;
