const router = require('express').Router();
const Donation = require('../models/Donation');
const { protect, adminOnly } = require('../middleware/auth');

// Public: submit a donation
router.post('/', async (req, res) => {
  try {
    const ref = 'TXN-' + Date.now();
    const donation = await Donation.create({ ...req.body, reference: ref });
    res.status(201).json({ message: 'Donation recorded. Thank you!', donation });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Admin: get all donations
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { type, method, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (method) filter.method = method;
    const total = await Donation.countDocuments(filter);
    const donations = await Donation.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((page - 1) * limit);
    const sum = await Donation.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const byType = await Donation.aggregate([
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    res.json({ donations, total, sum: sum[0]?.total || 0, byType, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: update donation status
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const d = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(d);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Admin: delete
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Donation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
