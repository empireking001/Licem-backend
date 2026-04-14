const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  date:        { type: Date, required: true },
  time:        { type: String, required: true },
  location:    { type: String, required: true },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
  category:    { type: String, enum: ['Special Service', 'Youth', 'Prayer', 'Outreach', 'Conference', 'Fellowship', 'Other'], default: 'Special Service' },
  rsvps:       [{ name: String, email: String, phone: String, createdAt: { type: Date, default: Date.now } }],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
