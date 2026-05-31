const mongoose = require('mongoose');

const ScheduledEmailSchema = new mongoose.Schema({
  receiverEmails: {
    type: String,
    required: true
  },
  ccEmails: {
    type: String
  },
  bccEmails: {
    type: String
  },
  companyName: {
    type: String,
    required: true
  },
  coordinators: [
    {
      name: {
        type: String,
        required: true
      },
      phone: {
        type: String
      }
    }
  ],
  scheduledFor: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  adminName: {
    type: String
  },
  sentAt: {
    type: Date
  },
  error: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ScheduledEmail', ScheduledEmailSchema);
