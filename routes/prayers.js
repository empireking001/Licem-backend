const router = require('express').Router();
const Prayer = require('../models/Prayer');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const prayers = await Prayer.find({ approved: true }).sort({ createdAt: -1 }).limit(50);
    res.json(prayers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const request = String(req.body.request || '').trim();
    if (req.body.website || req.body.honeypot) return res.status(400).json({ message: 'Unable to accept this submission.' });
    if (request.length < 5 || request.length > 2000) return res.status(400).json({ message: 'Prayer requests must be between 5 and 2,000 characters.' });
    const prayer = await Prayer.create({
      name: req.body.anonymous ? 'Anonymous' : String(req.body.name || 'Anonymous').trim().slice(0, 120),
      request,
      category: String(req.body.category || 'General').slice(0, 80),
      anonymous: Boolean(req.body.anonymous),
      approved: false,
      moderationStatus: 'pending',
      answered: false,
    });
    res.status(201).json({ message: 'Prayer submitted for approval.', prayer });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try { res.json(await Prayer.find().sort({ approved: 1, createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/pray', async (req, res) => {
  try {
    const { visitorId } = req.body;
    const prayer = await Prayer.findOne({ _id: req.params.id, approved: true });
    if (!prayer) return res.status(404).json({ message: 'Not found' });
    if (visitorId && !prayer.prayedBy.includes(visitorId)) { prayer.prayedBy.push(visitorId); prayer.prayerCount += 1; await prayer.save(); }
    res.json({ prayerCount: prayer.prayerCount });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/approval', protect, adminOnly, async (req, res) => {
  try {
    const approved = req.body.approved === true;
    const moderationStatus = approved ? 'approved' : (req.body.rejected ? 'rejected' : 'pending');
    const p = await Prayer.findByIdAndUpdate(req.params.id, { approved, moderationStatus, moderationNote: String(req.body.note || '').trim().slice(0, 1000), moderatedAt: new Date(), moderatedBy: req.user._id }, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ message: 'Prayer not found' });
    res.json(p);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id/answered', protect, adminOnly, async (req, res) => {
  try { res.json(await Prayer.findByIdAndUpdate(req.params.id, { answered: true }, { new: true })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await Prayer.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
