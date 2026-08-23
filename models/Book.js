const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, default: '', trim: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'General', trim: true },
  coverUrl: { type: String, default: '' },
  resourceUrl: { type: String, required: true },
  resourceType: { type: String, enum: ['pdf', 'doc', 'docx', 'link'], default: 'link' },
  fileName: { type: String, default: '' },
  published: { type: Boolean, default: true },
  downloads: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
