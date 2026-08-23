const express = require('express');
const RadioSession = require('../models/RadioSession');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.post('/pulse', async (req, res) => {
  try {
    const sessionId = String(req.body.sessionId || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
    if (!sessionId) return res.status(400).json({ message: 'sessionId required' });
    await RadioSession.findOneAndUpdate({ sessionId }, { $set: { lastSeenAt: new Date(), userAgent: req.get('user-agent') || '' }, $setOnInsert: { startedAt: new Date() } }, { upsert: true });
    res.status(204).end();
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.delete('/pulse/:sessionId', async (req, res) => {
  try { await RadioSession.deleteOne({ sessionId: req.params.sessionId }); res.status(204).end(); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/summary', protect, adminOnly, async (req, res) => {
  try {
    const cutoff = new Date(Date.now() - 45000);
    await RadioSession.deleteMany({ lastSeenAt: { $lt: new Date(Date.now() - 86400000) } });
    const activeListeners = await RadioSession.countDocuments({ lastSeenAt: { $gte: cutoff } });
    const totalSessions = await RadioSession.countDocuments({ startedAt: { $gte: new Date(Date.now() - 86400000) } });
    res.json({ activeListeners, totalSessions24h: totalSessions, measurement: 'website-player estimate', asOf: new Date() });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;
