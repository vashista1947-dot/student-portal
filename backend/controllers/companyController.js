const Company = require('../models/Company');

// @desc    Get all companies (filterable by season)
// @route   GET /api/companies
const getCompanies = async (req, res, next) => {
  try {
    const { season } = req.query;
    const filter = season ? { season } : {};

    const companies = await Company.find(filter)
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(companies);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new company
// @route   POST /api/companies
const addCompany = async (req, res, next) => {
  try {
    const { name, season } = req.body;

    if (!name || !season) {
      return res.status(400).json({ message: 'Company name and season are required' });
    }

    // Check if company already exists in this season
    const existingCompany = await Company.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      season
    });

    if (existingCompany) {
      return res.status(400).json({
        message: `'${name}' already exists in placement season ${season}. Cannot add duplicate.`
      });
    }

    const company = await Company.create({
      name,
      season,
      addedBy: req.user._id
    });

    res.status(201).json({ message: 'Company added successfully', company });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company (owner only)
// @route   PUT /api/companies/:id
const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Ownership check
    if (company.addedBy.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only the admin who added this company can modify it' });
    }

    const { name, season } = req.body;
    if (name) company.name = name;
    if (season) company.season = season;

    const updatedCompany = await company.save();
    res.json({ message: 'Company updated successfully', company: updatedCompany });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company (owner only)
// @route   DELETE /api/companies/:id
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Ownership check
    if (company.addedBy.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only the admin who added this company can delete it' });
    }

    await Company.findByIdAndDelete(req.params.id);
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCompanies, addCompany, updateCompany, deleteCompany };