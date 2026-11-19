const mongoose = require('mongoose');

const chatTurnSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, required: true },
  event: { type: mongoose.Schema.Types.ObjectId, required: true },
  requestId: { type: String, required: true },
  question: { type: String, required: true },
  attempt: { type: String, select: false },
  answer: String,
  sources: [{ _id: false, title: String, url: String }],
  reference: String,
  searchSuggestions: String,
  status: { type: String, enum: ['pending', 'complete', 'failed'], default: 'pending' }
}, { timestamps: true });

chatTurnSchema.index({ student: 1, event: 1, requestId: 1 }, { unique: true });
chatTurnSchema.index({ student: 1, event: 1, createdAt: -1 });
module.exports = mongoose.model('ChatTurn', chatTurnSchema);
