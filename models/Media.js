const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true }, // storage id (Cloudinary public_id or disk filename)
    originalName: { type: String, default: "" },
    url: { type: String, required: true },
    size: { type: Number, default: 0 },
    mimetype: { type: String, default: "" },
    resourceType: { type: String, default: "auto" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Media || mongoose.model("Media", mediaSchema);
