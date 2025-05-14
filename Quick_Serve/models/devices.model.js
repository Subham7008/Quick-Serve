const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  shop_owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopOwner'
  },
  device_type: {
    type: String,
    required: true
  },
  device_model: {
    type: String,
    required: true
  },
  issue_description: {
    type: String,
    required: true
  },
  serial_number: {
    type: String,
    default: ''
  },
  service_type: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Received', 'In Progress', 'Completed', 'Delivered'],
    default: 'Received'
  },
  remark: {
    type: String
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_on: {
    type: Date,
    default: Date.now,
    required: true
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updated_on: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Device', deviceSchema);