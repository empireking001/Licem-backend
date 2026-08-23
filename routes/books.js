const express = require('express');
const Book = require('../models/Book');
const upload = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try { res.json(await Book.find({ published: true }).sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try { res.json(await Book.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/', protect, adminOnly, async (req, res) => {
  try { const book = await Book.create({ ...req.body, createdBy: req.user._id }); res.status(201).json(book); }
  catch (err) { res.status(400).json({ message: err.message }); }
});
router.post('/upload', protect, adminOnly, ...upload.single('file'), async (req, res) => {
  try {
    if (!req.file?.path) return res.status(400).json({ message: 'File is required' });
    res.status(201).json({ resourceUrl: upload.getFileUrl(req.file), fileName: req.file.originalname, resourceType: req.file.originalname.toLowerCase().endsWith('.pdf') ? 'pdf' : 'doc' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/cover-upload', protect, adminOnly, ...upload.single('cover'), async (req, res) => {
  try { if (!req.file?.path) return res.status(400).json({ message: 'Cover image is required' }); res.status(201).json({ coverUrl: upload.getFileUrl(req.file), fileName: req.file.originalname }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.put('/:id', protect, adminOnly, async (req, res) => {
  try { const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!book) return res.status(404).json({ message: 'Book not found' }); res.json(book); }
  catch (err) { res.status(400).json({ message: err.message }); }
});
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { const book = await Book.findByIdAndDelete(req.params.id); if (!book) return res.status(404).json({ message: 'Book not found' }); res.json({ message: 'Book deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/:id/download', async (req, res) => {
  try { const book = await Book.findOneAndUpdate({ _id: req.params.id, published: true }, { $inc: { downloads: 1 } }, { new: true }); if (!book) return res.status(404).json({ message: 'Book not found' }); res.json({ url: book.resourceUrl, fileName: book.fileName || book.title, resourceType: book.resourceType }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;
