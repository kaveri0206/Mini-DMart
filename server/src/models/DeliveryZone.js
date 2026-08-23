const mongoose = require('mongoose');

const deliveryZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    minDistanceKm: { type: Number, required: true, min: 0 },
    maxDistanceKm: { type: Number, required: true },
    fee: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeliveryZone', deliveryZoneSchema);