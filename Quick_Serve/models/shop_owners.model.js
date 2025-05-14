const mongoose = require('mongoose');

const shopOwnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  contact_number: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  shop_name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  shop_opening_hours: {
    type: String
  },
  service_offered: {
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
  },
  otp: {
    type: String,
    maxlength: 6
  },
  otp_verify: {
    type: Boolean,
    default: false
  },
  token: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ShopOwner', shopOwnerSchema);
 