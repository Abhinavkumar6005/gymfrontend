const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/Payment');
const Member = require('../models/Member');

const processPayment = async (req, res) => {
  try {
    const { memberId, amount, paymentForMonths, paymentMethod } = req.body;
    const payment = new Payment({
      memberId, amount, paymentForMonths, paymentMethod,
      transactionId: uuidv4(),
      receiptNumber: `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    });
    await payment.save();

    const member = await Member.findById(memberId);
    const newEndDate = new Date(member.membershipEnd);
    newEndDate.setMonth(newEndDate.getMonth() + paymentForMonths);
    member.membershipEnd = newEndDate;
    member.status = 'active';
    member.payments.push(payment._id);
    await member.save();

    res.status(201).json({ payment, member, receiptNumber: payment.receiptNumber });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMemberPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ memberId: req.params.memberId });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReceipt = async (req, res) => {
  try {
    const payment = await Payment.findOne({ receiptNumber: req.params.receiptNumber }).populate('memberId');
    if (!payment) return res.status(404).json({ error: 'Receipt not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { processPayment, getMemberPayments, getReceipt };