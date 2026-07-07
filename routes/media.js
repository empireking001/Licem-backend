const router = require("express").Router();
const Media = require("../models/Media");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { getFileUrl, deleteStoredFile } = require("../middleware/upload");

// Helper: set upload folder (simple name — resolved by the upload middleware)
const mediaUpload = (req, res, next) => {
  req.uploadFolder = "media";
  next();
};

// GET /api/media - list all uploaded media files (from DB, works with Cloudinary)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const files = await Media.find().sort({ createdAt: -1 });
    res.json(
      files.map((f) => ({
        _id: f._id,
        filename: f.filename,
        originalName: f.originalName,
        url: f.url,
        size: f.size,
        mimetype: f.mimetype,
        uploadedAt: f.createdAt,
      })),
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/media/upload
router.post(
  "/upload",
  protect,
  adminOnly,
  mediaUpload,
  upload.array("files", 20),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      const docs = await Media.insertMany(
        req.files.map((f) => ({
          filename: f.filename,
          originalName: f.originalname,
          url: getFileUrl(f),
          size: f.size,
          mimetype: f.mimetype,
          uploadedBy: req.user._id,
        })),
      );
      res.json({
        message: `${docs.length} file(s) uploaded`,
        files: docs,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

// DELETE /api/media/:id  (falls back to filename lookup for old entries)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    let doc = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      doc = await Media.findById(id);
    }
    if (!doc) {
      doc = await Media.findOne({ filename: id });
    }
    if (doc) {
      await deleteStoredFile(doc.url, doc.filename);
      await doc.deleteOne();
    } else {
      // Legacy local file with no DB record
      await deleteStoredFile(`/uploads/media/${id}`, null);
    }
    res.json({ message: "File deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
