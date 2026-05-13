const mongoose = require('mongoose');

const loadSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: { type: String, required: true },
  ownerPhone: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  material: { type: String, required: true },
  weight: { type: String, required: true },
  vehicle: { type: String, required: true },
  amount: { type: String, required: true },
  notes: { type: String },
  distance: { type: String },
  status: { type: String, enum: ['Pending', 'Accepted', 'In Transit', 'Completed', 'Cancelled'], default: 'Pending' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driverName: { type: String },
  driverPhone: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Load', loadSchema);
