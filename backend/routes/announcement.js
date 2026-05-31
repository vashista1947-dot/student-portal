const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, requireRole } = require('../middlewares/auth');

router.get('/', protect, getAnnouncements);
router.post('/', protect, requireRole('admin', 'super_admin'), createAnnouncement);
router.delete('/:id', protect, requireRole('admin', 'super_admin'), deleteAnnouncement);

module.exports = router;