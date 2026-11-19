const mongoose = require('mongoose');
const { randomUUID } = require('node:crypto');
const ChatTurn = require('../models/ChatTurn');
const JobEvent = require('../models/JobEvent');
const { answerQuestion } = require('../utils/opportunityAssistant');

// Bound paid Gemini requests per student, including retries.
const usage = new Map();
const interval = setInterval(() => {
  for (const [id, window] of usage) {
    if (window.until <= Date.now()) usage.delete(id);
  }
}, 60000);
interval.unref();

function allowRequest(studentId) {
  const id = String(studentId);
  let window = usage.get(id);
  if (!window || window.until <= Date.now()) {
    window = { count: 0, until: Date.now() + 60000 };
    usage.set(id, window);
  }
  window.count += 1;
  return window.count <= 10;
}

async function loadOpportunity(req, res, next) {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(404).json({ message: 'Opportunity not found.' });
  req.opportunity = await JobEvent.findById(req.params.id).select('+jdText').populate('company', 'name');
  if (!req.opportunity) return res.status(404).json({ message: 'Opportunity not found.' });
  req.chatScope = { student: req.user._id, event: req.opportunity._id };
  next();
}

async function getChat(req, res) {
  res.json(await ChatTurn.find(req.chatScope).sort({ createdAt: 1, _id: 1 }).lean());
}

async function ask(req, res) {
  const { requestId, question } = req.body;
  if (typeof question !== 'string' || !question.trim() || question.length > 3000 ||
      typeof requestId !== 'string' || !/^[\w-]{12,80}$/.test(requestId)) {
    return res.status(400).json({ message: 'Enter a question of up to 3000 characters.' });
  }
  if (!allowRequest(req.user._id)) return res.status(429).json({ message: 'Please wait a minute before asking again.' });
  const key = { ...req.chatScope, requestId };
  const attempt = randomUUID();
  let turn = await ChatTurn.findOne(key);
  if (turn) {
    if (turn.question !== question.trim()) return res.status(409).json({ message: 'Message ID already used.' });
    if (turn.status === 'complete') return res.json(turn);
    turn = await ChatTurn.findOneAndUpdate({ ...key, $or: [{ status: 'failed' },
      { status: 'pending', updatedAt: { $lt: new Date(Date.now() - 90000) } }] },
      { status: 'pending', attempt }, { returnDocument: 'after' });
    if (!turn) return res.status(409).json({ message: 'This question is still being answered. Reopen the chat shortly.' });
  } else {
    try {
      turn = await ChatTurn.create({ ...key, question: question.trim(), attempt });
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ message: 'Question already received. Reopen the chat shortly.' });
      throw err;
    }
  }
  const claim = { _id: turn._id, attempt };
  if (!process.env.GEMINI_API_KEY) {
    await ChatTurn.updateOne(claim, { status: 'failed' });
    return res.status(503).json({ message: 'Your question is saved. The portal administrator needs to configure Gemini.' });
  }
  const history = await ChatTurn.find({ ...req.chatScope, status: 'complete', createdAt: { $lte: turn.createdAt } })
    .sort({ createdAt: -1 }).limit(8).lean();
  try {
    const result = await answerQuestion(req.opportunity, question.trim(), history.reverse());
    const saved = await ChatTurn.findOneAndUpdate(claim, { ...result, status: 'complete' }, { returnDocument: 'after' });
    if (!saved) return res.status(409).json({ message: 'A newer attempt is processing.' });
    res.json(saved);
  } catch (err) {
    console.warn('Opportunity chat:', err.message);
    await ChatTurn.updateOne(claim, { status: 'failed' });
    if (err.providerStatus === 429) {
      return res.status(429).json({ message: "Gemini's quota for this portal is exhausted. Your question is saved. Retry after quota resets, or ask the administrator to check the project's rate limits." });
    }
    res.status(503).json({ message: 'Gemini could not answer. Your question is saved. Please retry.' });
  }
}

module.exports = { loadOpportunity, getChat, ask };
