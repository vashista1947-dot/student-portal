const express = require('express');
const router = express.Router();
const { getCompanies, addCompany, updateCompany, deleteCompany } = require('../controllers/companyController');
const { protect, requireRole } = require('../middlewares/auth');

router.get('/', protect, requireRole('admin', 'super_admin'), getCompanies);
router.post('/', protect, requireRole('admin', 'super_admin'), addCompany);
router.put('/:id', protect, requireRole('admin', 'super_admin'), updateCompany);
router.delete('/:id', protect, requireRole('admin', 'super_admin'), deleteCompany);

module.exports = router;