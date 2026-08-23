const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema(
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
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        refundAmount: {
          type: Number,
          required: true,
        },
      },
    ],
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'REQUESTED',
        'APPROVED',
        'OUT_FOR_PICKUP_SWAP',
        'REFUND_COMPLETED',
        'REPLACEMENT_DELIVERED',
        'REJECTED',
      ],
      default: 'REQUESTED',
    },
    // Replacement Product (For Exchanges)
    replacementProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    // Financial & Inventory Settlement Data
    refundDetails: {
      refundMethod: {
        type: String,
        enum: ['ORIGINAL_SOURCE', 'WALLET_CREDIT', 'NONE'],
        default: 'ORIGINAL_SOURCE',
      },
      refundTransactionId: String,
      refundedAmount: Number,
      refundTimestamp: Date,
    },
    inventoryAction: {
      type: String,
      enum: ['RESTOCKED_TO_INVENTORY', 'WRITTEN_OFF_DAMAGED', 'RESERVED_FOR_SWAP'],
      default: 'RESTOCKED_TO_INVENTORY',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolutionNotes: String,
  },
  { timestamps: true }
);

const Return = mongoose.model('Return', returnSchema);
module.exports = { Return };