const router = require("express").Router();
// const mongoose = require("mongoose");
// const { protect, adminOnly } = require("../middleware/auth");
const Testimony = require("../models/Testimony");
const { protect, adminOnly } = require("../middleware/auth");

// const testimonySchema = new mongoose.Schema(
//   {
//     name: { type: String, default: "Anonymous" },
//     title: { type: String, required: true },
//     story: { type: String, required: true },
//     category: { type: String, default: "General Testimony" },
//     anonymous: { type: Boolean, default: false },
//     approved: { type: Boolean, default: false },
//   },
//   { timestamps: true },
// );

// const Testimony = mongoose.model("Testimony", testimonySchema);

router.get("/", async (req, res) => {
  try {
    const items = await Testimony.find({ approved: true }).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const items = await Testimony.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    if (req.body.website || req.body.honeypot) return res.status(400).json({ message: "Unable to accept this submission." });
    if (req.body.consentConfirmed !== true) return res.status(400).json({ message: "Please confirm that you have permission to share this testimony." });
    const title = String(req.body.title || '').trim();
    const story = String(req.body.story || '').trim();
    if (title.length < 3 || title.length > 180 || story.length < 20 || story.length > 6000) return res.status(400).json({ message: "Please provide a valid testimony title and story." });
    const t = await Testimony.create({ ...req.body, title, story, moderationStatus: 'pending', approved: false, moderationNote: '' });
    res.status(201).json(t);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id/approve", protect, adminOnly, async (req, res) => {
  try {
    const t = await Testimony.findByIdAndUpdate(
      req.params.id,
      { approved: true, moderationStatus: 'approved', moderationNote: String(req.body.note || '').trim().slice(0, 1000), moderatedAt: new Date(), moderatedBy: req.user._id },
      { new: true, runValidators: true },
    );
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/reject", protect, adminOnly, async (req, res) => {
  try {
    const t = await Testimony.findByIdAndUpdate(req.params.id, { approved: false, moderationStatus: 'rejected', moderationNote: String(req.body.note || '').trim().slice(0, 1000), moderatedAt: new Date(), moderatedBy: req.user._id }, { new: true, runValidators: true });
    if (!t) return res.status(404).json({ message: 'Testimony not found' });
    res.json(t);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Testimony.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
