const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  url:       { type: String, required: true },
  filename:  { type: String, default: '' },
  caption:   { type: String, default: '' },
  size:      { type: Number, default: 0 },
  uploadedAt:{ type: Date, default: Date.now }
});

const gallerySchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  group:       { 
    type: String, 
    enum: [
      'Sunday Service', 'Youth Ministry', "Women's Fellowship", 
      "Men's Group", "Children's Church", 'Outreach', 
      'Special Events', 'Conferences', 'Weddings & Dedications',
      'Missions', 'Choir & Worship', 'General'
    ], 
    default: 'General' 
  },
  coverImage:  { type: String, default: '' },
  images:      [galleryImageSchema],
  published:   { type: Boolean, default: true },
  eventDate:   { type: Date },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
