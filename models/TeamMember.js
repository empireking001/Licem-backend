const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, required: true, trim: true, maxlength: 160 },
    bio: { type: String, default: '', trim: true, maxlength: 800 },
    image: { type: String, default: '', trim: true },
    sortOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    consentConfirmed: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

teamMemberSchema.index({ published: 1, sortOrder: 1, createdAt: 1 });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
