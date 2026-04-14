const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const Gallery = require('../models/Gallery');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Helper: set upload folder for gallery images
const galleryUpload = (req, res, next) => {
  req.uploadFolder = path.join(__dirname, '../uploads/gallery');
  next();
};

// PUBLIC: Get all published albums (grouped)
router.get('/', async (req, res) => {
  try {
    const { group } = req.query;
    const filter = { published: true };
    if (group && group !== 'All') filter.group = group;
    const albums = await Gallery.find(filter)
      .select('-images')
      .sort({ eventDate: -1, createdAt: -1 });
    // Get unique groups with counts
    const groups = await Gallery.aggregate([
      { $match: { published: true } },
      { $group: { _id: '$group', count: { $sum: 1 }, total: { $sum: { $size: '$images' } } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ albums, groups });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUBLIC: Get single album with images
router.get('/:id', async (req, res) => {
  try {
    const album = await Gallery.findById(req.params.id);
    if (!album || !album.published) return res.status(404).json({ message: 'Album not found' });
    res.json(album);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ADMIN: Get all albums (including unpublished)
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const albums = await Gallery.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(albums);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ADMIN: Create new album
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const album = await Gallery.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(album);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ADMIN: Update album details
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const album = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(album);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ADMIN: Upload images to an album
router.post('/:id/images', protect, adminOnly, galleryUpload, upload.array('images', 50), async (req, res) => {
  try {
    const album = await Gallery.findById(req.params.id);
    if (!album) return res.status(404).json({ message: 'Album not found' });
    const newImages = req.files.map(f => ({
      url: `/uploads/gallery/${f.filename}`,
      filename: f.originalname,
      caption: '',
      size: f.size
    }));
    album.images.push(...newImages);
    if (!album.coverImage && newImages.length > 0) album.coverImage = newImages[0].url;
    await album.save();
    res.json({ message: `${newImages.length} image(s) uploaded`, images: newImages, album });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ADMIN: Update image caption
router.put('/:albumId/images/:imageId', protect, adminOnly, async (req, res) => {
  try {
    const album = await Gallery.findById(req.params.albumId);
    const img = album.images.id(req.params.imageId);
    if (!img) return res.status(404).json({ message: 'Image not found' });
    img.caption = req.body.caption || img.caption;
    if (req.body.setCover) album.coverImage = img.url;
    await album.save();
    res.json(album);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ADMIN: Delete single image from album
router.delete('/:albumId/images/:imageId', protect, adminOnly, async (req, res) => {
  try {
    const album = await Gallery.findById(req.params.albumId);
    const img = album.images.id(req.params.imageId);
    if (!img) return res.status(404).json({ message: 'Image not found' });
    // Remove file from disk
    const filePath = path.join(__dirname, '..', img.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    img.deleteOne();
    // Reset cover if deleted
    if (album.coverImage === img.url) {
      album.coverImage = album.images[0]?.url || '';
    }
    await album.save();
    res.json({ message: 'Image deleted', album });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ADMIN: Delete entire album
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const album = await Gallery.findById(req.params.id);
    if (!album) return res.status(404).json({ message: 'Album not found' });
    // Delete all files from disk
    album.images.forEach(img => {
      const filePath = path.join(__dirname, '..', img.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
    await album.deleteOne();
    res.json({ message: 'Album deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
