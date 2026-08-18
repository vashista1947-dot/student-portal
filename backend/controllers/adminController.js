const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');

// @desc    Create a new admin (super_admin only)
// @route   POST /api/admin/create-admin
const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      message: 'Admin account created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all admins (super_admin only)
// @route   GET /api/admin/admins
const getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an admin (super_admin only)
// @route   DELETE /api/admin/admins/:id
const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await User.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    if (admin.role !== 'admin') {
      return res.status(400).json({ message: 'Can only delete admin accounts' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const searchStudent = async (req, res, next) => {
  try {
    const q = req.query.q || req.query.rollNumber || '';

    let filter = {};
    if (q) {
      filter = {
        $or: [
          { name: { $regex: new RegExp(q, 'i') } },
          { rollNumber: { $regex: new RegExp(q, 'i') } },
          { branch: { $regex: new RegExp(q, 'i') } }
        ]
      };
    }

    const profiles = await StudentProfile.find(filter).populate('user', 'name email');
    res.json(profiles);
  } catch (error) {
    next(error);
  }
};

// @desc    Ban a student
// @route   PUT /api/admin/students/:id/ban
const banStudent = async (req, res, next) => {
  try {
    const { banReason } = req.body || {};

    const profile = await StudentProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    if (profile.isBanned) {
      return res.status(400).json({ message: 'Student is already banned' });
    }

    profile.isBanned = true;
    profile.banReason = banReason || 'Banned by admin';
    await profile.save();

    res.json({ message: `Student ${profile.name} has been banned`, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Unban a student
// @route   PUT /api/admin/students/:id/unban
const unbanStudent = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    if (!profile.isBanned) {
      return res.status(400).json({ message: 'Student is not banned' });
    }

    profile.isBanned = false;
    profile.banReason = '';
    await profile.save();

    res.json({ message: `Student ${profile.name} has been unbanned`, profile });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAdmin,
  getAdmins,
  deleteAdmin,
  searchStudent,
  banStudent,
  unbanStudent
};