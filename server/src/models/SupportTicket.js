const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderRole: {
    type: String,
    enum: ['CUSTOMER', 'STAFF', 'ADMIN'],
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      default: () => `SUP-${Date.now().toString().slice(-6)}`,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: String,
    userEmail: String,
    category: {
      type: String,
      default: 'GENERAL',
    },
    subject: {
      type: String,
      default: 'Customer Inquiry',
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
      default: 'OPEN',
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);