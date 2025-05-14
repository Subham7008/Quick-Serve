const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  device_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  total_amount: {
    type: Number,
    required: true
  },
  estimate_cost: {
    type: Number,
    default: function() {
      return this.total_amount || 0; // Use total_amount as default instead of fixed 0
    }
  },
  advance_amount: {
    type: Number,
    required: true
  },
  remaining_amount: {
    type: Number,
    required: true
  },
  payment_method: {
    type: String,
    enum: ['Cash', 'Card', 'Online'],
    required: true
  },
  payment_status: {
    type: String,
    enum: ['Paid', 'Partial', 'Pending'],
    required: true
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

// Add a pre-save hook to ensure estimate_cost is set if not provided
paymentSchema.pre('save', function(next) {
  // If estimate_cost is not set or is 0, use total_amount
  if (this.estimate_cost === undefined || this.estimate_cost === null || this.estimate_cost === 0) {
    this.estimate_cost = this.total_amount;
    console.log(`Payment ${this._id}: Setting estimate_cost to total_amount (${this.total_amount}) in pre-save hook`);
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
