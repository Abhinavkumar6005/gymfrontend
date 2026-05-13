
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const memberSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  address: String,
  age: Number,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  membershipPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  membershipStart: { type: Date, required: true },
  membershipEnd: { type: Date, required: true },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'expired', 'suspended'], default: 'active' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

memberSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

memberSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Member', memberSchema);

