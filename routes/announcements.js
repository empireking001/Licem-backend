const router = require("express").Router();
const mongoose = require("mongoose");
const { protect, adminOnly } = require("../middleware/auth");

const announcementSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Announcement = mongoose.model("Announcement", announcementSchema);

router.get("/", async (req, res) => {
  try {
    const items = await Announcement.find({ active: true }).sort({
      order: 1,
      createdAt: -1,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const items = await Announcement.find().sort({ order: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const a = await Announcement.create(req.body);
    res.status(201).json(a);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const a = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(a);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
