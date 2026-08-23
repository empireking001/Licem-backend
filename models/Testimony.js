const mongoose = require("mongoose");

const testimonySchema = new mongoose.Schema(
  {
    name: { type: String, default: "Anonymous" },
    title: { type: String, required: true },
    story: { type: String, required: true },
    category: { type: String, default: "General Testimony" },
    anonymous: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
    moderationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    moderationNote: { type: String, default: '' },
    moderatedAt: { type: Date },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    consentConfirmed: { type: Boolean, default: false },
    permissionNotes: { type: String, default: "" },
  },
  { timestamps: true },
);

// This ensures we don't re-compile the model if it already exists
module.exports =
  mongoose.models.Testimony || mongoose.model("Testimony", testimonySchema);
