const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  slug:        { type: String, unique: true },
  author:      { type: String, required: true },
  content:     { type: String, default: '' },
  excerpt:     { type: String, default: '' },
  image:       { type: String, default: '' },
  category:    { type: String, enum: ['Devotional', 'Teaching', 'Family', 'Prayer', 'Leadership', 'Testimony', 'News'], default: 'Devotional' },
  tags:        [{ type: String }],
  status:      { type: String, enum: ['Published', 'Draft'], default: 'Draft' },
  views:       { type: Number, default: 0 },
  metaTitle:   { type: String, default: '' },
  metaDesc:    { type: String, default: '' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

postSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
