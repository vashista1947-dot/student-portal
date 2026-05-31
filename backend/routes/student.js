const express = require('express');
const router = express.Router();
const { getProfile, createProfile, updateProfile } = require('../controllers/studentController');
const { applyToEvent, getMyApplications } = require('../controllers/applicationController');
const { protect, requireRole } = require('../middlewares/auth');

// Profile routes
router.get('/profile', protect, requireRole('student'), getProfile);
router.post('/profile', protect, requireRole('student'), createProfile);
router.put('/profile', protect, requireRole('student'), updateProfile);

// Application routes
router.post('/events/:id/apply', protect, requireRole('student'), applyToEvent);
router.get('/applications', protect, requireRole('student'), getMyApplications);

module.exports = router;