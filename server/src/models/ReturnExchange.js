const mongoose = require('mongoose');

const returnExchangeSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['RETURN_REFUND', 'EXCHANGE_REPLACEMENT'],
      default: 'RETURN_REFUND',
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
        refundAmount: { type: Number, default: 0 },
      },
    ],
    reason: {
      type: String,
      default: 'Damaged seal or freshness issue',
    },
    replacementProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'APPROVED', 'APPROVED_FOR_DISPATCH', 'REFUND_COMPLETED', 'REJECTED'],
      default: 'REQUESTED',
    },
    refundDetails: {
      refundedAmount: Number,
      refundTransactionId: String,
      processedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ReturnExchange ||
  mongoose.models.ReturnTicket ||
  mongoose.model('ReturnExchange', returnExchangeSchema);