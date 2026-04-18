const mongoose = require("mongoose");

const connectSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    gender: { type: String },
    ageGroup: { type: String },
    maritalStatus: { type: String },
    birthday: { type: Number },
    birthMonth: { type: Number },
    visitType: { type: String, default: "First Time" },
    howHeard: { type: String },
    interests: [{ type: String }],
    prayerNeeds: { type: String },
    followedUp: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Connect || mongoose.model("Connect", connectSchema);
