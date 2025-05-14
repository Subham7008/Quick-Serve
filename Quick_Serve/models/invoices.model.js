const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoice_number: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'partial'],
    default: 'pending'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);
