const express = require('express');
const router = express.Router();
const {
  getEvents, getEvent, createEvent, updateEvent,
  deleteEvent, getRegistrations, getEmailPreview
} = require('../controllers/eventController');
const { protect, requireRole } = require('../middlewares/auth');

// Public for students (filtered), full for admin
router.get('/', protect, getEvents);
router.get('/:id', protect, getEvent);

// Admin only
router.post('/', protect, requireRole('admin', 'super_admin'), createEvent);
router.put('/:id', protect, requireRole('admin', 'super_admin'), updateEvent);
router.delete('/:id', protect, requireRole('admin', 'super_admin'), deleteEvent);
router.get('/:id/registrations', protect, requireRole('admin', 'super_admin'), getRegistrations);
router.get('/:id/email-preview', protect, requireRole('admin', 'super_admin'), getEmailPreview);

module.exports = router;