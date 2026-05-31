const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOtpEmail } = require('../utils/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register a new student
// @route   POST /api/auth/register
const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, rollNumber } = req.body;

    // Validate @nsut.ac.in domain
    if (!email || !email.endsWith('@nsut.ac.in')) {
      return res.status(400).json({ message: 'Only @nsut.ac.in email addresses are allowed' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role === 'admin' || existingUser.role === 'super_admin') {
        // If they are an admin or super admin, we update them to also have a student profile
        if (rollNumber) {
          const existingRoll = await User.findOne({ rollNumber, email: { $ne: email } });
          if (existingRoll) {
            return res.status(400).json({ message: 'This roll number is already registered by another student' });
          }
        }
        
        existingUser.rollNumber = rollNumber;
        if (password) {
          existingUser.password = password;
        }
        await existingUser.save();
        
        return res.status(200).json({
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          rollNumber: existingUser.rollNumber,
          token: generateToken(existingUser._id)
        });
      } else {
        return res.status(400).json({ message: 'An account with this email already exists' });
      }
    }

    // Check if roll number already taken
    if (rollNumber) {
      const existingRoll = await User.findOne({ rollNumber });
      if (existingRoll) {
        return res.status(400).json({ message: 'This roll number is already registered' });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      rollNumber,
      role: 'student'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNumber: user.rollNumber,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (student / admin / super_admin) - Initiates OTP Challenge
// @route   POST /api/auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNumber: user.rollNumber,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and complete login
// @route   POST /api/auth/verify-otp
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({ message: 'Email and OTP code are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP matches and has not expired
    if (!user.otpCode || user.otpCode !== otpCode || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    // Clear OTP fields
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNumber: user.rollNumber,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = { registerStudent, loginUser, verifyOtp, getMe };