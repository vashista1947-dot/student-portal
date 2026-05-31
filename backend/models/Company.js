const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  season: {
    type: String,
    required: [true, 'Placement season is required'],
    trim: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Prevent duplicate company in the same season
companySchema.index({ name: 1, season: 1 }, { unique: true });

module.exports = mongoose.model('Company', companySchema);