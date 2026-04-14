const mongoose = require("mongoose");

const testimonySchema = new mongoose.Schema(
  {
    name: { type: String, default: "Anonymous" },
    title: { type: String, required: true },
    story: { type: String, required: true },
    category: { type: String, default: "General Testimony" },
    anonymous: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// This ensures we don't re-compile the model if it already exists
module.exports =
  mongoose.models.Testimony || mongoose.model("Testimony", testimonySchema);
