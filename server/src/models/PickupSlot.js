const mongoose = require('mongoose');

const pickupSlotSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    capacity: { type: Number, required: true, default: 15 },
    bookedCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

pickupSlotSchema.index({ date: 1, startTime: 1, endTime: 1 }, { unique: true });

module.exports = mongoose.model('PickupSlot', pickupSlotSchema);