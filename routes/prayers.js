const router = require('express').Router();
// const mongoose = require('mongoose');
// const { protect, adminOnly } = require('../middleware/auth');
const Prayer = require("../models/Prayer");
const { protect, adminOnly } = require("../middleware/auth");

// const prayerSchema = new mongoose.Schema({
//   name:         { type: String, default: 'Anonymous' },
//   request:      { type: String, required: true },
//   category:     { type: String, default: 'General' },
//   anonymous:    { type: Boolean, default: false },
//   prayerCount:  { type: Number, default: 0 },
//   prayedBy:     [{ type: String }],
//   approved:     { type: Boolean, default: true },
//   answered:     { type: Boolean, default: false },
// }, { timestamps: true });

// const Prayer = mongoose.model('Prayer', prayerSchema);

router.get('/', async (req, res) => {
  try {
    const prayers = await Prayer.find({ approved: true }).sort({ createdAt: -1 }).limit(50);
    res.json(prayers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const prayer = await Prayer.create(req.body);
    res.status(201).json(prayer);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/:id/pray', async (req, res) => {
  try {
    const { visitorId } = req.body;
    const prayer = await Prayer.findById(req.params.id);
    if (!prayer) return res.status(404).json({ message: 'Not found' });
    if (!prayer.prayedBy.includes(visitorId)) {
      prayer.prayedBy.push(visitorId);
      prayer.prayerCount += 1;
      await prayer.save();
    }
    res.json({ prayerCount: prayer.prayerCount });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/answered', protect, adminOnly, async (req, res) => {
  try {
    const p = await Prayer.findByIdAndUpdate(req.params.id, { answered: true }, { new: true });
    res.json(p);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Prayer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;