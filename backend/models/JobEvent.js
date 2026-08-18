const mongoose = require('mongoose');

const jobEventSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  season: {
    type: String,
    required: true
  },
  jobRole: {
    type: String,
    required: [true, 'Job role is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Tech', 'Non-Tech', 'Core', 'Sales'],
    required: true
  },
  opportunityType: {
    type: String,
    enum: [
      'Internship',
      'Internship + PPO',
      'FTE Only',
      'Intern + FTE',
      '2-Month Intern',
      '6-Month Intern',
      '6-Month Intern + PPO'
    ],
    required: true
  },
  batch: {
    type: Number,
    required: true
  },
  deadline: {
    type: String,
    required: true
  },
  allowedDegrees: [{
    type: String,
    enum: ['BTech', 'MTech', 'BBA', 'MBA', 'MSc', 'PhD', 'BDes', 'BArch']
  }],
  eligibleBranches: [{
    type: String
  }],
  personOfContact: {
    type: String,
    trim: true
  },
  backlogs: {
    type: Number,
    default: 0
  },
  minCGPA: {
    type: Number,
    default: 0
  },
  placeOfPosting: {
    type: String,
    trim: true
  },
  companyBond: {
    type: String,
    trim: true,
    default: 'None'
  },
  stipend: {
    type: String,
    trim: true
  },
  ctc: {
    type: String,
    trim: true
  },
  additionalInfo: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Completed'],
    default: 'Open'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('JobEvent', jobEventSchema);