const router = require("express").Router();
const Message = require("../models/ContactMessage");
const { protect, adminOnly } = require("../middleware/auth");

// Public: submit a message
router.post("/", async (req, res) => {
  try {
    const msg = await Message.create(req.body);
    res.status(201).json({ message: "Message sent successfully!", data: msg });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: get all messages
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: mark as read
router.put("/:id/read", protect, adminOnly, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true },
    );
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: delete message
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
