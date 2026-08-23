const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    grandTotal: {
      type: Number,
      required: true,
    },
    fulfillmentType: {
      type: String,
      enum: ['HOME_DELIVERY', 'STORE_PICKUP'],
      default: 'HOME_DELIVERY',
    },
    status: {
      type: String,
      enum: [
        'PLACED',
        'CONFIRMED',
        'PREPARING',
        'READY_FOR_PICKUP',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'PLACED',
    },
    tracking: {
      assignedRiderName: { type: String, default: 'D-MartX Express Executive' },
      assignedRiderPhone: { type: String, default: '+91 98765 43210' },
      estimatedMinutes: { type: Number, default: 20 },
      currentMilestone: { type: String, default: 'Order Placed at Dark Store' },
      timeline: [
        {
          status: String,
          title: String,
          description: String,
          timestamp: { type: Date, default: Date.now },
        },
      ],
    },
    paymentDetails: {
      method: { type: String, default: 'UPI' },
      status: { type: String, default: 'PAID' },
      transactionId: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);