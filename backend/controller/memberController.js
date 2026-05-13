const Member = require('../models/Member');

const getAllMembers = async (req, res) => {
  
  try {
    const members = await Member.find().populate('membershipPlan');
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createMember = async (req, res) => {
  try {
    const member = new Member(req.body);
    await member.save();
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteMember = async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getExpiringMembers = async (req, res) => {
  try {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const members = await Member.find({
      membershipEnd: { $lte: nextWeek, $gte: new Date() },
      status: 'active'
    }).populate('membershipPlan');
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllMembers, createMember, updateMember, deleteMember, getExpiringMembers };