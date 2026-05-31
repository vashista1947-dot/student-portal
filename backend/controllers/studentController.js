const StudentProfile = require('../models/StudentProfile');

// @desc    Get own profile
// @route   GET /api/student/profile
const getProfile = async (req, res, next) => {
  try {
    console.log('--- DEBUG getProfile ---');
    console.log('Request User:', { id: req.user?._id, email: req.user?.email, name: req.user?.name });
    const profile = await StudentProfile.findOne({ user: req.user._id });
    console.log('Found Profile:', profile ? { id: profile._id, user: profile.user, name: profile.name, rollNumber: profile.rollNumber } : null);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Please complete your profile setup.' });
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Create / complete profile (one-time)
// @route   POST /api/student/profile
const createProfile = async (req, res, next) => {
  try {
    // Check if profile already exists
    const existingProfile = await StudentProfile.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists. Use update instead.' });
    }

    const profileData = {
      user: req.user._id,
      name: req.body.name,
      rollNumber: req.user.rollNumber,
      dob: req.body.dob,
      gender: req.body.gender,
      category: req.body.category,
      address: req.body.address,
      fathersName: req.body.fathersName,
      mothersName: req.body.mothersName,
      degree: req.body.degree,
      branch: req.body.branch,
      yearOfPassing: req.body.yearOfPassing,
      class10Percentage: req.body.class10Percentage,
      class12Percentage: req.body.class12Percentage,
      sem1Sgpa: req.body.sem1Sgpa,
      sem2Sgpa: req.body.sem2Sgpa,
      sem3Sgpa: req.body.sem3Sgpa,
      sem4Sgpa: req.body.sem4Sgpa,
      sem5Sgpa: req.body.sem5Sgpa,
      sem6Sgpa: req.body.sem6Sgpa,
      sem7Sgpa: req.body.sem7Sgpa,
      sem8Sgpa: req.body.sem8Sgpa,
      cgpa: req.body.cgpa,
      cgpaAfter1Drop: req.body.cgpaAfter1Drop,
      cgpaAfter2Drops: req.body.cgpaAfter2Drops,
      collegeMail: req.user.email,
      personalMail: req.body.personalMail,
      phone: req.body.phone,
      resumeDriveLink: req.body.resumeDriveLink,
      profileCompleted: true
    };

    const profile = await StudentProfile.create(profileData);
    res.status(201).json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/student/profile
const updateProfile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Fields that can be updated
    const updatableFields = [
      'name', 'dob', 'gender', 'category', 'address', 'fathersName', 'mothersName',
      'degree', 'branch', 'yearOfPassing',
      'class10Percentage', 'class12Percentage',
      'sem1Sgpa', 'sem2Sgpa', 'sem3Sgpa', 'sem4Sgpa',
      'sem5Sgpa', 'sem6Sgpa', 'sem7Sgpa', 'sem8Sgpa',
      'cgpa', 'cgpaAfter1Drop', 'cgpaAfter2Drops',
      'personalMail', 'phone', 'resumeDriveLink'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    const updatedProfile = await profile.save();
    res.json(updatedProfile);
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, createProfile, updateProfile };