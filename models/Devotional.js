const mongoose = require('mongoose');

const devotionalSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  scripture: { type: String, default: '' },
  body: { type: String, required: true },
  author: { type: String, default: '' },
  coverUrl: { type: String, default: '' },
  publishAt: { type: Date, required: true },
  skipPublication: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'scheduled', 'published'], default: 'draft' },
  source: { type: String, enum: ['admin', 'ai-draft'], default: 'admin' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

devotionalSchema.index({ publishAt: 1, status: 1, skipPublication: 1 });
module.exports = mongoose.model('Devotional', devotionalSchema);
