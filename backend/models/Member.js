const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: String,
  age: Number,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  membershipPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  membershipStart: { type: Date, required: true },
  membershipEnd: { type: Date, required: true },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'expired', 'suspended', 'cancelled', 'pending'], default: 'active' },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
  amountPaid: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Member', memberSchema);