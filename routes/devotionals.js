const express = require('express');
const Devotional = require('../models/Devotional');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/current', async (req, res) => {
  try {
    const devotional = await Devotional.findOne({ status: 'published', skipPublication: false, publishAt: { $lte: new Date() } }).sort({ publishAt: -1 });
    res.json(devotional || null);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/', protect, adminOnly, async (req, res) => {
  try { res.json(await Devotional.find().sort({ publishAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const publishAt = new Date(req.body.publishAt);
    const status = req.body.status || (publishAt > new Date() ? 'scheduled' : 'published');
    const item = await Devotional.create({ ...req.body, publishAt, status, createdBy: req.user._id });
    res.status(201).json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.publishAt) payload.publishAt = new Date(payload.publishAt);
    if (payload.skipPublication) payload.status = 'draft';
    else if (payload.publishAt && payload.publishAt > new Date()) payload.status = 'scheduled';
    else if (payload.body) payload.status = 'published';
    const item = await Devotional.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Devotional not found' });
    res.json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await Devotional.findByIdAndDelete(req.params.id); res.json({ message: 'Devotional deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/ai-draft', protect, adminOnly, async (req, res) => {
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ message: 'AI draft generation is not configured. Add OPENAI_API_KEY to the backend environment.' });
  try {
    const prompt = `Create a concise Christian weekly devotional draft. Theme: ${req.body.theme || 'faith and hope'}. Scripture: ${req.body.scripture || 'Choose one relevant reference'}. Return JSON with title, scripture, and body. Do not claim divine authority.`;
    const response = await fetch(process.env.OPENAI_API_BASE || 'https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', temperature: 0.7, messages: [{ role: 'user', content: prompt }] }) });
    if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    res.json({ draft: text, source: 'ai-draft', requiresReview: true });
  } catch (err) { res.status(502).json({ message: err.message }); }
});
module.exports = router;
