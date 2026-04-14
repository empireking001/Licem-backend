const router = require('express').Router();
const Event = require('../models/Event');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { upcoming } = req.query;
    const filter = upcoming === 'true' ? { date: { $gte: new Date() } } : {};
    const events = await Event.find(filter).sort({ date: 1 });
    res.json(events);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(event);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(event);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/events/:id/rsvp  (public)
router.post('/:id/rsvp', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const alreadyRsvpd = event.rsvps.find(r => r.email === email);
    if (alreadyRsvpd) return res.status(400).json({ message: 'You have already RSVPd' });
    event.rsvps.push({ name, email, phone });
    await event.save();
    res.json({ message: 'RSVP successful!', count: event.rsvps.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
