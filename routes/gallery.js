const router = require('express').Router();
const Gallery = require('../models/Gallery');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getFileUrl, deleteStoredFile } = require('../middleware/upload');

// Helper: set upload folder for gallery images (simple name — resolved by upload middleware)
const galleryUpload = (req, res, next) => {
  req.uploadFolder = 'gallery';
  next();
};

const safeDownloadName = (name = 'photo') => {
  const cleaned = String(name).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
  return cleaned || 'photo';
};

// PUBLIC: Download a known gallery asset by database identifiers only.
// The endpoint never accepts or fetches a caller-provided URL.
router.get('/download/:albumId/:imageId', async (req, res) => {
  try {
    const album = await Gallery.findOne({ _id: req.params.albumId, published: true }).select('images');
    const image = album?.images?.id(req.params.imageId);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    const source = String(image.url || '');
    const parsed = new URL(source);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'res.cloudinary.com') {
      return res.status(400).json({ message: 'Unsupported media source' });
    }

    const upstream = await fetch(parsed, { redirect: 'error' });
    if (!upstream.ok || !upstream.body) {
      return res.status(502).json({ message: 'Media asset is unavailable' });
    }

    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
    const contentLength = upstream.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    res.setHeader('Content-Disposition', `attachment; filename="${safeDownloadName(image.filename || 'photo.jpg')}"`);
    const reader = upstream.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!res.write(Buffer.from(value))) await new Promise(resolve => res.once('drain', resolve));
      }
      res.end();
    };
    await pump();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ message: 'Download failed' });
    else res.end();
  }
});

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
      url: getFileUrl(f),
      filename: f.originalname,
      publicId: f.filename,
      caption: '',
      size: f.size,
      resourceType: f.resourceType || 'image'
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
    const deletedUrl = img.url;
    // Remove the stored file (Cloudinary asset or local disk file)
    await deleteStoredFile(img.url, img.publicId, img.resourceType);
    img.deleteOne();
    // Reset cover if deleted
    if (album.coverImage === deletedUrl) {
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
    // Delete all stored files (Cloudinary assets or local disk files)
    for (const img of album.images) {
      await deleteStoredFile(img.url, img.publicId, img.resourceType);
    }
    await album.deleteOne();
    res.json({ message: 'Album deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
