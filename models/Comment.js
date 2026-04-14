const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true },
  text:       { type: String, required: true },
  refType:    { type: String, enum: ['Sermon', 'Post', 'Event', 'Gallery'], required: true },
  refId:      { type: mongoose.Schema.Types.ObjectId, required: true },
  refTitle:   { type: String, default: '' },
  approved:   { type: Boolean, default: false },
  spam:       { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
