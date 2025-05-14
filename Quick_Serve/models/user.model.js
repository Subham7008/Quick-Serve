const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    match: /^[a-zA-Z0-9_]+$/
  },
  first_name: {
    type: String,
    required: true,
    minlength: 2,
    match: /^[a-zA-Z\s]+$/
  },
  last_name: {
    type: String,
    required: true,
    minlength: 2,
    match: /^[a-zA-Z\s]+$/
  },
  business_name: {
    type: String,
    required: true,
    minlength: 2
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true
  },
  phone_number: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{10}$/
  },
  business_address: {
    type: String,
    required: false
  },
  business_phone: {
    type: String,
    required: false,
    match: /^[0-9]{10}$/
  },
  business_email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  role: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
