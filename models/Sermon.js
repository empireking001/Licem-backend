const mongoose = require('mongoose');

const sermonSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  speaker:     { type: String, required: true },
  date:        { type: Date, required: true },
  category:    { type: String, enum: ['Sunday Service', 'Special Program', 'Midweek', 'Youth Service', 'Prayer Service'], default: 'Sunday Service' },
  videoUrl:    { type: String, default: '' },
  audioUrl:    { type: String, default: '' },
  thumbnail:   { type: String, default: '' },
  description: { type: String, default: '' },
  pinned:      { type: Boolean, default: false },
  featured:    { type: Boolean, default: false },
  views:       { type: Number, default: 0 },
  likes:       { type: Number, default: 0 },
  likedBy:     [{ type: String }],
  tags:        [{ type: String }],
  rightsConfirmed: { type: Boolean, default: false },
  rightsHolder: { type: String, default: '' },
  permissionNotes: { type: String, default: '' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Sermon', sermonSchema);
