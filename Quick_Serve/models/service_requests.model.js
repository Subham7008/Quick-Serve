const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({

  customerDetails: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    contact_number: {
      type: String,
      required: true,
      trim: true
    }
  },
  deviceDetails: {
    device_type: {
      type: String,
      required: true,
      trim: true
    },
    device_model: {
      type: String,
      required: true,
      trim: true
    },
    issue_description: {
      type: String,
      required: true,
      trim: true
    },
    serial_number: {
      type: String,
      default: '',
      trim: true
    },
    service_type: {
      type: String,
      default: '',
      trim: true
    }
  },
  paymentDetails: {
    advance_amount: {
      type: Number,
      default: 0
    },
    total_amount: {
      type: Number,
      default: 0
    },
    payment_method: {
      type: String,
      enum: ['pending', 'cash', 'card', 'upi'],
      default: 'pending'
    },
    payment_status: {
      type: String,
      enum: ['pending', 'partial', 'completed'],
      default: 'pending'
    }
  },
  shop_owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopOwner'
  },
  service_status: {
    type: String,
    enum: ['pending_shop_assignment', 'assigned_to_shop', 'in_progress', 'repair_completed', 'delivered'],
    default: 'pending_shop_assignment'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

serviceRequestSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);