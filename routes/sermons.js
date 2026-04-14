const router = require('express').Router();
const Sermon = require('../models/Sermon');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/sermons  (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, pinned, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (pinned === 'true') filter.pinned = true;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { speaker: { $regex: search, $options: 'i' } }
    ];
    const total = await Sermon.countDocuments(filter);
    const sermons = await Sermon.find(filter)
      .sort({ pinned: -1, date: -1 })
      .limit(Number(limit))
      .skip((page - 1) * limit);
    res.json({ sermons, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/sermons/:id
router.get('/:id', async (req, res) => {
  try {
    const sermon = await Sermon.findById(req.params.id);
    if (!sermon) return res.status(404).json({ message: 'Sermon not found' });
    sermon.views += 1;
    await sermon.save();
    res.json(sermon);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/sermons  (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const sermon = await Sermon.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(sermon);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT /api/sermons/:id  (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const sermon = await Sermon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(sermon);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/sermons/:id  (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Sermon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sermon deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/sermons/:id/like  (public)
router.post('/:id/like', async (req, res) => {
  try {
    const { visitorId } = req.body;
    const sermon = await Sermon.findById(req.params.id);
    if (!sermon) return res.status(404).json({ message: 'Not found' });
    const idx = sermon.likedBy.indexOf(visitorId);
    if (idx > -1) {
      sermon.likedBy.splice(idx, 1);
      sermon.likes = Math.max(0, sermon.likes - 1);
    } else {
      sermon.likedBy.push(visitorId);
      sermon.likes += 1;
    }
    await sermon.save();
    res.json({ likes: sermon.likes, liked: idx === -1 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
