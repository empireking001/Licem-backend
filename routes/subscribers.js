const router = require('express').Router();
const Subscriber = require('../models/Subscriber');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'A valid email address is required.' });
    const subscriber = await Subscriber.findOneAndUpdate(
      { email },
      { $set: { active: true, source: req.body.source || 'homepage', subscribedAt: new Date() } },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
    );
    res.status(200).json({ message: 'Subscription saved successfully.', data: subscriber });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try { res.json(await Subscriber.find().sort({ subscribedAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try { res.json(await Subscriber.findByIdAndUpdate(req.params.id, { active: Boolean(req.body.active) }, { new: true })); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
