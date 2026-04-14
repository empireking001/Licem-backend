const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");
const Connect = require("../models/Connect");

router.post("/", async (req, res) => {
  try {
    const card = await Connect.create(req.body);
    res.status(201).json({ message: "Connect card submitted!", card });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const cards = await Connect.find().sort({ createdAt: -1 });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/followup", protect, adminOnly, async (req, res) => {
  try {
    const card = await Connect.findByIdAndUpdate(
      req.params.id,
      { followedUp: true },
      { new: true },
    );
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
