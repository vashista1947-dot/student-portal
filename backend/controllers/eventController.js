const JobEvent = require('../models/JobEvent');
const Company = require('../models/Company');
const Application = require('../models/Application');

// @desc    Get all events (chronological, filterable)
// @route   GET /api/events
const getEvents = async (req, res, next) => {
  try {
    const { season, category, batch, company } = req.query;
    const filter = {};

    if (season) filter.season = season;
    if (category) filter.category = category;
    if (batch) filter.batch = Number(batch);
    if (company) filter.company = company;

    const events = await JobEvent.find(filter)
      .populate('company', 'name season')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event details
// @route   GET /api/events/:id
const getEvent = async (req, res, next) => {
  try {
    const event = await JobEvent.findById(req.params.id)
      .populate('company', 'name season')
      .populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
const createEvent = async (req, res, next) => {
  try {
    const {
      companyId, season, jobRole, category, opportunityType,
      batch, deadline, allowedDegrees, eligibleBranches,
      personOfContact, backlogs, minCGPA, placeOfPosting,
      companyBond, stipend, ctc, additionalInfo
    } = req.body;

    // Verify company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const event = await JobEvent.create({
      company: companyId,
      season,
      jobRole,
      category,
      opportunityType,
      batch,
      deadline,
      allowedDegrees,
      eligibleBranches,
      personOfContact,
      backlogs,
      minCGPA,
      placeOfPosting,
      companyBond,
      stipend,
      ctc,
      additionalInfo,
      createdBy: req.user._id
    });

    const populatedEvent = await JobEvent.findById(event._id)
      .populate('company', 'name season')
      .populate('createdBy', 'name email');

    res.status(201).json({ message: 'Event created successfully', event: populatedEvent });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event (owner only)
// @route   PUT /api/events/:id
const updateEvent = async (req, res, next) => {
  try {
    const event = await JobEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Ownership check
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only the admin who created this event can modify it' });
    }

    const updatableFields = [
      'jobRole', 'category', 'opportunityType', 'batch', 'deadline',
      'allowedDegrees', 'eligibleBranches', 'personOfContact', 'backlogs',
      'minCGPA', 'placeOfPosting', 'companyBond', 'stipend', 'ctc',
      'additionalInfo', 'status'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    const updatedEvent = await event.save();
    const populatedEvent = await JobEvent.findById(updatedEvent._id)
      .populate('company', 'name season')
      .populate('createdBy', 'name email');

    res.json({ message: 'Event updated successfully', event: populatedEvent });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event (owner only)
// @route   DELETE /api/events/:id
const deleteEvent = async (req, res, next) => {
  try {
    const event = await JobEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Ownership check
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only the admin who created this event can delete it' });
    }

    await JobEvent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get registrations/applicants for an event
// @route   GET /api/events/:id/registrations
const getRegistrations = async (req, res, next) => {
  try {
    const event = await JobEvent.findById(req.params.id).populate('company', 'name');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const applications = await Application.find({ jobEvent: req.params.id })
      .sort({ appliedAt: -1 });

    res.json({
      event: {
        _id: event._id,
        jobRole: event.jobRole,
        companyName: event.company.name,
        season: event.season,
        opportunityType: event.opportunityType
      },
      totalApplicants: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get email preview for an event
// @route   GET /api/events/:id/email-preview
const getEmailPreview = async (req, res, next) => {
  try {
    const event = await JobEvent.findById(req.params.id)
      .populate('company', 'name')
      .populate('createdBy', 'name');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const emailPreview = {
      subject: `${event.company.name} | ${event.jobRole} - ${event.opportunityType}`,
      body: `Dear Sir/Madam,

We are pleased to inform you about the following placement opportunity:

🏢 Company: ${event.company.name}
💼 Role: ${event.jobRole}
📁 Category: ${event.category}
📋 Type: ${event.opportunityType}
🎓 Batch: ${event.batch}
📅 Deadline: ${event.deadline}
📍 Location: ${event.placeOfPosting || 'N/A'}
💰 CTC: ${event.ctc || 'N/A'}
💵 Stipend: ${event.stipend || 'N/A'}
📊 Min CGPA: ${event.minCGPA || 'N/A'}
📚 Degrees: ${event.allowedDegrees?.join(', ') || 'All'}
🔗 Bond: ${event.companyBond || 'None'}
👤 Contact: ${event.personOfContact || 'N/A'}
📝 Additional Info: ${event.additionalInfo || 'N/A'}

Regards,
${event.createdBy.name}
Training & Placement Cell, NSUT`
    };

    res.json(emailPreview);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getRegistrations,
  getEmailPreview
};