const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Helper: set upload folder
const mediaUpload = (req, res, next) => {
  req.uploadFolder = path.join(__dirname, '../uploads/media');
  next();
};

// GET /api/media  - list all uploaded media files
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const mediaDir = path.join(__dirname, '../uploads/media');
    if (!fs.existsSync(mediaDir)) return res.json([]);
    const files = fs.readdirSync(mediaDir).map(filename => {
      const stat = fs.statSync(path.join(mediaDir, filename));
      return {
        filename,
        url: `/uploads/media/${filename}`,
        size: stat.size,
        uploadedAt: stat.birthtime
      };
    });
    res.json(files.reverse());
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/media/upload
router.post('/upload', protect, adminOnly, mediaUpload, upload.array('files', 20), (req, res) => {
  try {
    const uploaded = req.files.map(f => ({
      filename: f.filename,
      originalName: f.originalname,
      url: `/uploads/media/${f.filename}`,
      size: f.size,
      mimetype: f.mimetype
    }));
    res.json({ message: `${uploaded.length} file(s) uploaded`, files: uploaded });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/media/:filename
router.delete('/:filename', protect, adminOnly, (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads/media', req.params.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: 'File deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
