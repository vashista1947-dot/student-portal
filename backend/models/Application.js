const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobEvent',
    required: true
  },

  // Snapshot of student data at the time of application
  studentName: { type: String, required: true },
  rollNumber: { type: String, required: true },
  phone: { type: String, required: true },
  branch: { type: String, required: true },
  degree: { type: String, required: true },
  yearOfPassing: { type: Number, required: true },
  collegeMail: { type: String, required: true },
  personalMail: { type: String },
  dob: { type: String, required: true },
  cgpa: { type: Number, required: true },
  class10Percentage: { type: Number, required: true },
  class12Percentage: { type: Number, required: true },
  resumeDriveLink: { type: String, required: true },

  appliedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Selected', 'Rejected'],
    default: 'Applied'
  }
}, {
  timestamps: true
});

// Prevent duplicate applications
applicationSchema.index({ student: 1, jobEvent: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);