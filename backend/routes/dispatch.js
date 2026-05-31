const express = require('express');
const router = express.Router();
const { sendData, sendInvitation } = require('../controllers/dispatchController');
const { protect, requireRole } = require('../middlewares/auth');

router.post('/send', protect, requireRole('admin', 'super_admin'), sendData);
router.post('/send-invitation', protect, requireRole('admin', 'super_admin'), sendInvitation);

module.exports = router;