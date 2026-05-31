const express = require('express');
const router = express.Router();
const {
  createAdmin, getAdmins, deleteAdmin,
  searchStudent, banStudent, unbanStudent
} = require('../controllers/adminController');
const { protect, requireRole } = require('../middlewares/auth');

// Super admin only
router.post('/create-admin', protect, requireRole('super_admin'), createAdmin);
router.get('/admins', protect, requireRole('super_admin'), getAdmins);
router.delete('/admins/:id', protect, requireRole('super_admin'), deleteAdmin);

// Admin + Super admin
router.get('/students/search', protect, requireRole('admin', 'super_admin'), searchStudent);
router.put('/students/:id/ban', protect, requireRole('admin', 'super_admin'), banStudent);
router.put('/students/:id/unban', protect, requireRole('admin', 'super_admin'), unbanStudent);

module.exports = router;