const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  name:      { type: String, default: 'Anonymous' },
  email:     { type: String, default: '' },
  amount:    { type: Number, required: true },
  type:      { type: String, enum: ['Tithe', 'Offering', 'Building Fund', 'Mission Support', 'Welfare', 'Other'], default: 'Offering' },
  method:    { type: String, enum: ['Card', 'Transfer', 'Cash', 'USSD'], default: 'Card' },
  reference: { type: String, default: '' },
  status:    { type: String, enum: ['Pending', 'Confirmed', 'Failed'], default: 'Confirmed' },
  note:      { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
