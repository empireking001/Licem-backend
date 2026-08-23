const mongoose = require('mongoose');

const radioSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  lastSeenAt: { type: Date, default: Date.now, index: true },
  startedAt: { type: Date, default: Date.now },
  userAgent: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('RadioSession', radioSessionSchema);
