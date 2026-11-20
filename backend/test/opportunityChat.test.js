const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Company = require('../models/Company');
const User = require('../models/User');
const ChatTurn = require('../models/ChatTurn');
const { extractPdf } = require('../utils/jobDescription');

function samplePdf() {
  const stream = 'BT /F1 12 Tf 20 100 Td (Practice SQL joins) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream'
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((obj, i) => { offsets.push(pdf.length); pdf += (i + 1) + ' 0 obj\n' + obj + '\nendobj\n'; });
  const start = pdf.length;
  pdf += 'xref\n0 6\n0000000000 65535 f \n';
  for (const offset of offsets) pdf += String(offset).padStart(10, '0') + ' 00000 n \n';
  pdf += 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + start + '\n%%EOF';
  return Buffer.from(pdf).toString('base64');
}

test('reads JD text from a PDF', async () => {
  assert.match(await extractPdf(samplePdf()), /Practice SQL joins/);
});

test('opportunity chat saves scoped history, context, citations and retriable questions', async t => {
  const mongo = await MongoMemoryServer.create();
  t.after(async () => { await mongoose.disconnect(); await mongo.stop(); });
  await mongoose.connect(mongo.getUri());
  await ChatTurn.init();
  const app = express();
  app.use(express.json());
  app.use('/events', require('../routes/event'));
  const server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  t.after(() => server.close());
  const root = 'http://127.0.0.1:' + server.address().port + '/events';
  const http = global.fetch;
  process.env.JWT_SECRET = 'test-only-signing-secret';
  process.env.GEMINI_API_KEY = 'test-only';
  let request;
  let fail = false;
  let grounded = true;
  t.mock.method(global, 'fetch', async (_url, options) => {
    request = JSON.parse(options.body);
    if (fail) return new Response('', { status: 503 });
    return Response.json({ candidates: [{ content: { parts: [{ text: 'Sample response' }] },
      groundingMetadata: { groundingChunks: grounded ? [{ web: { title: 'Campus report', uri: 'https://example.org/report' } }] : [] } }] });
  });

  const ids = Array.from({ length: 3 }, () => new mongoose.Types.ObjectId());
  await User.collection.insertMany(ids.map((_id, i) => ({ _id, role: i === 0 ? 'admin' : 'student', email: 'user' + i + '@example.org' })));
  const company = await Company.create({ name: 'Example', season: '2026', addedBy: ids[0] });
  async function call(user, suffix, body) {
    const headers = { Authorization: 'Bearer ' + jwt.sign({ id: ids[user] }, process.env.JWT_SECRET), 'Content-Type': 'application/json' };
    const res = await http(root + suffix, { method: body ? 'POST' : 'GET', headers, body: body && JSON.stringify(body) });
    return [res.status, await res.json()];
  }
  const job = { companyId: company.id, season: '2026', jobRole: 'Engineer', category: 'Tech',
    opportunityType: 'Internship', batch: 2027, deadline: '2027-01-01', additionalInfo: 'Data structures' };
  const [status, pdfEvent] = await call(0, '', { ...job, jdPdf: samplePdf() });
  assert.equal(status, 201);
  const pdfChat = '/' + pdfEvent.event._id + '/chat';
  const [, textEvent] = await call(0, '', job);
  const textChat = '/' + textEvent.event._id + '/chat';
  const msg = { requestId: 'request-one-0001', question: 'What should I study?' };
  const [sent, turn] = await call(1, pdfChat, msg);
  assert.equal(sent, 200);
  assert.equal(turn.reference, 'JD PDF');
  assert.match(JSON.stringify(request.contents), /Practice SQL joins/);
  assert.equal(request.tools, undefined);
  await call(1, pdfChat, msg);
  assert.equal((await call(1, pdfChat))[1].length, 1);
  assert.equal((await call(2, pdfChat))[1].length, 0);
  assert.equal((await call(1, textChat))[1].length, 0);
  const follow = { requestId: 'request-two-0002', question: 'What was asked last year?' };
  const [, researched] = await call(1, pdfChat, follow);
  assert.equal(researched.sources[0].title, 'Campus report');
  assert.deepEqual(request.tools, [{ google_search: {} }]);
  assert.equal(request.contents[1].role, 'model');
  grounded = false;
  const [, unavailable] = await call(1, textChat, follow);
  assert.match(unavailable.answer, /could not verify/);
  assert.equal(unavailable.reference, 'Job Specs & Description');
  fail = true;
  assert.equal((await call(1, textChat, msg))[0], 503);
  fail = false;
  assert.equal((await call(1, textChat, msg))[0], 200);
  assert.equal((await call(1, textChat))[1].length, 2);
  const [archiveStatus, archive] = await call(1, '/chat/history');
  assert.equal(archiveStatus, 200);
  assert.equal(archive.items.length, 4);
  assert.deepEqual(new Set(archive.items.map(t => t.event._id)), new Set([textEvent.event._id, pdfEvent.event._id]));
  assert.equal(archive.items[0].event.company.name, 'Example');
  assert.equal(archive.items[0].answer, 'Sample response');
  assert.deepEqual((await call(2, '/chat/history?student=' + ids[1]))[1].items, []);
  const uri = mongo.getUri();
  await mongoose.disconnect();
  await mongoose.connect(uri);
  assert.equal((await call(1, pdfChat))[1].length, 2);
});

test('search quota failure falls back once and preserves real generation quota errors', async t => {
  const { answerQuestion } = require('../utils/opportunityAssistant');
  const requests = [];
  let plainStatus = 200;
  t.mock.method(global, 'fetch', async (_url, opts) => {
    const body = JSON.parse(opts.body);
    requests.push(body);
    if (body.tools || plainStatus === 429) return new Response('', { status: 429 });
    return Response.json({ candidates: [{ content: { parts: [{ text: 'Practice: design a cache.' }] } }] });
  });
  const ask = () => answerQuestion({ jobRole: 'SWE' }, 'what questions are most asked?', []);
  const answer = await ask();
  assert.deepEqual(requests.map(body => !!body.tools), [true, false]);
  assert.equal(answer.answer, 'Practice: design a cache.');
  assert.match(answer.answer, /design a cache/);
  assert.deepEqual(answer.sources, []);
  plainStatus = 429;
  await assert.rejects(ask, { providerStatus: 429 });
  assert.equal(requests.length, 4);
});
