const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const JobEvent = require('../models/JobEvent');

// @desc    Apply to a job event
// @route   POST /api/student/events/:id/apply
const applyToEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;

    // Get student profile
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(400).json({ message: 'Please complete your profile before applying' });
    }

    // Check if banned
    if (profile.isBanned) {
      return res.status(403).json({ message: 'Your account has been banned. You cannot apply to any opportunities.' });
    }

    // Get the event
    const event = await JobEvent.findById(eventId).populate('company', 'name');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is open
    if (event.status !== 'Open') {
      return res.status(400).json({ message: 'This event is no longer accepting applications' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      student: req.user._id,
      jobEvent: eventId
    });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this event' });
    }

    // Check eligibility — branch
    if (event.eligibleBranches && event.eligibleBranches.length > 0) {
      if (!event.eligibleBranches.includes(profile.branch)) {
        return res.status(400).json({ message: 'Your branch is not eligible for this event' });
      }
    }

    // Check eligibility — degree
    if (event.allowedDegrees && event.allowedDegrees.length > 0) {
      if (!event.allowedDegrees.includes(profile.degree)) {
        return res.status(400).json({ message: 'Your degree is not eligible for this event' });
      }
    }

    // Check eligibility — CGPA
    if (event.minCGPA && profile.cgpa < event.minCGPA) {
      return res.status(400).json({ message: `Minimum CGPA required is ${event.minCGPA}. Your CGPA: ${profile.cgpa}` });
    }

    // Check eligibility — batch
    if (event.batch && profile.yearOfPassing !== event.batch) {
      return res.status(400).json({ message: 'Your batch/year of passing does not match this event' });
    }

    // Create application with snapshot of student data
    const application = await Application.create({
      student: req.user._id,
      jobEvent: eventId,
      studentName: profile.name,
      rollNumber: profile.rollNumber,
      phone: profile.phone,
      branch: profile.branch,
      degree: profile.degree,
      yearOfPassing: profile.yearOfPassing,
      collegeMail: profile.collegeMail,
      personalMail: profile.personalMail,
      dob: profile.dob,
      cgpa: profile.cgpa,
      class10Percentage: profile.class10Percentage,
      class12Percentage: profile.class12Percentage,
      resumeDriveLink: profile.resumeDriveLink
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my applications
// @route   GET /api/student/applications
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate({
        path: 'jobEvent',
        populate: { path: 'company', select: 'name' }
      })
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

module.exports = { applyToEvent, getMyApplications };