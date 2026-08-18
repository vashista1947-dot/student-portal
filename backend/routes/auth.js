const express = require('express');
const router = express.Router();
const { registerStudent, loginUser, verifyOtp, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/register', registerStudent);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.get('/me', protect, getMe);

module.exports = router;