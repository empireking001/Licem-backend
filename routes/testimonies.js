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
    const t = await Testimony.create(req.body);
    res.status(201).json(t);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id/approve", protect, adminOnly, async (req, res) => {
  try {
    const t = await Testimony.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true },
    );
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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
