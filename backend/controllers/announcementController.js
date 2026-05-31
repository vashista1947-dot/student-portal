const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    next(error);
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, priority } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const announcement = await Announcement.create({
      title,
      content,
      priority: priority || 'Normal',
      postedBy: req.user._id
    });

    res.status(201).json({ message: 'Announcement posted successfully', announcement });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnnouncements, createAnnouncement, deleteAnnouncement };