const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Personal Info
  name: { type: String, required: true, trim: true },
  rollNumber: { type: String, required: true, trim: true },
  dob: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  category: { type: String, trim: true },
  address: { type: String, trim: true },
  fathersName: { type: String, required: true, trim: true },
  mothersName: { type: String, required: true, trim: true },

  // Academic Info
  degree: {
    type: String,
    enum: ['BTech', 'MTech', 'BBA', 'MBA', 'MSc', 'PhD', 'BDes', 'BArch'],
    required: true
  },
  branch: { type: String, required: true },
  yearOfPassing: { type: Number, required: true },
  class10Percentage: { type: Number, required: true },
  class12Percentage: { type: Number, required: true },

  // Semester-wise SGPAs (manual input)
  sem1Sgpa: { type: Number, default: null },
  sem2Sgpa: { type: Number, default: null },
  sem3Sgpa: { type: Number, default: null },
  sem4Sgpa: { type: Number, default: null },
  sem5Sgpa: { type: Number, default: null },
  sem6Sgpa: { type: Number, default: null },
  sem7Sgpa: { type: Number, default: null },
  sem8Sgpa: { type: Number, default: null },

  // CGPA (all manual input)
  cgpa: { type: Number, required: true },
  cgpaAfter1Drop: { type: Number, default: null },  // Pre-final year only
  cgpaAfter2Drops: { type: Number, default: null },  // Final year only

  // Contact Info
  collegeMail: { type: String, required: true, lowercase: true },
  personalMail: { type: String, trim: true, lowercase: true },
  phone: { type: String, required: true },

  // Resume
  resumeDriveLink: { type: String, required: true },

  // Status
  isBanned: { type: Boolean, default: false },
  banReason: { type: String, default: '' },
  profileCompleted: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);