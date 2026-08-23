const mongoose = require("mongoose");

const prayerSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Anonymous" },
    request: { type: String, required: true },
    category: { type: String, default: "General" },
    anonymous: { type: Boolean, default: false },
    prayerCount: { type: Number, default: 0 },
    prayedBy: [{ type: String }],
    approved: { type: Boolean, default: false },
    answered: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Prayer", prayerSchema);
