const router = require('express').Router();
const Comment = require('../models/Comment');
const { protect, adminOnly } = require('../middleware/auth');

// Public: get approved comments for a ref
router.get('/:refType/:refId', async (req, res) => {
  try {
    const comments = await Comment.find({
      refType: req.params.refType,
      refId: req.params.refId,
      approved: true,
      spam: false
    }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Public: post a comment
router.post('/', async (req, res) => {
  try {
    const comment = await Comment.create(req.body);
    res.status(201).json({ message: 'Comment submitted for review', comment });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Admin: get all comments
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { approved, spam } = req.query;
    const filter = {};
    if (approved !== undefined) filter.approved = approved === 'true';
    if (spam !== undefined) filter.spam = spam === 'true';
    const comments = await Comment.find(filter).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: approve
router.put('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const c = await Comment.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    res.json(c);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: mark spam
router.put('/:id/spam', protect, adminOnly, async (req, res) => {
  try {
    const c = await Comment.findByIdAndUpdate(req.params.id, { spam: true, approved: false }, { new: true });
    res.json(c);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: delete
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
