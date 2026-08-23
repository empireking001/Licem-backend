const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  source: { type: String, default: 'homepage' },
  active: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);
