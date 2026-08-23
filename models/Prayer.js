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
    moderationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    moderationNote: { type: String, default: '' },
    moderatedAt: { type: Date },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answered: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Prayer", prayerSchema);
